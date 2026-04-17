/**
 * Ekstraksi data GPS & waktu dari EXIF metadata foto.
 * Mendukung foto dari aplikasi GPS Camera (Timestamp Camera, GPS Map Camera, dll).
 *
 * Flow: EXIF geotag → filename parse → OCR watermark (bottom / right region).
 */
import exifr from 'exifr';
import { createWorker } from 'tesseract.js';

// ─── OCR Worker (singleton, lazy) ────────────────────────────────────────────

let ocrWorker: any = null;
let ocrInitPromise: Promise<any> | null = null;

/** Pre-warm OCR worker in background so it's instant when needed */
export function preloadOcrWorker() {
  if (!ocrInitPromise) ocrInitPromise = initWorker();
}

async function initWorker() {
  const w = await createWorker();
  await w.loadLanguage('eng');
  await w.initialize('eng');
  ocrWorker = w;
  return w;
}

async function getOcrWorker() {
  if (ocrWorker) return ocrWorker;
  if (!ocrInitPromise) ocrInitPromise = initWorker();
  return ocrInitPromise;
}

// ─── Canvas helpers ──────────────────────────────────────────────────────────

const MAX_OCR_DIM = 1200;

/** Load image from File */
async function loadImg(file: File): Promise<HTMLImageElement> {
  const img = document.createElement('img');
  const url = URL.createObjectURL(file);
  img.src = url;
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('img load fail')); });
  URL.revokeObjectURL(url);
  return img;
}

/**
 * Crop a region from the image and return a downscaled canvas.
 * region: 'bottom-right' | 'bottom' | 'right' | 'full'
 */
function cropRegion(img: HTMLImageElement, region: 'bottom-right' | 'bottom' | 'right' | 'full'): HTMLCanvasElement {
  const W = img.naturalWidth;
  const H = img.naturalHeight;

  let sx = 0, sy = 0, sw = W, sh = H;
  switch (region) {
    case 'bottom-right': sx = Math.round(W * 0.4); sy = Math.round(H * 0.55); sw = W - sx; sh = H - sy; break;
    case 'bottom':       sy = Math.round(H * 0.65); sh = H - sy; break;
    case 'right':        sx = Math.round(W * 0.5);  sw = W - sx; break;
    case 'full':         break;
  }

  // Downscale for speed — keep max dim ≤ MAX_OCR_DIM
  const maxDim = Math.max(sw, sh);
  const scale = maxDim > MAX_OCR_DIM ? MAX_OCR_DIM / maxDim : 1;
  const outW = Math.round(sw * scale);
  const outH = Math.round(sh * scale);

  const c = document.createElement('canvas');
  c.width = outW; c.height = outH;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
  return c;
}

function normalizeOcrText(text: string): string {
  return text
    .replace(/[oO]/g, '0')
    .replace(/[lI|]/g, '1')
    .replace(/[Ss](?=\d+[.,]\d{3,})/g, 'S')
    .replace(/[Ee](?=\d+[.,]\d{3,})/g, 'E')
    .replace(/\s+/g, ' ')
    .trim();
}

function rotateCanvas(source: HTMLCanvasElement, degrees: 0 | 90 | 180 | 270): HTMLCanvasElement {
  if (degrees === 0) return source;
  const out = document.createElement('canvas');
  const swap = degrees === 90 || degrees === 270;
  out.width = swap ? source.height : source.width;
  out.height = swap ? source.width : source.height;
  const ctx = out.getContext('2d')!;
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return out;
}

function preprocessCanvas(source: HTMLCanvasElement, mode: 'raw' | 'contrast' | 'threshold'): HTMLCanvasElement {
  if (mode === 'raw') return source;
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(source, 0, 0);

  const img = ctx.getImageData(0, 0, out.width, out.height);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (mode === 'contrast') {
      const contrasted = Math.max(0, Math.min(255, (gray - 128) * 2.2 + 128));
      data[i] = contrasted;
      data[i + 1] = contrasted;
      data[i + 2] = contrasted;
    } else {
      const thresholded = gray > 170 ? 255 : 0;
      data[i] = thresholded;
      data[i + 1] = thresholded;
      data[i + 2] = thresholded;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

function isLikelyIndonesiaCoordinate(lat: number, lng: number): boolean {
  return lat >= -12 && lat <= 8 && lng >= 94 && lng <= 142;
}

// ─── GPS text parsing (from OCR output or filename) ──────────────────────────

/**
 * Parse GPS coordinates from text.
 * Handles formats:
 *   8.3861656S 112.77328952E
 *   S 8.3861656 E 112.77328952
 *   -8.386165, 112.773289
 */
function parseGpsFromText(text: string): { lat: string; lng: string } | null {
  // Keep digits, dots, minus, NSEW, spaces, commas
  const clean = text.replace(/[oO]/g, '0') // common OCR: 'O' → '0'
    .replace(/[lI|]/g, '1');                // common OCR: 'l','I','|' → '1'

  // Pattern A: 8.386S 112.773E  (number then direction)
  const pA = /(\d+[.,]\d{3,})\s*([NSns])\s+(\d+[.,]\d{3,})\s*([EWew])/;
  const mA = clean.match(pA);
  if (mA) {
    let lat = parseFloat(mA[1].replace(',', '.'));
    let lng = parseFloat(mA[3].replace(',', '.'));
    if (mA[2].toUpperCase() === 'S') lat = -lat;
    if (mA[4].toUpperCase() === 'W') lng = -lng;
    return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
  }

  // Pattern B: S8.386 E112.773 (direction then number)
  const pB = /([NSns])\s*(\d+[.,]\d{3,})\s+([EWew])\s*(\d+[.,]\d{3,})/;
  const mB = clean.match(pB);
  if (mB) {
    let lat = parseFloat(mB[2].replace(',', '.'));
    let lng = parseFloat(mB[4].replace(',', '.'));
    if (mB[1].toUpperCase() === 'S') lat = -lat;
    if (mB[3].toUpperCase() === 'W') lng = -lng;
    return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
  }

  // Pattern C: -8.386165, 112.773289  (signed decimal pair)
  const pC = /(-?\d+[.,]\d{4,})\s*[,\s]\s*(-?\d+[.,]\d{4,})/;
  const mC = clean.match(pC);
  if (mC) {
    return {
      lat: parseFloat(mC[1].replace(',', '.')).toFixed(6),
      lng: parseFloat(mC[2].replace(',', '.')).toFixed(6),
    };
  }

  // Pattern D: DMS — 8°23'10.2"S 112°46'23.8"E
  const pD = /(\d{1,3})\s*[°º]\s*(\d{1,2})\s*[''′]\s*([\d.,]+)\s*[""″]?\s*([NSns])\s+(\d{1,3})\s*[°º]\s*(\d{1,2})\s*[''′]\s*([\d.,]+)\s*[""″]?\s*([EWew])/;
  const mD = clean.match(pD);
  if (mD) {
    let lat = parseInt(mD[1]) + parseInt(mD[2]) / 60 + parseFloat(mD[3].replace(',', '.')) / 3600;
    let lng = parseInt(mD[5]) + parseInt(mD[6]) / 60 + parseFloat(mD[7].replace(',', '.')) / 3600;
    if (mD[4].toUpperCase() === 'S') lat = -lat;
    if (mD[8].toUpperCase() === 'W') lng = -lng;
    return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
  }

  // Pattern E: shorter decimal with at least 3 digits (some cameras)
  const pE = /(-?\d+[.,]\d{3,})\s*[,\s]\s*(-?\d+[.,]\d{3,})/;
  const mE = clean.match(pE);
  if (mE) {
    return {
      lat: parseFloat(mE[1].replace(',', '.')).toFixed(6),
      lng: parseFloat(mE[2].replace(',', '.')).toFixed(6),
    };
  }

  return null;
}

function parseGpsFromOverlayText(text: string): { lat: string; lng: string } | null {
  const clean = normalizeOcrText(text);
  const toResult = (lat: number, lng: number) => {
    if (!isLikelyIndonesiaCoordinate(lat, lng)) return null;
    return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
  };

  const patterns = [
    /(\d+[.,]\d{4,})\s*([NSns])\s*(\d+[.,]\d{4,})\s*([EWew])/,
    /([NSns])\s*(\d+[.,]\d{4,})\s*([EWew])\s*(\d+[.,]\d{4,})/,
    /(-?\d+[.,]\d{4,})\s*[,\s]\s*(-?\d+[.,]\d{4,})/,
  ] as const;

  const m0 = clean.match(patterns[0]);
  if (m0) {
    let lat = parseFloat(m0[1].replace(',', '.'));
    let lng = parseFloat(m0[3].replace(',', '.'));
    if (m0[2].toUpperCase() === 'S') lat = -lat;
    if (m0[4].toUpperCase() === 'W') lng = -lng;
    return toResult(lat, lng);
  }

  const m1 = clean.match(patterns[1]);
  if (m1) {
    let lat = parseFloat(m1[2].replace(',', '.'));
    let lng = parseFloat(m1[4].replace(',', '.'));
    if (m1[1].toUpperCase() === 'S') lat = -lat;
    if (m1[3].toUpperCase() === 'W') lng = -lng;
    return toResult(lat, lng);
  }

  const m2 = clean.match(patterns[2]);
  if (m2) {
    return toResult(
      parseFloat(m2[1].replace(',', '.')),
      parseFloat(m2[2].replace(',', '.'))
    );
  }

  return parseGpsFromText(clean);
}

function parseDateTimeFromOverlayText(text: string): { tanggal: string; waktu: string } | null {
  const clean = normalizeOcrText(text);
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };

  const m1 = clean.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (m1) {
    const day = m1[1].padStart(2, '0');
    const month = monthMap[m1[2].slice(0, 3).toLowerCase()] ?? '01';
    const year = m1[3];
    let hour = parseInt(m1[4], 10);
    const minute = m1[5];
    const meridiem = m1[7]?.toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return { tanggal: `${year}-${month}-${day}`, waktu: `${String(hour).padStart(2, '0')}:${minute}` };
  }

  const m2 = clean.match(/(\d{4})[/-](\d{2})[/-](\d{2})\s+(\d{1,2}):(\d{2})/);
  if (m2) {
    return { tanggal: `${m2[1]}-${m2[2]}-${m2[3]}`, waktu: `${m2[4].padStart(2, '0')}:${m2[5]}` };
  }

  return null;
}

// ─── EXIF extraction ─────────────────────────────────────────────────────────

export interface ExifGpsResult {
  lat: string;
  lng: string;
  tanggal: string;       // YYYY-MM-DD
  waktu: string;         // HH:MM
  altitude?: number;
  accuracy?: number;
  source?: 'exif' | 'filename' | 'ocr';
  raw?: Record<string, unknown>;
}

export async function extractGpsFromPhoto(file: File): Promise<ExifGpsResult | null> {
  try {
    // Method 1: exifr.gps() — returns {latitude, longitude} directly
    let lat: number | null = null;
    let lng: number | null = null;
    let altitude: number | undefined;
    let accuracy: number | undefined;
    let dateVal: unknown;

    try {
      const gps = await exifr.gps(file);
      if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        lat = gps.latitude;
        lng = gps.longitude;
      }
    } catch { /* exifr.gps can throw on some files */ }

    // Method 2: exifr.parse() — more fields, manual conversion
    let exif: any = null;
    try {
      exif = await exifr.parse(file, {
        gps: true,
        pick: [
          'GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef',
          'GPSAltitude', 'GPSHPositioningError',
          'DateTimeOriginal', 'CreateDate', 'ModifyDate',
          'latitude', 'longitude',
        ],
      });
    } catch { /* parse can also throw */ }

    if (lat == null || lng == null) {
      if (exif) {
        // Try pre-computed lat/lng
        if (typeof exif.latitude === 'number') lat = exif.latitude;
        if (typeof exif.longitude === 'number') lng = exif.longitude;

        // Try raw GPS arrays [deg, min, sec]
        if (lat == null && exif.GPSLatitude) {
          lat = dmsToDecimal(exif.GPSLatitude);
          if (lat != null && typeof exif.GPSLatitudeRef === 'string' && exif.GPSLatitudeRef.toUpperCase() === 'S') {
            lat = -Math.abs(lat);
          }
        }
        if (lng == null && exif.GPSLongitude) {
          lng = dmsToDecimal(exif.GPSLongitude);
          if (lng != null && typeof exif.GPSLongitudeRef === 'string' && exif.GPSLongitudeRef.toUpperCase() === 'W') {
            lng = -Math.abs(lng);
          }
        }
      }
    }

    if (exif) {
      altitude = typeof exif.GPSAltitude === 'number' ? exif.GPSAltitude : undefined;
      accuracy = typeof exif.GPSHPositioningError === 'number' ? exif.GPSHPositioningError : undefined;
      dateVal = exif.DateTimeOriginal ?? exif.CreateDate ?? exif.ModifyDate;
    }

    if (lat == null || lng == null) return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    let tanggal = '';
    let waktu = '';
    if (dateVal instanceof Date) {
      tanggal = dateVal.toISOString().split('T')[0];
      waktu = dateVal.toTimeString().slice(0, 5);
    } else if (typeof dateVal === 'string') {
      const cleaned = dateVal.replace(/:/g, '-');
      const parts = cleaned.split(' ');
      if (parts[0]) tanggal = parts[0].slice(0, 10);
      if (parts[1]) waktu = parts[1].slice(0, 5);
    }

    return {
      lat: lat.toFixed(6), lng: lng.toFixed(6),
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      waktu, altitude, accuracy, source: 'exif',
      raw: exif ?? undefined,
    };
  } catch (err) {
    console.warn('[ExifGPS] EXIF gagal:', err);
    return null;
  }
}

/** Convert DMS array [deg, min, sec] or single number to decimal */
function dmsToDecimal(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (Array.isArray(val)) {
    const nums = val.map(Number).filter(n => Number.isFinite(n));
    if (nums.length === 1) return nums[0];
    if (nums.length === 2) return nums[0] + nums[1] / 60;
    if (nums.length >= 3) return nums[0] + nums[1] / 60 + nums[2] / 3600;
  }
  return null;
}

// ─── Filename parsing ────────────────────────────────────────────────────────

export function parseGpsFromFilename(filename: string): { lat: string; lng: string } | null {
  return parseGpsFromOverlayText(filename);
}

// ─── OCR extraction ──────────────────────────────────────────────────────────

/**
 * OCR GPS from photo watermark. Scans multiple regions for speed:
 * 1. Bottom-right corner (most GPS Camera watermarks)
 * 2. Right half (vertical watermarks)
 * 3. Bottom 35%
 * 4. Full image (fallback — catches all watermark positions)
 */
export async function extractGpsFromImageText(file: File): Promise<ExifGpsResult | null> {
  try {
    const worker = await getOcrWorker();
    const img = await loadImg(file);

    // Scan regions in order of likelihood — stop at first hit
    // Include 'full' as final fallback to catch watermarks anywhere in the image
    const regions: Array<'bottom-right' | 'right' | 'bottom' | 'full'> = ['bottom-right', 'right', 'bottom', 'full'];
    const rotations: Array<0 | 90 | 180 | 270> = [0, 90, 270, 180];
    const modes: Array<'raw' | 'contrast' | 'threshold'> = ['raw', 'contrast', 'threshold'];

    for (const region of regions) {
      const baseCanvas = cropRegion(img, region);
      for (const rotation of rotations) {
        const rotated = rotateCanvas(baseCanvas, rotation);
        for (const mode of modes) {
          const canvas = preprocessCanvas(rotated, mode);
          const { data } = await worker.recognize(canvas);
          const text = data.text || '';
          const gps = parseGpsFromOverlayText(text);
          if (gps) {
            const dateTime = parseDateTimeFromOverlayText(text);
            return {
              ...gps,
              tanggal: dateTime?.tanggal || new Date().toISOString().split('T')[0],
              waktu: dateTime?.waktu || '',
              source: 'ocr',
            };
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.warn('[ExifGPS] OCR gagal:', err);
    return null;
  }
}

// ─── Python OCR Server (higher accuracy with OpenCV preprocessing) ──────────

const PYTHON_OCR_URL = 'http://localhost:5050/ocr';
let pythonOcrAvailable: boolean | null = null;

async function checkPythonOcr(): Promise<boolean> {
  if (pythonOcrAvailable !== null) return pythonOcrAvailable;
  try {
    const res = await fetch('http://localhost:5050/health', { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    pythonOcrAvailable = data.tesseract === true;
    if (pythonOcrAvailable) console.log('[ExifGPS] Python OCR server aktif — menggunakan OpenCV+Tesseract');
    return pythonOcrAvailable;
  } catch {
    pythonOcrAvailable = false;
    return false;
  }
}

async function extractGpsFromPythonOcr(file: File): Promise<ExifGpsResult | null> {
  try {
    const formData = new FormData();
    formData.append('photos', file);
    const res = await fetch(PYTHON_OCR_URL, { method: 'POST', body: formData, signal: AbortSignal.timeout(30000) });
    const results = await res.json();
    if (Array.isArray(results) && results.length > 0) {
      const r = results[0];
      if (r.lat && r.lng) {
        return {
          lat: r.lat, lng: r.lng,
          tanggal: new Date().toISOString().split('T')[0],
          waktu: r.waktu || '', source: 'ocr' as const,
        };
      }
      if (typeof r.text === 'string') {
        const gps = parseGpsFromOverlayText(r.text);
        if (gps) {
          const dateTime = parseDateTimeFromOverlayText(r.text);
          return {
            ...gps,
            tanggal: dateTime?.tanggal || new Date().toISOString().split('T')[0],
            waktu: dateTime?.waktu || '',
            source: 'ocr',
          };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Ekstrak GPS dari foto — coba EXIF dulu, fallback ke filename, lalu OCR.
 * Jika Python OCR server aktif (localhost:5050) → pakai OpenCV+Tesseract (lebih akurat).
 * Fallback ke Tesseract.js browser jika Python server tidak jalan.
 */
export async function extractGpsAuto(file: File): Promise<ExifGpsResult | null> {
  // 1. EXIF (fastest, most reliable)
  const exifResult = await extractGpsFromPhoto(file);
  if (exifResult) return exifResult;

  // 2. Filename
  const fromName = parseGpsFromFilename(file.name);
  if (fromName) {
    return { ...fromName, tanggal: new Date().toISOString().split('T')[0], waktu: '', source: 'filename' };
  }

  // 3. Python OCR (OpenCV preprocessing — higher accuracy)
  const hasPythonOcr = await checkPythonOcr();
  if (hasPythonOcr) {
    const pyResult = await extractGpsFromPythonOcr(file);
    if (pyResult) return pyResult;
  }

  // 4. Browser Tesseract.js OCR (fallback)
  const ocrResult = await extractGpsFromImageText(file);
  if (ocrResult) return ocrResult;

  return null;
}

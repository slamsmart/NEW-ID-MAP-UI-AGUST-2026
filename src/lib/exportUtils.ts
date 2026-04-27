/**
 * Reusable export helpers for monitoring sub-pages.
 * — `triggerBlobDownload`: low-level Blob → <a download> trick.
 * — `downloadCSV`:        array of records → CSV file.
 * — `downloadGeoJSON`:    array of features → GeoJSON file.
 *
 * Designed to be called from any page (RekomendasiLokasi, VegetasiMangrove,
 * PendaratanPenyu, …) without external dependencies.
 */

/** Common Blob → download trigger. Cleans up the Object URL after click. */
export function triggerBlobDownload(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  // Telemetry — best-effort, lazy-import to avoid Convex circular deps in tests.
  // CSV / GeoJSON dideteksi dari MIME type.
  try {
    const kind = mime.includes('geo+json')
      ? 'geojson'
      : mime.includes('csv')
        ? 'csv'
        : null;
    if (kind) {
      void import('./statsClient').then(m => m.recordDownload(kind as 'csv' | 'geojson'));
    }
  } catch {
    /* swallow */
  }
}

/** Escape a single CSV cell (RFC 4180 — quote if it contains , " \n). */
function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Convert an array of plain records into a CSV string and download it.
 * Columns are derived from the first row's keys (or `columns` if provided).
 */
export function downloadCSV<T extends object>(
  filename: string,
  rows: T[],
  columns?: Array<keyof T | { key: keyof T; label: string }>,
) {
  if (rows.length === 0) {
    alert('Tidak ada data untuk diunduh.');
    return;
  }
  const cols =
    columns?.map(c => (typeof c === 'object' ? c : { key: c, label: String(c) })) ??
    (Object.keys(rows[0]) as Array<keyof T>).map(k => ({ key: k, label: String(k) }));

  const header = cols.map(c => csvEscape(c.label)).join(',');
  const body = rows
    .map(r => cols.map(c => csvEscape(r[c.key])).join(','))
    .join('\r\n');

  // BOM so Excel reads UTF-8 properly (e.g. accented Indonesian names).
  const csv = '\uFEFF' + header + '\r\n' + body + '\r\n';
  triggerBlobDownload(filename, 'text/csv;charset=utf-8', csv);
}

/** A single GeoJSON feature builder (Point only — most common case here). */
export interface PointFeatureInput {
  lat: number;
  lng: number;
  properties: Record<string, unknown>;
}

/** Build & download a GeoJSON FeatureCollection from point features. */
export function downloadGeoJSON(filename: string, points: PointFeatureInput[]) {
  const valid = points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (valid.length === 0) {
    alert('Tidak ada titik berkoordinat valid untuk diunduh.');
    return;
  }
  const fc = {
    type: 'FeatureCollection',
    generator: 'ID-MAP · Cabdin KP Kab. Malang',
    generatedAt: new Date().toISOString(),
    features: valid.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: p.properties,
    })),
  };
  triggerBlobDownload(
    filename,
    'application/geo+json;charset=utf-8',
    JSON.stringify(fc, null, 2),
  );
}

/** YYYY-MM-DD timestamp for filenames. */
export function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

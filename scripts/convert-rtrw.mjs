/**
 * convert-rtrw.mjs
 * ─────────────────────────────────────────────────────────────
 * Konversi build-time: arsip KMZ RTRW Jawa Timur → GeoJSON.
 *
 * Tujuan: memindahkan beban unzip + parse XML + konversi KML→GeoJSON
 * dari browser (main thread) ke waktu build. Geometri & properti
 * dipertahankan 100% (tanpa simplifikasi) agar kualitas peta tidak
 * berubah — hanya format & lokasi pemrosesan yang berbeda.
 *
 * Output: public/boundaries/<nama>.geojson (JSON minified).
 *
 * Jalankan: node scripts/convert-rtrw.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { DOMParser } from '@xmldom/xmldom';
import { kml as kmlToGeoJSON } from '@tmcw/togeojson';

const __dirname = dirname(fileURLToPath(import.meta.url));
const boundariesDir = join(__dirname, '..', 'public', 'boundaries');

const KMZ_FILES = [
  'Kab. Malang.kmz',
  'Kab. Pasuruan.kmz',
  'Kota. Pasuruan.kmz',
  'Kota Surabaya.kmz',
  'Kab. Sidoarjo.kmz',
];

const formatBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

/** Baca KMZ, ekstrak KML, konversi ke FeatureCollection GeoJSON. */
async function kmzToGeoJSON(filePath) {
  const archive = await JSZip.loadAsync(readFileSync(filePath));
  const kmlEntry = Object.values(archive.files).find((file) => /\.kml$/i.test(file.name));
  if (!kmlEntry) throw new Error(`KML tidak ditemukan di dalam ${filePath}`);

  const kmlText = await kmlEntry.async('text');
  const doc = new DOMParser().parseFromString(kmlText, 'application/xml');
  // @xmldom tidak punya querySelector — pakai getElementsByTagName.
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error(`KML tidak valid di ${filePath}`);
  }

  const fc = kmlToGeoJSON(doc);

  // Buang blok `description` (HTML mentah dari KML) — tidak dipakai popup
  // (popup RTRW hanya membaca `name`/`zone`) dan memperbesar file secara
  // signifikan. Geometri & properti style (fill/stroke) dipertahankan utuh.
  for (const feature of fc.features ?? []) {
    if (feature.properties && typeof feature.properties === 'object') {
      delete feature.properties.description;
    }
  }

  return fc;
}

async function main() {
  console.log('Konversi RTRW KMZ → GeoJSON (presisi penuh, tanpa simplifikasi)\n');
  let totalKmz = 0;
  let totalJson = 0;

  for (const name of KMZ_FILES) {
    const kmzPath = join(boundariesDir, name);
    const geoJsonPath = join(boundariesDir, name.replace(/\.kmz$/i, '.geojson'));

    const kmzSize = readFileSync(kmzPath).length;
    const fc = await kmzToGeoJSON(kmzPath);
    const json = JSON.stringify(fc); // minified
    writeFileSync(geoJsonPath, json);

    const jsonSize = Buffer.byteLength(json, 'utf8');
    totalKmz += kmzSize;
    totalJson += jsonSize;
    console.log(
      `  ${name.padEnd(22)} ${formatBytes(kmzSize).padStart(10)}  →  ` +
      `${formatBytes(jsonSize).padStart(10)}  (${fc.features.length.toLocaleString('id-ID')} fitur)`,
    );
  }

  console.log('\n──────────────────────────────────────────────');
  console.log(`  Total KMZ   : ${formatBytes(totalKmz)}`);
  console.log(`  Total JSON  : ${formatBytes(totalJson)}`);
  console.log('  Selesai — GeoJSON siap disajikan (server/static host meng-gzip otomatis).');
}

main().catch((err) => {
  console.error('Konversi gagal:', err);
  process.exit(1);
});

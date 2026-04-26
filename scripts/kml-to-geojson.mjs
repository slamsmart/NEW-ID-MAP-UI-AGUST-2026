#!/usr/bin/env node
/**
 * Convert benthic KML → GeoJSON.
 *
 * Usage:
 *   1. Download KML dari Drive, simpan ke: public/benthic.kml
 *   2. Jalankan: node scripts/kml-to-geojson.mjs
 *   3. Output otomatis ke: public/benthic.geojson
 *
 * Format input KML (per Placemark):
 *   <Placemark>
 *     <ExtendedData>
 *       <SchemaData><SimpleData name="class">Seagrass</SimpleData></SchemaData>
 *     </ExtendedData>
 *     <Polygon>
 *       <outerBoundaryIs><LinearRing><coordinates>lon,lat lon,lat ...</coordinates></LinearRing></outerBoundaryIs>
 *       <innerBoundaryIs>...</innerBoundaryIs>  (optional, multiple)
 *     </Polygon>
 *   </Placemark>
 *
 * Output: GeoJSON FeatureCollection of Polygon features with `class` property.
 * Koordinat di-round ke 6 desimal (~10cm) untuk hemat ukuran file.
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT = resolve(ROOT, 'public', 'benthic.kml');
const OUTPUT = resolve(ROOT, 'public', 'benthic.geojson');
const PRECISION = 6;

function round(n) {
  return Number(n.toFixed(PRECISION));
}

function parseCoordinates(text) {
  // KML coordinates: "lon,lat[,alt] lon,lat[,alt] ..." (whitespace-separated)
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(pair => {
      const [lon, lat] = pair.split(',').map(Number);
      return [round(lon), round(lat)];
    });
}

function extractRings(polygonXml) {
  const outerMatch = polygonXml.match(
    /<outerBoundaryIs>\s*<LinearRing>\s*<coordinates>([\s\S]*?)<\/coordinates>/i,
  );
  if (!outerMatch) return null;
  const outer = parseCoordinates(outerMatch[1]);

  const inner = [];
  const innerRegex = /<innerBoundaryIs>\s*<LinearRing>\s*<coordinates>([\s\S]*?)<\/coordinates>/gi;
  let m;
  while ((m = innerRegex.exec(polygonXml)) !== null) {
    inner.push(parseCoordinates(m[1]));
  }
  return [outer, ...inner];
}

function main() {
  console.log(`[kml→geojson] reading ${INPUT}`);
  let kml;
  try {
    kml = readFileSync(INPUT, 'utf8');
  } catch (e) {
    console.error(`\n❌ File tidak ditemukan: ${INPUT}`);
    console.error(`   Download KML dari Drive, simpan ke public/benthic.kml lalu run ulang.\n`);
    process.exit(1);
  }

  const inputSizeMB = (statSync(INPUT).size / 1024 / 1024).toFixed(2);
  console.log(`[kml→geojson] input size: ${inputSizeMB} MB`);

  const features = [];
  const classCount = {};

  // Each <Placemark>...</Placemark> — non-greedy match
  const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
  let pm;
  while ((pm = placemarkRegex.exec(kml)) !== null) {
    const body = pm[1];

    // class
    const classMatch = body.match(
      /<SimpleData name="class">([^<]+)<\/SimpleData>/i,
    );
    const className = classMatch ? classMatch[1].trim() : 'Unknown';

    // polygon
    const polyMatch = body.match(/<Polygon>([\s\S]*?)<\/Polygon>/i);
    if (!polyMatch) continue;
    const rings = extractRings(polyMatch[1]);
    if (!rings || rings[0].length < 4) continue;

    features.push({
      type: 'Feature',
      properties: { class: className },
      geometry: {
        type: 'Polygon',
        coordinates: rings,
      },
    });
    classCount[className] = (classCount[className] ?? 0) + 1;
  }

  const fc = { type: 'FeatureCollection', features };
  const out = JSON.stringify(fc);
  writeFileSync(OUTPUT, out, 'utf8');

  const outSizeMB = (statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Wrote ${features.length} polygons → ${OUTPUT}`);
  console.log(`   output size: ${outSizeMB} MB (${inputSizeMB} MB input)`);
  console.log(`\n   Class distribution:`);
  Object.entries(classCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`     ${k.padEnd(15)} ${v.toLocaleString()}`));
  console.log();
}

main();

#!/usr/bin/env node
/**
 * Convert polaruang_pemanfaatan.kmz → public/polaruang.geojson
 * Usage: node scripts/convert-polaruang.mjs
 */
import { execSync } from 'node:child_process';
import { writeFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INPUT = resolve(ROOT, 'docs', 'polaruang_pemanfaatan (1).kmz');
const OUTPUT = resolve(ROOT, 'public', 'polaruang.geojson');
const PRECISION = 6;

function round(n) {
  return Number(n.toFixed(PRECISION));
}

function kmlColorToHex(kmlColor = '') {
  const c = kmlColor.trim().toLowerCase();
  if (!/^[0-9a-f]{8}$/.test(c)) return '#64748b';
  // KML: aabbggrr → #rrggbb
  return `#${c.slice(6, 8)}${c.slice(4, 6)}${c.slice(2, 4)}`;
}

function parseCoordinates(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(pair => {
      const [lon, lat] = pair.split(',').map(Number);
      return [round(lon), round(lat)];
    })
    .filter(([lon, lat]) => Number.isFinite(lon) && Number.isFinite(lat));
}

function extractRings(polygonXml) {
  const outerMatch = polygonXml.match(
    /<outerBoundaryIs>\s*<LinearRing>\s*<coordinates>([\s\S]*?)<\/coordinates>/i,
  );
  if (!outerMatch) return null;
  const outer = parseCoordinates(outerMatch[1]);
  if (outer.length < 4) return null;
  const rings = [outer];
  const innerRegex = /<innerBoundaryIs>\s*<LinearRing>\s*<coordinates>([\s\S]*?)<\/coordinates>/gi;
  let m;
  while ((m = innerRegex.exec(polygonXml)) !== null) {
    const inner = parseCoordinates(m[1]);
    if (inner.length >= 4) rings.push(inner);
  }
  return rings;
}

function parseDescriptionTable(desc = '') {
  const clean = desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&nbsp;/g, ' ');
  const fields = {};
  for (const row of clean.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td[^>]*>\s*([\s\S]*?)\s*<\/td>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    if (cells.length === 2) fields[cells[0]] = cells[1];
  }
  return fields;
}

function parseStyles(kml) {
  const styles = {};
  const re = /<Style id="([^"]+)">([\s\S]*?)<\/Style>/gi;
  let m;
  while ((m = re.exec(kml)) !== null) {
    const polyColor = m[2].match(/<PolyStyle>[\s\S]*?<color>([^<]+)<\/color>/i)?.[1];
    if (polyColor) styles[m[1]] = kmlColorToHex(polyColor);
  }
  return styles;
}

console.log(`[polaruang] reading ${INPUT}`);
const kml = execSync(`unzip -p "${INPUT}" doc.kml`, {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 512,
});

const styles = parseStyles(kml);
const features = [];
const zoneCounts = {};

const placemarkRe = /<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/gi;
let pm;
while ((pm = placemarkRe.exec(kml)) !== null) {
  const body = pm[1];
  const name = body.match(/<name>([\s\S]*?)<\/name>/i)?.[1]?.trim() ?? '';
  const desc = body.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? '';
  const fields = parseDescriptionTable(desc);
  const styleId = body.match(/<styleUrl>#([^<]+)<\/styleUrl>/i)?.[1] ?? '';
  const color = styles[styleId] ?? '#64748b';
  const zone = fields.NAMOBJ || name;
  const kodkws = fields.KODKWS ?? '';
  const jenis = fields.JNSRPR ?? 'Kawasan Pemanfaatan Umum';

  const polygons = [...body.matchAll(/<Polygon>([\s\S]*?)<\/Polygon>/gi)];
  for (const [idx, polyMatch] of polygons.entries()) {
    const rings = extractRings(polyMatch[1]);
    if (!rings) continue;
    features.push({
      type: 'Feature',
      properties: { zone, kodkws, jenis, color, part: idx + 1 },
      geometry: { type: 'Polygon', coordinates: rings },
    });
  }
  if (polygons.length > 0) zoneCounts[zone] = (zoneCounts[zone] ?? 0) + polygons.length;
}

writeFileSync(OUTPUT, JSON.stringify({ type: 'FeatureCollection', name: 'Pola Ruang Pemanfaatan', features }), 'utf8');

console.log(`✅ Wrote ${features.length} polygons → ${OUTPUT}`);
console.log(`   Size: ${(statSync(OUTPUT).size / 1024 / 1024).toFixed(2)} MB`);
console.log('\n   Zone distribution:');
for (const [z, c] of Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`     ${z.padEnd(40)} ${c}`);
}

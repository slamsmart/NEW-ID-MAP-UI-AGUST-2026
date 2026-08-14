#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { writeFileSync, statSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const INPUT_DIR = 'C:\\Users\\Organizer1\\Downloads\\KML Wilker 2024\\KML Wilker';
const OUTPUT = resolve(ROOT, 'public', 'mhi-mangrove.geojson');
const PRECISION = 6;

const INPUTS = [
  'CMC 2024.kmz',
  'Pasuruan 2024.kmz',
  'Sidoarjo 2024.kmz',
  'Surabaya 2024.kmz',
];

const COLOR_CLASS = {
  '#ff2600': 'Potential Rehabilitation Area',
  '#ffbb00': 'Poor',
  '#a4c400': 'Moderate',
  '#006100': 'Excelent',
};

const NAME_CLASS = {
  '1': 'Potential Rehabilitation Area',
  '2': 'Poor',
  '3': 'Moderate',
  '4': 'Excelent',
};

function round(n) {
  return Number(n.toFixed(PRECISION));
}

function kmlColorToHex(kmlColor = '') {
  const color = kmlColor.trim().toLowerCase();
  if (!/^[0-9a-f]{8}$/.test(color)) return '#64748b';
  const bb = color.slice(2, 4);
  const gg = color.slice(4, 6);
  const rr = color.slice(6, 8);
  return `#${rr}${gg}${bb}`;
}

function readKmzDoc(kmzPath) {
  return execFileSync('tar', ['-xOf', kmzPath, 'doc.kml'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 512,
  });
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
  let match;
  while ((match = innerRegex.exec(polygonXml)) !== null) {
    const inner = parseCoordinates(match[1]);
    if (inner.length >= 4) rings.push(inner);
  }
  return rings;
}

function parseDescriptionFields(description = '') {
  const clean = description
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&nbsp;/g, ' ');
  const fields = {};
  for (const row of clean.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const values = [...row[1].matchAll(/<td[^>]*>\s*([\s\S]*?)\s*<\/td>/gi)]
      .map(match => match[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    if (values.length === 2) {
      fields[values[0]] = values[1];
    }
  }
  return fields;
}

function parseStyles(kml) {
  const styles = {};
  const styleRegex = /<Style id="([^"]+)">([\s\S]*?)<\/Style>/gi;
  let match;
  while ((match = styleRegex.exec(kml)) !== null) {
    const polyColor = match[2].match(/<PolyStyle>[\s\S]*?<color>([^<]+)<\/color>/i)?.[1];
    if (polyColor) styles[match[1]] = kmlColorToHex(polyColor);
  }
  return styles;
}

function parseKmz(filename) {
  const sourcePath = resolve(INPUT_DIR, filename);
  const wilayah = basename(filename, '.kmz').replace(/\s+2024$/i, '');
  const kml = readKmzDoc(sourcePath);
  const styles = parseStyles(kml);
  const features = [];

  const placemarkRegex = /<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/gi;
  let placemark;
  while ((placemark = placemarkRegex.exec(kml)) !== null) {
    const body = placemark[1];
    const name = body.match(/<name>([\s\S]*?)<\/name>/i)?.[1]?.trim() ?? '';
    const description = body.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? '';
    const fields = parseDescriptionFields(description);
    const styleId = body.match(/<styleUrl>#([^<]+)<\/styleUrl>/i)?.[1] ?? '';
    const color = styles[styleId] ?? '#64748b';
    const mhiClass = fields.Indeks ?? COLOR_CLASS[color] ?? NAME_CLASS[name] ?? `MHI ${name || 'Unknown'}`;
    const gridcode = Number(fields.gridcode ?? name);
    const areaHa = Number(fields.AREA_GEO ?? fields['Luas Wilayah (ha)'] ?? 0);

    const polygons = [...body.matchAll(/<Polygon>([\s\S]*?)<\/Polygon>/gi)];
    for (const [idx, polygonMatch] of polygons.entries()) {
      const rings = extractRings(polygonMatch[1]);
      if (!rings) continue;
      features.push({
        type: 'Feature',
        properties: {
          layer: 'MHI Mangrove',
          wilayah,
          source: filename,
          name,
          part: idx + 1,
          gridcode: Number.isFinite(gridcode) ? gridcode : null,
          mhiClass,
          areaHa: Number.isFinite(areaHa) ? areaHa : null,
          color,
        },
        geometry: {
          type: 'Polygon',
          coordinates: rings,
        },
      });
    }
  }

  return features;
}

const features = INPUTS.flatMap(parseKmz);
const counts = {};
let areaTotal = 0;
for (const feature of features) {
  const key = feature.properties.mhiClass;
  counts[key] = (counts[key] ?? 0) + 1;
  if (Number.isFinite(feature.properties.areaHa)) areaTotal += feature.properties.areaHa;
}

writeFileSync(
  OUTPUT,
  JSON.stringify({
    type: 'FeatureCollection',
    name: 'MHI Mangrove Wilker Cabdin Malang 2024',
    generatedFrom: INPUTS,
    features,
  }),
  'utf8',
);

console.log(`Wrote ${features.length.toLocaleString()} MHI polygons -> ${OUTPUT}`);
console.log(`Size: ${(statSync(OUTPUT).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`Total source area: ${areaTotal.toFixed(2)} ha`);
for (const [label, count] of Object.entries(counts)) {
  console.log(`${label}: ${count.toLocaleString()} polygons`);
}

#!/usr/bin/env node
/**
 * Optimize GeoJSON: simplify geometry (Douglas-Peucker) + reduce coordinate precision
 * Usage: node scripts/optimize-geojson.mjs <input.geojson> [tolerance]
 *
 * tolerance = degrees; 0.0001 ≈ 11m, 0.0005 ≈ 55m, 0.001 ≈ 111m
 * For regional maritime maps (zoom 9-13), 0.0005 is visually identical.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const inputArg = process.argv[2];
const tolerance = parseFloat(process.argv[3] ?? '0.0005');
const precision = parseInt(process.argv[4] ?? '5');

if (!inputArg) {
  console.error('Usage: node optimize-geojson.mjs <input.geojson> [tolerance=0.0005] [precision=5]');
  process.exit(1);
}

const INPUT = resolve(inputArg);
const name = basename(INPUT, extname(INPUT));
const OUTPUT = resolve(dirname(INPUT), `${name}.geojson`);

// ── Douglas-Peucker ──────────────────────────────────────────────────────────
function perpDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(p[0] - a[0], p[1] - a[1]);
  }
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function dp(pts, tol) {
  if (pts.length <= 2) return pts;
  let maxDist = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxDist) { maxDist = d; idx = i; }
  }
  if (maxDist <= tol) return [pts[0], pts[pts.length - 1]];
  return [...dp(pts.slice(0, idx + 1), tol), ...dp(pts.slice(idx), tol).slice(1)];
}

function round(n) { return Number(n.toFixed(precision)); }

function simplifyRing(ring) {
  const simplified = dp(ring, tolerance);
  // Ensure ring is closed and has minimum 4 points
  if (simplified.length < 4) return null;
  const out = simplified.map(([lon, lat]) => [round(lon), round(lat)]);
  // Close ring if not already
  if (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1]) {
    out.push(out[0]);
  }
  return out.length >= 4 ? out : null;
}

function simplifyPolygon(coords) {
  const rings = [];
  for (const ring of coords) {
    const s = simplifyRing(ring);
    if (s) rings.push(s);
    else if (rings.length === 0) return null; // outer ring failed
  }
  return rings.length ? rings : null;
}

function simplifyGeometry(geom) {
  if (!geom) return null;
  if (geom.type === 'Polygon') {
    const coords = simplifyPolygon(geom.coordinates);
    return coords ? { type: 'Polygon', coordinates: coords } : null;
  }
  if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates.map(simplifyPolygon).filter(Boolean);
    if (!polys.length) return null;
    if (polys.length === 1) return { type: 'Polygon', coordinates: polys[0] };
    return { type: 'MultiPolygon', coordinates: polys };
  }
  return geom;
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log(`[optimize] reading ${INPUT}`);
const inSizeMB = (statSync(INPUT).size / 1024 / 1024).toFixed(2);
console.log(`[optimize] input:     ${inSizeMB} MB`);

const fc = JSON.parse(readFileSync(INPUT, 'utf8'));
let before = 0, after = 0, dropped = 0;

const features = fc.features.flatMap(f => {
  // count before
  const countVerts = geom => {
    if (!geom) return 0;
    if (geom.type === 'Polygon') return geom.coordinates.reduce((s, r) => s + r.length, 0);
    if (geom.type === 'MultiPolygon') return geom.coordinates.reduce((s, p) => s + p.reduce((ss, r) => ss + r.length, 0), 0);
    return 0;
  };
  before += countVerts(f.geometry);

  const geom = simplifyGeometry(f.geometry);
  if (!geom) { dropped++; return []; }

  after += countVerts(geom);
  return [{ type: 'Feature', properties: f.properties, geometry: geom }];
});

const out = JSON.stringify({ ...fc, features });
writeFileSync(OUTPUT, out, 'utf8');

const outSizeMB = (statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
const reduction = (100 - (statSync(OUTPUT).size / statSync(INPUT).size) * 100).toFixed(1);
const vertReduction = (100 - (after / before) * 100).toFixed(1);

console.log(`[optimize] output:    ${outSizeMB} MB  (↓${reduction}%)`);
console.log(`[optimize] vertices:  ${before.toLocaleString()} → ${after.toLocaleString()} (↓${vertReduction}%)`);
console.log(`[optimize] features:  ${fc.features.length} → ${features.length} (dropped ${dropped})`);
console.log(`[optimize] tolerance: ${tolerance}° ≈ ${Math.round(tolerance * 111320)}m`);
console.log(`✅ Saved → ${OUTPUT}`);

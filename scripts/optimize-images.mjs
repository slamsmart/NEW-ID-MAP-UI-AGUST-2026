/**
 * One-shot image optimizer.
 * Convert hero JPGs → WebP (q=80) + resize ke max width 1920px.
 * Jalankan: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const PUBLIC = resolve(process.cwd(), 'public');

const targets = [
  { in: 'hero-mangrove.jpg', out: 'hero-mangrove.webp', maxW: 1920, quality: 80 },
  { in: 'mangrove-hero.jpg', out: 'mangrove-hero.webp', maxW: 1600, quality: 80 },
];

const fmt = (b) => (b / 1024).toFixed(0) + ' KB';

for (const t of targets) {
  const inPath = resolve(PUBLIC, t.in);
  const outPath = resolve(PUBLIC, t.out);
  const before = (await stat(inPath)).size;

  await sharp(inPath)
    .resize({ width: t.maxW, withoutEnlargement: true })
    .webp({ quality: t.quality, effort: 6 })
    .toFile(outPath);

  const after = (await stat(outPath)).size;
  const saved = (((before - after) / before) * 100).toFixed(1);
  console.log(`✓ ${t.in} (${fmt(before)}) → ${t.out} (${fmt(after)})  −${saved}%`);
}

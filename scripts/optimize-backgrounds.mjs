// Generate responsive WebP variants for full-bleed background images.
// Usage: node scripts/optimize-backgrounds.mjs
// Skips variants that are already up to date (idempotent).
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = 'public/assets/optimized';

const jobs = [
  { src: 'public/assets/id-map-mangrove.jpg', name: 'hero', widths: [480, 768, 1080, 1536, 1920], quality: 72 },
  { src: 'public/assets/fitur-background.jpg', name: 'fitur', widths: [480, 768, 1080, 1536, 1920], quality: 68 },
  { src: 'public/assets/statistik-background.jpeg', name: 'statistik', widths: [480, 768, 1080, 1600], quality: 70 },
];

await mkdir(OUT_DIR, { recursive: true });

for (const job of jobs) {
  const srcMeta = await sharp(job.src).metadata();
  const srcStat = await stat(job.src);

  for (const width of job.widths) {
    if (width > srcMeta.width) continue;

    const out = path.join(OUT_DIR, `${job.name}-${width}.webp`);
    try {
      const outStat = await stat(out);
      if (outStat.mtimeMs >= srcStat.mtimeMs) {
        console.log(`skip  ${out}`);
        continue;
      }
    } catch {
      // target does not exist yet — generate it
    }

    await sharp(job.src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: job.quality })
      .toFile(out);

    const size = (await stat(out)).size;
    console.log(`write ${out} (${(size / 1024).toFixed(0)} KB)`);
  }
}

console.log('done');

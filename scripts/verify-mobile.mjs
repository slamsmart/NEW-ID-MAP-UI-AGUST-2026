/**
 * verify-mobile.mjs — verifikasi mobile-friendly otomatis.
 *
 * Untuk tiap route publik & ukuran layar: buka halaman, cek overflow
 * horizontal (scrollWidth > innerWidth) dan error console/page.
 *
 * Jalankan: node scripts/verify-mobile.mjs   (dev server harus berjalan)
 */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';

const BASE = 'http://localhost:5000';

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  process.env.PROGRAMFILES + '/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

const VIEWPORTS = [
  { name: 'kecil 320×568', width: 320, height: 568 },
  { name: 'iPhone 390×844', width: 390, height: 844 },
  { name: 'tablet 768×1024', width: 768, height: 1024 },
];

const ROUTES_PUBLIC = ['/', '/peta', '/login', '/pedoman-teknis', '/syarat-ketentuan', '/kebijakan-privasi'];

// Halaman internal — butuh sesi admin. Disemai via localStorage sebelum load.
const ROUTES_INTERNAL = [
  '/dashboard', '/laporan', '/input-lapangan', '/verifikasi-data',
  '/pendaratan-penyu', '/vegetasi-mangrove', '/rekomendasi-lokasi',
  '/pembibitan-mangrove', '/ekosistem', '/data-pokmaswas',
  '/peta', '/mangrove-nasional', '/lingkungan', '/tekanan-sosial',
];

const ADMIN_SEED = JSON.stringify({
  id: 'ADM-001',
  nama: 'Admin Verifikator',
  email: 'admin@idmap.local',
  unit: 'Cabdin KP Kab. Malang',
  provinsi: 'Jawa Timur',
  role: 'admin',
  initials: 'AV',
});

const executablePath = CHROME_CANDIDATES.find(existsSync);
if (!executablePath) {
  console.error('Chrome tidak ditemukan. Set executablePath manual di script.');
  process.exit(1);
}
console.log('Menggunakan Chrome:', executablePath, '\n');

const browser = await chromium.launch({ executablePath, headless: true });
let failures = 0;
let checks = 0;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: true,
    hasTouch: true,
  });
  for (const route of ROUTES_PUBLIC) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 140)));

    checks++;
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(2200); // tunggu animasi/reveal selesai
      const dims = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        iw: window.innerWidth,
      }));
      const overflow = dims.sw > dims.iw + 1;
      if (overflow || errors.length) {
        failures++;
        console.log(`❌ [${vp.name}] ${route} → overflow=${overflow ? `YA (scrollW ${dims.sw} vs ${dims.iw})` : 'tidak'} errors=${errors.length}`);
        errors.slice(0, 3).forEach(e => console.log('     !', e));
      } else {
        console.log(`✅ [${vp.name}] ${route} → ok`);
      }
    } catch (e) {
      failures++;
      console.log(`❌ [${vp.name}] ${route} → gagal buka: ${String(e).slice(0, 160)}`);
    }
    await page.close();
  }

  // ── Fase 2: halaman internal dengan sesi admin ──
  for (const route of ROUTES_INTERNAL) {
    const page = await ctx.newPage();
    await page.addInitScript((seed) => {
      localStorage.setItem('idmap_auth', seed);
    }, ADMIN_SEED);
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + String(e).slice(0, 140)));

    checks++;
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(2200);
      const dims = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        iw: window.innerWidth,
        path: location.pathname,
      }));
      const overflow = dims.sw > dims.iw + 1;
      if (overflow || errors.length) {
        failures++;
        console.log(`❌ [${vp.name}] ${route} → overflow=${overflow ? `YA (scrollW ${dims.sw} vs ${dims.iw})` : 'tidak'} errors=${errors.length} path=${dims.path}`);
        errors.slice(0, 3).forEach(e => console.log('     !', e));
      } else {
        console.log(`✅ [${vp.name}] ${route} → ok`);
      }
    } catch (e) {
      failures++;
      console.log(`❌ [${vp.name}] ${route} → gagal buka: ${String(e).slice(0, 160)}`);
    }
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log(`\n${checks - failures}/${checks} cek lolos.`);
console.log(failures === 0 ? '✅ SEMUA AMAN — tidak ada overflow horizontal / error' : `⚠️ ${failures} masalah ditemukan`);
process.exit(failures === 0 ? 0 : 1);

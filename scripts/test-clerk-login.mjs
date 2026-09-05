/**
 * Verdict test: buka app fresh per iterasi → klik Login → cek modal Clerk
 * (Clerk v5 modal = konten dirender di DOM host via portal, bukan iframe).
 * Run: node scripts/test-clerk-login.mjs
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const ITER = Number(process.env.ITER || 5);

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.CHROME_PATH,
].filter(Boolean);

let executablePath;
for (const p of CHROME_PATHS) {
  try { if (p && fs.existsSync(p)) { executablePath = p; break; } } catch { /* ignore */ }
}

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });

let ok = 0, fail = 0;
for (let i = 1; i <= ITER; i++) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('button', { name: 'Login', exact: true }).first().waitFor({ timeout: 20000 }).catch(() => {});
    const btnCount = await page.getByRole('button', { name: 'Login', exact: true }).count();

    if (btnCount === 0) {
      console.log(`[${i}] Sudah login (tombol Login tidak ada) — skip`);
      await page.close();
      continue;
    }

    await page.getByRole('button', { name: 'Login', exact: true }).first().click();

    // 1) backdrop modal Clerk di host
    let backdrop = false;
    try {
      await page.waitForSelector('.cl-modalBackdrop', { timeout: 20000 });
      backdrop = true;
    } catch { /* no backdrop */ }

    // 2) konten sign-in (portal di host DOM): tombol Google + input email
    let form = false, modalText = '';
    try {
      await page.waitForSelector('.cl-signIn-root', { timeout: 20000 });
      await page.waitForSelector('.cl-socialButtonsBlockButton__google', { timeout: 10000 });
      form = true;
      modalText = await page.evaluate(() => {
        const card = document.querySelector('.cl-card, .cl-signIn-root');
        return (card?.innerText ?? '').replace(/\n+/g, ' | ').slice(0, 200);
      });
    } catch { /* no form */ }

    const clerkErr = errors.find((e) => e.includes('failed_to_load_clerk_js'));
    const pass = backdrop && form;
    if (pass) ok++; else fail++;

    console.log(`[${i}] backdrop=${backdrop ? 'YA' : 'TIDAK'} form-sign-in=${form ? 'YA' : 'TIDAK'} => ${pass ? 'PASS ✅' : 'GAGAL ❌'}${clerkErr ? ' (clerk_js_timeout)' : ''}`);
    if (modalText) console.log(`     isi modal: ${modalText}`);

    if (i === 1) {
      fs.mkdirSync('scripts/screenshots', { recursive: true });
      await page.screenshot({ path: 'scripts/screenshots/clerk-login-modal.png' });
    }
  } catch (e) {
    fail++;
    console.log(`[${i}] ERROR: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

console.log(`\n=== VERDICT: ${ok}/${ITER} modal Clerk terbuka lengkap (backdrop + form sign-in) ===`);
await browser.close();
process.exit(fail === 0 ? 0 : 1);

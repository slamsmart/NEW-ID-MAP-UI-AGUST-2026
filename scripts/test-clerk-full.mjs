/**
 * Test menyeluruh alur Clerk login.
 *   T1: Landing → modal → klik "Continue with Google" → popup OAuth Google
 *   T2: Modal → validasi form email salah
 *   T3: /peta → klik Login → modal Clerk muncul
 * Run: node scripts/test-clerk-full.mjs
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:5000';
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
const results = [];
const shot = (page, name) => {
  fs.mkdirSync('scripts/screenshots', { recursive: true });
  return page.screenshot({ path: `scripts/screenshots/${name}.png` });
};

async function openLoginModal(page, label = 'Login') {
  await page.getByRole('button', { name: label, exact: true }).first().click();
  await page.waitForSelector('.cl-modalBackdrop', { timeout: 20000 });
  await page.waitForSelector('.cl-signIn-root', { timeout: 20000 });
}

// ── T1: Landing → Google OAuth popup ────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 150)); });

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await openLoginModal(page);

    const modalText = await page.evaluate(() => document.querySelector('.cl-card')?.innerText ?? '');
    const hasGoogle = await page.locator('.cl-socialButtonsBlockButton__google').count() > 0;
    console.log(`T1a. Modal terbuka: ${hasGoogle ? 'YA ✅' : 'TIDAK ❌'}`);
    console.log(`     teks modal: ${modalText.replace(/\n+/g, ' | ').slice(0, 140)}`);

    // Klik Continue with Google → Clerk buka OAuth (popup ATAU redirect tab sama)
    await page.locator('.cl-socialButtonsBlockButton__google').first().click();
    let googleUrl = '';
    try {
      await page.waitForURL(/accounts\.google\.com/, { timeout: 20000 });
      googleUrl = page.url();
    } catch {
      // coba popup
      const pages = browser.contexts()[0]?.pages() ?? [];
      for (const p of pages) {
        if (p.url().includes('accounts.google.com')) { googleUrl = p.url(); break; }
      }
    }
    const isGoogle = googleUrl.includes('accounts.google.com');
    console.log(`T1b. OAuth Google dibuka: ${isGoogle ? 'YA ✅' : 'TIDAK ❌'}`);
    if (isGoogle) console.log(`     url: ${googleUrl.slice(0, 90)}…`);
    await shot(page, 'clerk-google-oauth');
    await page.close();
    results.push({ test: 'T1 Google OAuth flow', pass: hasGoogle && isGoogle });
  } catch (e) {
    console.log(`T1. ERROR: ${e.message.split('\n')[0]}`);
    await shot(page, 'clerk-t1-error');
    await page.close();
    results.push({ test: 'T1 Google OAuth popup', pass: false });
  }
}

// ── T2: Validasi form email ─────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await openLoginModal(page);

    // Email valid format tapi belum terdaftar → Clerk harus balas error dari backend
    await page.locator('.cl-formFieldInput__identifier').first().fill('tes.otomatis.2026@gmail.com');
    await page.locator('.cl-formButtonPrimary').first().click();
    await page.waitForTimeout(3500);

    const modalText = await page.evaluate(() => document.querySelector('.cl-card')?.innerText ?? '');
    const hasErr = /couldn't find|invalid|tidak ditemukan|not found/i.test(modalText);
    console.log(`T2. Form merespons backend (error akun tak ditemukan): ${hasErr ? 'YA ✅' : 'TIDAK ❌'}`);
    if (hasErr) console.log(`     pesan: ${modalText.match(/couldn't find[^|]*/i)?.[0] ?? ''}`);
    await shot(page, 'clerk-form-validation');
    await page.close();
    results.push({ test: 'T2 form + backend Clerk', pass: hasErr });
  } catch (e) {
    console.log(`T2. ERROR: ${e.message.split('\n')[0]}`);
    await page.close();
    results.push({ test: 'T2 validasi form', pass: false });
  }
}

// ── T3: Modal di /peta ──────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  try {
    await page.goto(`${BASE}/peta`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const loginBtn = page.getByRole('button', { name: 'Login', exact: true }).first();
    if (await loginBtn.count() === 0) {
      console.log('T3. Tombol Login di /peta tidak ditemukan ❌');
      await page.close();
      results.push({ test: 'T3 modal di /peta', pass: false });
    } else {
      await loginBtn.click();
      await page.waitForSelector('.cl-modalBackdrop', { timeout: 10000 });
      await page.waitForSelector('.cl-signIn-root', { timeout: 10000 });
      const hasGoogle = await page.locator('.cl-socialButtonsBlockButton__google').count() > 0;
      console.log(`T3. Modal Clerk di /peta: ${hasGoogle ? 'YA ✅' : 'TIDAK ❌'}`);
      await shot(page, 'clerk-peta-modal');
      await page.close();
      results.push({ test: 'T3 modal di /peta', pass: hasGoogle });
    }
  } catch (e) {
    console.log(`T3. ERROR: ${e.message.split('\n')[0]}`);
    await page.close();
    results.push({ test: 'T3 modal di /peta', pass: false });
  }
}

await browser.close();
console.log('\n=== RINGKASAN ===');
let allPass = true;
for (const r of results) {
  console.log(`${r.pass ? '✅' : '❌'} ${r.test}`);
  if (!r.pass) allPass = false;
}
console.log(allPass ? 'SEMUA PASS' : 'ADA YANG GAGAL');
process.exit(allPass ? 0 : 1);

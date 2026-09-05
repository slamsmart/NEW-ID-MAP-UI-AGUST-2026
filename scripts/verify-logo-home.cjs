// Verify: logged-in user clicks sidebar logo "ID-MAP" -> should land on landing page (/), not stuck.
const { chromium } = require('playwright-core');

(async () => {
  const exePaths = [
    process.env.LOCALAPPDATA + '\\ms-playwright\\chrome-win\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const fs = require('fs');
  const executablePath = exePaths.find(p => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto('http://localhost:5000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"], input[name="username"], input[placeholder*="sername"]', 'verifikator');
  await page.fill('input[type="password"]', '@Verif2026');
  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  console.log('STEP1 OK -> logged in, at', page.url());

  await page.waitForSelector('h1:has-text("ID-MAP")', { timeout: 10000 });
  await page.click('h1:has-text("ID-MAP")');
  await page.waitForURL(u => new URL(u).pathname === '/', { timeout: 10000 });
  await page.waitForSelector('text=Integrasi Data Mangrove', { timeout: 15000 });
  const bodyText = await page.textContent('body');
  if (!bodyText || bodyText.trim().length < 200) throw new Error('Landing page body too short — possible white page');
  console.log('STEP2 OK -> logo click lands on landing page, body length:', bodyText.length);
  console.log('PAGE ERRORS:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });

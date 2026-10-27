const baseUrl = (process.argv[2] || process.env.SMOKE_URL || 'https://idmap-dkp.web.id').replace(/\/$/, '');

const routes = ['/', '/peta', '/login', '/pedoman-teknis', '/dashboard'];
let failed = 0;

for (const route of routes) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: 'follow' });
    const body = await response.text();
    const hasAppShell = body.includes('id="root"');
    const ok = response.status >= 200 && response.status < 400 && hasAppShell;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${response.status} ${route}${hasAppShell ? '' : ' (missing #root)'}`);
    if (!ok) failed += 1;
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed > 0) {
  console.error(`Smoke test failed: ${failed}/${routes.length} route checks failed at ${baseUrl}`);
  process.exitCode = 1;
} else {
  console.log(`Smoke test passed: ${routes.length}/${routes.length} routes at ${baseUrl}`);
}

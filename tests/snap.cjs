// צילום מהיר: node tests/snap.cjs <hash> <out> [w] [h] [actions-js]
const { chromium } = require('playwright');
const fs = require('fs');
const MENU = fs.readFileSync(__dirname + '/fixtures/ai-menu.js', 'utf8');
(async () => {
  const [hash, out, w = 1440, h = 900, act] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: MENU }));
  await p.route('**/fonts.googleapis.com/**', (r) => r.abort());
  await p.goto('http://localhost:4173/#' + hash, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  if (act) { await eval('(async()=>{' + act + '})()'); await p.waitForTimeout(900); }
  await p.screenshot({ path: out });
  const m = await p.evaluate(() => ({ ratio: +(document.documentElement.scrollHeight / innerHeight).toFixed(2), hs: document.documentElement.scrollWidth > innerWidth }));
  console.log(out, JSON.stringify(m), errs.filter(e=>!e.includes('fonts')).join(' | '));
  await b.close();
})();

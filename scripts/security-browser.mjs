/* Local-only bounded security regression checks. Requires environment-provided
 * Playwright + Chromium; does not install dependencies or contact production.
 * Build, serve out/ locally, then run: node scripts/security-browser.mjs
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { isSameOriginReference } from './security-helpers.mjs';
const { chromium } = (await import(pathToFileURL(createRequire(import.meta.url).resolve('playwright')).href)).default;
const origin = new URL(process.env.WONDERLAB_TEST_ORIGIN || 'http://127.0.0.1:4173');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'Localhost only');
assert(['http:', 'https:'].includes(origin.protocol), 'HTTP(S) required');
const base = origin.origin;
const key = 'wonderlab.progress.v1';
const checks = [];
const network = { sameOrigin: [], external: [], developmentTool: [], unattributed: [] };
const errors = [];
const dialogs = [];
async function check(name, action) { await action(); checks.push(name); }
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.WONDERLAB_BROWSER_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
 try {
 const instrument = async c => {
  c.on('request', r => {
   const entry = { url: r.url(), method: r.method(), hasBody: r.postData() !== null };
   try {
    const url = new URL(r.url());
    const developmentPath = url.origin === base && (url.pathname.startsWith('/__nextjs') || url.pathname === '/_next/webpack-hmr');
    (developmentPath ? network.developmentTool : url.origin === base ? network.sameOrigin : network.external).push(entry);
   }
   catch { network.unattributed.push(entry); }
  });
  // Record and stop unexpected external requests from every test context.
  await c.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  c.on('page', p => { p.on('pageerror', e => errors.push(e.message)); p.on('dialog', async d => { dialogs.push(d.type()); await d.dismiss(); }); });
 };
 const context = await browser.newContext();
 await instrument(context);
 const page = await context.newPage();
 await page.addInitScript(() => { window.__securitySentinel = 0; Math.random = () => 0; });
 await page.clock.install();
 const assertInert = async () => assert.equal(await page.evaluate(() => window.__securitySentinel), 0, 'Payload execution sentinel changed before navigation');
 const go = async (path, status = 200) => {
  const r = await page.goto(base + path); assert.equal(r.status(), status, path);
  await page.waitForLoadState('networkidle');
  await assertInert();
 };
 const start = async () => { const b = page.getByRole('button', { name: 'Start round', exact: true }); await b.focus(); await page.keyboard.press('Enter'); };
 const finishAnswer = async value => { await page.getByRole('textbox', { name: 'Your answer' }).fill(value); await page.getByRole('button', { name: 'Check answer', exact: true }).click(); };
 const getData = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
 for (const path of ['/', '/arcade/', '/how-it-works/', '/coding-lab/', '/challenges/', '/about/', '/privacy/', '/accessibility/']) {
  await check('route + refresh + Privacy link ' + path, async () => {
   await go(path); assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
   assert.equal(await page.locator('footer').getByRole('link', { name: 'Privacy', exact: true }).getAttribute('href'), '/privacy/');
   assert.equal((await page.reload()).status(), 200);
   const urls = await page.locator('a[href],script[src],link[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') || n.getAttribute('src')));
   assert(urls.every(url => isSameOriginReference(url,base)), 'Unexpected URL scheme/external resource');
  });
 }
 for (const game of ['number-quest', 'binary-challenge', 'pattern-detective', 'typing-sprint', 'algorithm-builder', 'logic-maze', 'reaction-challenge', 'memory-matrix']) {
  await check('game start/play/replay/reset ' + game, async () => {
   await go('/arcade/' + game + '/'); await start();
   if (['number-quest','binary-challenge','pattern-detective'].includes(game)) await finishAnswer({ 'number-quest': '56', 'binary-challenge': '10011', 'pattern-detective': '48' }[game]);
   if (game === 'typing-sprint') { await page.getByRole('textbox', { name: 'Type the sentence' }).fill('Small steps build clever solutions.'); await page.getByRole('button', { name: 'Check typing' }).click(); }
   if (game === 'algorithm-builder') for (const name of ['Choose a clear goal', 'Write instructions in order', 'Test the result and improve it']) await page.getByRole('button', { name, exact: true }).click();
   if (game === 'logic-maze') { await page.getByRole('grid').focus(); for (const key of ['ArrowRight','ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowDown']) await page.keyboard.press(key); }
   if (game === 'reaction-challenge') { await page.clock.runFor(950); await page.getByRole('button', { name: 'Reaction signal; tap when green' }).click(); }
   if (game === 'memory-matrix') for (const seq of [[3,1],[3,1,4],[2,4,1,3]]) {
    assert.equal(await page.locator('.memory-tile--active').count(), 1);
    await page.clock.runFor(seq.length * 600);
    assert.equal(await page.locator('.memory-tile--active').count(), 0);
    assert(!(await page.locator('body').innerText()).includes(seq.join(' · ')));
    for (const tile of seq) await page.getByRole('button', { name: 'Tile ' + tile, exact: true }).click();
   }
   const data = await getData(); assert(data.completedGames.includes(game));
   assert(data.bestScores[game] >= 0 && data.bestScores[game] <= (game === 'reaction-challenge' ? 1000 : 100));
   await page.getByRole('button', { name: 'Play again', exact: true }).click();
   await page.getByRole('button', { name: 'Reset round', exact: true }).click();
   assert.equal(await page.getByRole('button', { name: 'Start round', exact: true }).count(), 1);
   if (game === 'memory-matrix' || game === 'reaction-challenge') {
    await page.clock.runFor(5000);
    assert.equal(await page.getByRole('button', { name: 'Start round', exact: true }).count(), 1);
    assert.match(await page.getByRole('status').innerText(), /Round reset/);
    assert.equal(await page.locator('.memory-tile--active').count(),0);
   }
  });
 }
 await check('Memory Matrix rejects an incorrect recall prefix', async () => {
  await go('/arcade/memory-matrix/'); await start(); await page.clock.runFor(1200);
  await page.getByRole('button', { name: 'Tile 1', exact: true }).click();
  await page.getByRole('button', { name: 'Tile 1', exact: true }).click();
  assert(!(await page.getByRole('status').innerText()).includes('Level 2: watch'));
  await page.getByRole('button', { name: 'Tile 3', exact: true }).click();
  await page.getByRole('button', { name: 'Tile 1', exact: true }).click();
  assert.match(await page.getByRole('status').innerText(), /Level 2: watch/);
 });
 await check('sentinel guard detects execution before navigation', async () => {
  await go('/'); await page.evaluate(() => { window.__securitySentinel = 1; });
  await assert.rejects(assertInert, /Payload execution sentinel changed before navigation/);
  await page.evaluate(() => { window.__securitySentinel = 0; }); await assertInert();
 });
 await check('XSS payloads inert in search, answers and typing', async () => {
  const payloads = ['<img src=x onerror="window.__securitySentinel++">', '<svg onload="window.__securitySentinel++">', 'javascript:alert(1)', '\"\x27><script>window.__securitySentinel++</script>'];
  for (const payload of payloads) {
   await go('/arcade/'); await page.getByRole('searchbox').fill(payload); await assertInert(); assert.equal(await page.locator('.game-card').count(), 0);
   await go('/arcade/number-quest/'); await start(); await finishAnswer(payload); await assertInert(); assert.match(await page.getByRole('status').innerText(), /Not quite/);
   await go('/arcade/typing-sprint/'); await start(); await page.getByRole('textbox', { name: 'Type the sentence' }).fill(payload); await page.getByRole('button', { name: 'Check typing' }).click();
   await assertInert(); assert.equal(await page.locator('.game-shell img,.game-shell svg,.game-shell script').count(), 0);
  }
 });
 await check('encoded URL/query/fragment inputs and unknown routes', async () => {
  const payload = '<svg onload="window.__securitySentinel++">';
  await go('/?q=' + encodeURIComponent(payload) + '#' + encodeURIComponent(payload));
  await assertInert();
  for (const path of ['/not-a-route/', '/arcade/not-a-game/', '/arcade/' + encodeURIComponent(payload) + '/', '/arcade/' + encodeURIComponent(encodeURIComponent(payload)) + '/']) await go(path, 404);
  assert.equal(dialogs.length, 0);
 });
 await check('browser back/forward on nested public routes', async () => {
  await go('/arcade/'); await page.getByRole('link', { name: /Open game/ }).first().click(); await page.waitForURL('**/arcade/memory-matrix/');
  await page.goBack(); await page.waitForURL('**/arcade/'); assert.equal(new URL(page.url()).pathname, '/arcade/'); await page.goForward(); await page.waitForURL('**/arcade/memory-matrix/'); assert.equal(new URL(page.url()).pathname, '/arcade/memory-matrix/');
 });
 await check('invalid and bounded local storage recovery; no injected markup', async () => {
  for (const raw of ['', '{', 'null', '[]', JSON.stringify({ version: 99 }), JSON.stringify({ version: 1, bestScores: { 'number-quest': 1e99 }, completedGames: ['number-quest'] }), JSON.stringify({ version: 1, bestScores: {}, completedGames: ['<svg onload="window.__securitySentinel++">'] }), 'x'.repeat(20_000)]) {
   await page.evaluate(({key,raw}) => localStorage.setItem(key,raw), {key,raw}); await go('/arcade/'); assert.match(await page.locator('.progress-panel').innerText(), /unreadable/);
   await go('/arcade/number-quest/'); await start(); await finishAnswer('56'); const data = await getData(); assert.deepEqual(data, { version: 1, bestScores: { 'number-quest': 100 }, completedGames: ['number-quest'] });
   await assertInert();
  }
 });
 await check('cross-tab reset prevents stale score restoration; preserves unrelated key', async () => {
  await page.evaluate(k => { localStorage.setItem(k,JSON.stringify({version:1,bestScores:{'binary-challenge':80},completedGames:['binary-challenge']}));localStorage.setItem('unrelated','keep'); },key);
  await go('/arcade/number-quest/'); await start(); const privacy = await context.newPage(); await privacy.goto(base + '/privacy/'); await privacy.getByRole('button', { name:'Reset local progress' }).click();
  assert.equal(await privacy.evaluate(k=>localStorage.getItem(k),key),null); await finishAnswer('56'); assert.deepEqual(await getData(),{version:1,bestScores:{'number-quest':100},completedGames:['number-quest']}); assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated')),'keep');await privacy.close();
 });
 await check('other-tab progress update retained on next completion', async () => {
  await go('/arcade/number-quest/');await start(); const other=await context.newPage();await other.goto(base+'/arcade/');await other.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,bestScores:{'binary-challenge':90},completedGames:['binary-challenge']})),key);await finishAnswer('56');assert.equal((await getData()).bestScores['binary-challenge'],90);await other.close();
 });
 await check('refresh discards temporary typing input',async()=>{await go('/arcade/typing-sprint/');await start();await page.getByRole('textbox',{name:'Type the sentence'}).fill('practice-only text');await page.reload();await start();assert.equal(await page.getByRole('textbox',{name:'Type the sentence'}).inputValue(),'');});
 await check('375px layout and keyboard reset control',async()=>{await go('/privacy/');await page.setViewportSize({width:375,height:812});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const button=page.getByRole('button',{name:'Reset local progress'});await button.focus();assert(await button.evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null);});
 for (const kind of ['denied','quota']) await check('storage '+kind+' keeps games playable',async()=>{
  const c=await browser.newContext();await instrument(c);await c.addInitScript(mode=>{
   if(mode==='denied') Object.defineProperty(Storage.prototype,'getItem',{value(){throw new DOMException('Blocked','SecurityError')}});
   Object.defineProperty(Storage.prototype,'setItem',{value(){throw new DOMException('Unavailable',mode==='quota'?'QuotaExceededError':'SecurityError')}});
  },kind);const p=await c.newPage();await p.goto(base+'/arcade/number-quest/');await p.getByRole('button',{name:'Start round',exact:true}).click();await p.getByRole('textbox',{name:'Your answer'}).fill('56');await p.getByRole('button',{name:'Check answer'}).click();assert.match(await p.getByRole('status').innerText(),/Correct/);assert(await p.getByText(/could not save progress/).count());await c.close();
 });
 assert.equal(network.external.length,0,'Unexpected external requests (blocked by harness)');assert.equal(network.unattributed.length,0);assert(network.sameOrigin.every(r=>r.method==='GET'&&!r.hasBody));assert.equal(errors.length,0);assert.equal(dialogs.length,0);assert.deepEqual(await context.cookies(),[]);
 console.log(JSON.stringify({result:'PASS',checks:checks.length,passed:checks,requests:Object.fromEntries(Object.entries(network).map(([k,v])=>[k,v.length])),browserInternalTraffic:'NOT MEASURED: browser-internal/background traffic is outside Playwright page-request capture',nonGetOrBodyRequests:network.sameOrigin.filter(r=>r.method!=='GET'||r.hasBody).length,pageErrors:errors,dialogs,cookies:0,scope:'local static export only; external requests are recorded and aborted; development-tool paths are classified explicitly; browser-internal/background traffic is not measured; GETs include assets, navigation and synthetic URL probes'},null,2));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});

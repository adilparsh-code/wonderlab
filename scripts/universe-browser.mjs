/* Functional matrix: all new games, all three stages, completion, replay and reset.
 * Test solutions live only here/fixtures, never in the application bundle.
 * Requires environment-provided Playwright + Chromium and a locally served export.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { games } from '../src/lib/catalog.ts';
const { chromium } = createRequire(import.meta.url)('playwright');
const origin = new URL(process.env.WONDERLAB_TEST_ORIGIN || 'http://127.0.0.1:4175');
assert(['127.0.0.1','localhost','[::1]'].includes(origin.hostname), 'Loopback only');
assert(['http:','https:'].includes(origin.protocol));
const fixtures = (await Promise.all(['space','science','coding','maths','strategy'].map(f => import(`./game-smoke-fixtures/${f}.mjs`)))).flatMap(m => m.fixtures);
assert.equal(fixtures.length,42);
assert.deepEqual(fixtures.map(f=>f.id).sort(),games.filter(g=>g.engine).map(g=>g.id).sort());
const browser = await chromium.launch({executablePath:process.env.WONDERLAB_BROWSER_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results=[]; const errors=[]; const external=[];
const key='wonderlab.progress.v1';
try {
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 context.on('request',r=>{if(new URL(r.url()).origin!==origin.origin)external.push(r.url());});
 await context.route('**/*',route=>new URL(route.request().url()).origin===origin.origin?route.continue():route.abort());
 context.on('page',page=>page.on('pageerror',e=>errors.push(String(e))));
 const page=await context.newPage();
 async function click(name){const button=page.getByRole('button',{name,exact:true});await button.focus();await page.keyboard.press('Enter');}
 async function run(actions){for(const a of actions){if(a.type==='click')await click(a.name);else if(a.type==='select')await page.getByLabel(a.label,{exact:true}).selectOption(a.value);else await page.getByLabel(a.label,{exact:true}).fill(a.value);}}
 for(const f of fixtures){
  await page.goto(`${origin.origin}/arcade/${f.id}/`);
  await click('Start journey');
  for(let r=0;r<3;r++){
   await run(f.rounds[r]);
   if(r<2)await click('Next stage');
  }
  await page.getByRole('heading',{name:'Journey complete',exact:true}).waitFor();
  assert.match(await page.getByTestId('journey-complete').innerText(),/Final score: 100\/100/);
  const data=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
  assert.equal(data.bestScores[f.id],100);assert(data.completedGames.includes(f.id));
  await click('Play again');assert.equal(await page.getByTestId('journey-complete').count(),0);
  await click('Start journey');
  await page.getByText('Stage 1 of 3 · Potential score: 100/100 · Unsuccessful checks: 0',{exact:true}).waitFor();
  await click('Reset journey');await page.getByRole('button',{name:'Start journey',exact:true}).waitFor();
  // Repeat every complete journey at mobile width, exercising native controls by keyboard.
  await page.setViewportSize({width:375,height:812});await click('Start journey');
  for(let r=0;r<3;r++){await run(f.rounds[r]);if(r<2)await click('Next stage');}
  await page.getByRole('heading',{name:'Journey complete',exact:true}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${f.id} mobile overflow`);
  await page.getByRole('button',{name:'Play again',exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Start journey',exact:true}).waitFor();
  await page.setViewportSize({width:1280,height:900});
  results.push({id:f.id,desktopStages:3,mobileStages:3,score:100,persisted:true,replay:true,reset:true,keyboardReplay:true});
  process.stdout.write(`PASS ${f.id}\n`);
 }
 await page.goto(`${origin.origin}/arcade/`);
 assert.equal(await page.locator('.game-card').count(),50);
 for(const name of ['Space & Physics','Science Lab','Coding & Logic','Maths & Brain','Adventure & Strategy']){await page.getByRole('button',{name,exact:true}).click();assert(await page.locator('.game-card').count()>0);}
 await page.getByRole('button',{name:'All worlds',exact:true}).click();
 await page.getByLabel('Sort',{exact:true}).selectOption('Title A–Z');
 const headings=await page.locator('.game-card h3').allTextContents();assert.deepEqual(headings,[...headings].sort((a,b)=>a.localeCompare(b)));
 assert.equal(external.length,0);assert.deepEqual(errors,[]);
 const report={origin:origin.origin,results,total:results.length,externalRequests:external,pageErrors:errors,scope:'local static export; desktop and mobile successful gameplay, not a production/privacy certification'};
 fs.writeFileSync('/tmp/wonderlab-universe-browser.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({passed:results.length,stagesCompleted:results.length*6,externalRequests:external.length,pageErrors:errors.length}));
 await context.close();
} finally {await browser.close();}

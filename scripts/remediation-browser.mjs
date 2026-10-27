/* Focused local regression checks. Build/serve out/ first; no production targets. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const origin = new URL(process.env.WONDERLAB_TEST_ORIGIN || 'http://127.0.0.1:4187');
assert(['127.0.0.1','localhost','[::1]'].includes(origin.hostname));
assert(['http:','https:'].includes(origin.protocol));
const chunks = fs.readdirSync('out/_next/static/chunks').filter(f => f.endsWith('.js') && fs.readFileSync(path.join('out/_next/static/chunks',f),'utf8').includes('Land craft'));
assert.equal(chunks.length,1,'Expected one space-board chunk in this build');
const chunk = '/_next/static/chunks/'+chunks[0];
const browser = await chromium.launch({executablePath:process.env.WONDERLAB_BROWSER_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const context = await browser.newContext();
 let blocked=true, requests=0;
 await context.route('**/*', route => {
  const url=new URL(route.request().url());
  if(url.origin!==origin.origin)return route.abort();
  if(url.pathname===chunk){requests++;if(blocked)return route.abort();}
  return route.continue();
 });
 const page=await context.newPage();let navigations=0;
 page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
 await page.goto(origin.origin+'/arcade/lunar-landing/');
 await page.evaluate(()=>{window.__phase6Document='original document';});
 await page.getByRole('button',{name:'Start journey',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'This game could not load'}).waitFor();
 blocked=false;
 await page.getByRole('button',{name:'Reset journey',exact:true}).click();
 await page.getByRole('button',{name:'Start journey',exact:true}).click();
 await page.getByRole('button',{name:'Land craft',exact:true}).waitFor({timeout:5000});
 assert.equal(await page.evaluate(()=>window.__phase6Document),'original document','Recovery should preserve the document without reload');
 assert.equal(await page.locator('fieldset').count(),1,'Only one game instance should mount');
 for(let r=0;r<3;r++){
  await page.getByLabel('High-altitude burn',{exact:true}).fill(String(r+2));
  await page.getByLabel('Final landing burn',{exact:true}).fill('2');
  await page.getByRole('button',{name:'Land craft',exact:true}).click();
  if(r<2)await page.getByRole('button',{name:'Next stage',exact:true}).click();
 }
 await page.getByRole('heading',{name:'Journey complete',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('wonderlab.progress.v1')).bestScores['lunar-landing']),100);
 console.log(JSON.stringify({check:'failed chunk, reset, playable completion without reload',result:'PASS',requests,navigations}));
 await context.close();
 // A separate context exercises explicit repeated retries without a reload.
 const retryContext=await browser.newContext();let offline=true, retryRequests=0;
 await retryContext.route('**/*',route=>{
  const url=new URL(route.request().url());if(url.origin!==origin.origin)return route.abort();
  if(url.pathname===chunk){retryRequests++;if(offline)return route.abort();}
  return route.continue();
 });
 const retryPage=await retryContext.newPage();let retryNavigations=0;
 retryPage.on('framenavigated',frame=>{if(frame===retryPage.mainFrame())retryNavigations++;});
 await retryPage.goto(origin.origin+'/arcade/lunar-landing/');
 await retryPage.evaluate(()=>{window.__phase6Document='retry document';});
 await retryPage.getByRole('button',{name:'Start journey',exact:true}).click();
 await retryPage.getByRole('button',{name:'Retry game',exact:true}).waitFor();
 const firstFailureRequests=retryRequests;
 await retryPage.getByRole('button',{name:'Retry game',exact:true}).click();
 await retryPage.getByRole('button',{name:'Retry game',exact:true}).waitFor();
 assert(retryRequests>firstFailureRequests);
 offline=false;await retryPage.getByRole('button',{name:'Retry game',exact:true}).click();
 await retryPage.getByRole('button',{name:'Land craft',exact:true}).waitFor();
 assert.equal(await retryPage.evaluate(()=>window.__phase6Document),'retry document');assert.equal(await retryPage.locator('fieldset').count(),1);
 console.log(JSON.stringify({check:'repeated explicit retry failures then playable recovery',result:'PASS',requests:retryRequests,navigations:retryNavigations}));
 await retryContext.close();
 const gamesContext=await browser.newContext();
 await gamesContext.route('**/*',route=>new URL(route.request().url()).origin===origin.origin?route.continue():route.abort());
 const gamePage=await gamesContext.newPage();
 const click=async name=>gamePage.getByRole('button',{name,exact:true}).click();
 const fill=async(label,value)=>gamePage.getByLabel(label,{exact:true}).fill(String(value));
 const read=()=>gamePage.evaluate(()=>JSON.parse(localStorage.getItem('wonderlab.progress.v1')));
 await gamePage.goto(origin.origin+'/arcade/mars-expedition/');await click('Start journey');
 await fill('Oxygen tanks',0);await fill('Rover fuel',0);await click('Pack rover');await click('Return to base');await click('Check strategy plan');
 assert.equal(await gamePage.getByRole('button',{name:'Next stage',exact:true}).count(),0);assert.equal(await read(),null);
 for(let r=0;r<3;r++){
  await fill('Oxygen tanks',r+3);await fill('Rover fuel',r+2);await click('Pack rover');
  assert(await gamePage.getByLabel('Oxygen tanks',{exact:true}).isDisabled());assert(await gamePage.getByLabel('Rover fuel',{exact:true}).isDisabled());
  for(const name of ['Drive to research site','Collect rock sample','Return to base','Check strategy plan'])await click(name);
  if(r<2)await click('Next stage');
 }
 await gamePage.getByRole('heading',{name:'Journey complete',exact:true}).waitFor();
 assert.deepEqual((await read()).completedGames,['mars-expedition']);assert.equal((await read()).bestScores['mars-expedition'],90);
 await click('Play again');await click('Start journey');await click('Check strategy plan');
 assert.equal(await gamePage.getByRole('button',{name:'Next stage',exact:true}).count(),0);
 console.log(JSON.stringify({check:'Mars rejects empty cargo, locks valid supplies, completes and resets',result:'PASS'}));
 await gamePage.goto(origin.origin+'/arcade/stack-machine/');await click('Start journey');
 await click('Add');
 await fill('Push value',0);await click('Push onto stack');await click('Push onto stack');await click('Add');await click('Pop top');
 await fill('Push value',5);await click('Push onto stack');await click('Check stack');
 assert.equal(await gamePage.getByRole('button',{name:'Next stage',exact:true}).count(),0);
 assert.deepEqual((await read()).completedGames,['mars-expedition']);
 await click('Pop top');
 for(let r=0;r<3;r++){
  await fill('Push value',[2,7,3][r]);await click('Push onto stack');await fill('Push value',[3,2,4][r]);await click('Push onto stack');await click(['Add','Subtract','Multiply'][r]);await click('Check stack');
  if(r<2)await click('Next stage');
 }
 await gamePage.getByRole('heading',{name:'Journey complete',exact:true}).waitFor();
 const data=await read();assert.deepEqual(data.completedGames,['mars-expedition','stack-machine']);assert.equal(data.bestScores['stack-machine'],80);
 await click('Play again');await click('Start journey');await fill('Push value',5);await click('Push onto stack');await click('Check stack');
 assert.equal(await gamePage.getByRole('button',{name:'Next stage',exact:true}).count(),0);
 console.log(JSON.stringify({check:'Stack rejects underflow/discarded work, retains valid paths and resets provenance',result:'PASS'}));
 await gamesContext.close();
} finally { await browser.close(); }

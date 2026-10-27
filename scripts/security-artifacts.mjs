/* Offline static-export, internal-link, asset and known-secret-pattern checks. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { htmlReferences } from './export-html-references.mjs';
import { games } from '../src/lib/catalog.ts';
try {
const root = path.resolve('out');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
 const file=path.join(dir,e.name);
 assert(!e.isSymbolicLink(),'Symlink not allowed in inspected tree');
 assert(e.isDirectory()||e.isFile(),'Unsupported export file type');
 return e.isDirectory()?walk(file):[file];
}); }
function regular(file) { try {return fs.lstatSync(file).isFile();}catch{return false;} }
assert(fs.existsSync(root)&&fs.lstatSync(root).isDirectory()&&!fs.lstatSync(root).isSymbolicLink(),'Export directory missing or invalid');
const files = walk(root), html = files.filter(f=>f.endsWith('.html'));
assert(html.length > 0, 'Build static export first');
const sourceRoot = fileURLToPath(new URL('../src/app/', import.meta.url));
const expectedRoutes = walk(sourceRoot).filter(f => path.basename(f) === 'page.tsx').flatMap(f => {
  const route = path.relative(sourceRoot, path.dirname(f)).split(path.sep).join('/');
  if (route.includes('[')) {
    assert.equal(route, 'arcade/[game]', 'New dynamic route needs an explicit export inventory');
    return games.map(game => '/arcade/' + game.id + '/');
  }
  return [route ? '/' + route + '/' : '/'];
}).sort();
for (const route of expectedRoutes) {
  assert(regular(path.join(root, route, 'index.html')), 'Missing expected route: ' + route);
}
assert(regular(path.join(root, '404.html')), 'Static 404 export missing');
const missing = [], external = [], secretHits = [];
let refs=0;
const patterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /gh[pousr]_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /AKIA[0-9A-Z]{16}/, /https?:\/\/[^\s/@]+:[^\s/@]+@/];
for (const file of files) {
 const rel=path.relative(root,file);
 assert(!/(?:^|\/)(?:\.env|\.git|docs)(?:\/|$|\.)/.test(rel),'Unexpected internal file: '+rel);
 if (!/\.(?:html|js|css|json|txt|map)$/.test(file)) continue;
 const text=fs.readFileSync(file,'utf8');
 patterns.forEach((pattern,index)=>{if(pattern.test(text))secretHits.push({file:rel,pattern:index});});
 if (!file.endsWith('.html')) continue;
 let values;
 try {values=htmlReferences(text);}catch(error){throw Error(error.message+' in '+rel);}
 for (const value of values) {
  if (value.startsWith('#')) continue;
  let url;
  try {url=new URL(value,'http://local.test/'+path.relative(root,file));}catch{throw Error('Invalid HTML reference in '+rel);}
  if(url.origin!=='http://local.test'||url.username||url.password){external.push({file:rel,scheme:url.protocol});continue;}
  let decoded;
  try {decoded=decodeURIComponent(url.pathname);}catch{throw Error('Invalid reference path encoding in '+rel);}
  assert(!decoded.includes('\\')&&!/[\x00-\x1f\x7f]/.test(decoded)&&!decoded.split('/').includes('..'),'Invalid reference path in '+rel);
  const target=path.resolve(root,'.'+(decoded.endsWith('/')?decoded+'index.html':decoded));
  assert(target.startsWith(root+path.sep),'Invalid reference path escaped export root');refs++;
  if(!regular(target))missing.push({file:rel,path:decoded});
 }
}
assert.deepEqual(missing,[],'Missing referenced file');assert.deepEqual(external,[],'External reference');assert.deepEqual(secretHits,[]);
const maps=files.filter(f=>f.endsWith('.map')).map(f=>path.relative(root,f));
assert.deepEqual(maps,[],'Unexpected exported source maps require review');
console.log(JSON.stringify({result:'PASS',expectedRoutes,htmlFiles:html.length,referencedLocalAssetsAndLinks:refs,missing,externalResources:external,knownSecretPatternHits:secretHits,exportedSourceMaps:maps,htmlRoutes:html.map(f=>path.relative(root,f)),scope:'offline export inspection of HTML src, href and constrained srcset; base elements are rejected; CSS URLs, inline script strings and other URL-bearing attributes are outside scope; no runtime/host assertion; known-pattern scan is not universal secret detection'},null,2));

} catch(error) { console.error('Export validation failed: '+String(error.message).split('\n')[0]); process.exitCode=1; }

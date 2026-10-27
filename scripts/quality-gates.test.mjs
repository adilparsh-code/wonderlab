import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { isSameOriginReference } from './security-helpers.mjs';
import { games } from '../src/lib/catalog.ts';

const base = 'http://127.0.0.1:4173';
for (const value of ['/arcade/', '#main-content', '/_next/static/app.js']) {
  test('allows local reference '+value, () => assert.equal(isSameOriginReference(value,base),true));
}
for (const value of ['//example.invalid/path', '/\\example.invalid/path', 'javascript:alert(1)', 'data:text/html,example', 'https://example.invalid/', 'http://user:example@127.0.0.1:4173/']) {
  test('rejects nonlocal/unsafe reference '+value, () => assert.equal(isSameOriginReference(value,base),false));
}
const validator = fileURLToPath(new URL('./security-artifacts.mjs',import.meta.url));
function fixture(run, complete=true) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wonderlab-export-fixture-'));
  try {
    const routes=complete?['','arcade','how-it-works','coding-lab','challenges','about','privacy','accessibility',...games.map(g=>'arcade/'+g.id)]:[''];
    for(const route of routes) {const target=path.join(dir,'out',route,'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'<!doctype html><title>Synthetic test fixture</title>');}
    fs.writeFileSync(path.join(dir,'out','404.html'),'<!doctype html><title>Not found fixture</title>');
    return run(dir);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
}
function validate(dir) {return spawnSync(process.execPath,[validator],{cwd:dir,encoding:'utf8'});}
function rejects(dir, diagnostic) {
  const result=validate(dir);
  assert.equal(result.error,undefined);
  assert.equal(result.signal,null);
  assert.equal(typeof result.status,'number');
  assert.notEqual(result.status,0,'Malformed export must fail');
  assert.match(result.stderr,diagnostic);
}
test('rejects an export missing expected application routes',()=>fixture(dir=>rejects(dir,/Missing expected route/),false));
test('accepts a complete minimal expected-route export',()=>fixture(dir=>{const r=validate(dir);assert.equal(r.status,0,r.stderr);}));
for (const [name,markup] of [
 ['quoted','<script src="/missing.js"></script>'],
 ['spaced','<script src = "/missing.js"></script>'],
 ['uppercase','<script SRC="/missing.js"></script>'],
 ['unquoted','<img src=/missing.png>'],
 ['srcset','<img srcset="/missing.png 1x, /missing2.png 2x">'],
 ['entity','<img src="&#47;missing.png">'],
]) test('rejects missing asset in '+name,()=>fixture(dir=>{fs.appendFileSync(path.join(dir,'out/index.html'),markup);rejects(dir,/Missing referenced file/);}));
for (const target of ['index.html','privacy/index.html','404.html','asset.js']) test('rejects directory target '+target,()=>fixture(dir=>{
 const file=path.join(dir,'out',target);fs.rmSync(file,{force:true});fs.mkdirSync(file);
 if(target==='asset.js')fs.appendFileSync(path.join(dir,'out/arcade/index.html'),'<script src="/asset.js"></script>');
 rejects(dir,target.endsWith('index.html')?/Missing expected route/:target==='404.html'?/Static 404 export missing/:/Missing referenced file/);
}));
for(const [name,markup,diagnostic] of [
 ['encoding','<img src="/%ZZ">',/Invalid reference path encoding/],
 ['encoded traversal','<img src="/%2e%2e%2foutside">',/Invalid reference path/],
 ['nul','<img src="/%00">',/Invalid reference path/],
 ['unterminated attribute','<img src="missing>',/Malformed HTML/],
 ['duplicate attribute','<img src="/" SRC="/missing">',/Malformed HTML/],
 ['semicolonless numeric entity','<img src="&#104ttps://example.invalid/a">',/External reference/],
 ['unknown entity','<img src="&bogus;">',/Unsupported HTML entity/],
 ['malformed srcset','<img srcset="/ 1x,">',/Malformed srcset/],
 ['external','<img src="https://example.invalid/a">',/External reference/],
 ['spaced external href','<a href = "https://example.invalid/a">link</a>',/External reference/],
 ['uppercase external SRC','<img SRC="https://example.invalid/a">',/External reference/],
 ['external srcset','<img srcset="/ 1x, https://example.invalid/a 2x">',/External reference/],
])test('rejects '+name,()=>fixture(dir=>{fs.appendFileSync(path.join(dir,'out/index.html'),markup);rejects(dir,diagnostic);}));
test('rejects missing export directory',()=>fixture(dir=>{fs.rmSync(path.join(dir,'out'),{recursive:true});rejects(dir,/Export directory missing/);}));
test('rejects missing 404',()=>fixture(dir=>{fs.unlinkSync(path.join(dir,'out/404.html'));rejects(dir,/Static 404 export missing/);}));
test('rejects symlinks even to files inside export',()=>fixture(dir=>{fs.symlinkSync('404.html',path.join(dir,'out/alias.html'));rejects(dir,/Symlink not allowed/);}));
test('rejects unexpected exported source maps',()=>fixture(dir=>{fs.writeFileSync(path.join(dir,'out/leak.js.map'),'{}');rejects(dir,/Unexpected exported source maps/);}));
test('ignores HTML-like text in inline scripts and comments',()=>fixture(dir=>{
 fs.appendFileSync(path.join(dir,'out/index.html'),'<!-- <img src="/missing"> --><script>const x = `<img src="/missing">`;</script>');
 const r=validate(dir);assert.equal(r.status,0,r.stderr);
}));
test('rejects unsupported base URL semantics',()=>fixture(dir=>{
 fs.mkdirSync(path.join(dir,'out/assets'));
 fs.writeFileSync(path.join(dir,'out/assets/index.html'),'<!doctype html><title>Assets</title>');
 fs.writeFileSync(path.join(dir,'out/found.png'),'fixture');
 fs.appendFileSync(path.join(dir,'out/index.html'),'<base href="/assets/"><img src="found.png">');
 rejects(dir,/Unsupported HTML base element/);
}));
test('accepts mixed-case spaced quoted and unquoted local references and srcset',()=>fixture(dir=>{
 fs.writeFileSync(path.join(dir,'out/found.png'),'fixture');
 fs.appendFileSync(path.join(dir,'out/index.html'),'<A HrEf \n = \'/arcade/\'>Arcade</A><IMG SrC = /found.png SRCSET = "/found.png 1x, &#47;found.png 2x"><img srcset="/found.png 320w, /found.png 640w">');
 const result=validate(dir);assert.equal(result.status,0,result.stderr);assert.equal(result.signal,null);assert.equal(result.error,undefined);
}));

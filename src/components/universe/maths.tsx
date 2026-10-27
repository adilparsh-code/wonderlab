'use client';
import { useState } from 'react';
import type { BoardProps } from '@/lib/universe/types';
import { mathsGames } from '@/lib/universe/maths';
const prime=(n:number)=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
export function MathsBoard({gameId,round,disabled,onResult}:BoardProps){
 const [values,setValues]=useState<Record<string,string>>({});
 const [equation,setEquation]=useState({a:2,b:[3,4,5][round],c:[15,20,25][round]});
 const [operation,setOperation]=useState('subtract');
 const [leaves,setLeaves]=useState([{key:'root',n:[12,18,30][round]}]);
 const [notice,setNotice]=useState('');
 const game=mathsGames.find(g=>g.id===gameId);
 const input=(label:string,min=-100,max=100)=><label key={label} className="block my-3">{label}<input className="ml-3 rounded border p-2" aria-label={label} type="number" min={min} max={max} step="1" value={values[label]??''} onChange={e=>setValues(v=>({...v,[label]:e.target.value}))}/></label>;
 const num=(label:string)=>values[label]?.trim()?Number(values[label]):NaN;
 let content;let correct=false;let explanation='';
 if(gameId==='fraction-kitchen'){
 const denominator=[4,8,10][round],target=[3,5,7][round];correct=num('Portions')===target;explanation=`${target} scoops of 1/${denominator} make ${target}/${denominator}.`;
 content=<><p>Recipe target: {target}/{denominator} cup. Each scoop holds 1/{denominator} cup.</p>{input('Portions',0,denominator)}<p>Recipe bowl: {values.Portions||0}/{denominator} cup</p></>;
 }else if(gameId==='equation-balance'){
 correct=equation.a===1&&equation.b===0&&equation.c===[6,8,10][round];explanation='Subtract the constant from both sides, then divide both sides by 2 to isolate x.';
 content=<><p aria-live="polite">Balance: {equation.a}x + {equation.b} = {equation.c}</p><button type="button" aria-pressed={operation==='subtract'} onClick={()=>setOperation('subtract')}>Subtract from both sides</button><button type="button" aria-pressed={operation==='divide'} onClick={()=>setOperation('divide')}>Divide both sides</button>{input('Operation amount',1,100)}<button type="button" onClick={()=>{const n=num('Operation amount');if(!Number.isFinite(n)||n<1||n>100){setNotice('Choose an operation amount from 1 to 100.');return;}setEquation(e=>operation==='subtract'?{...e,b:e.b-n,c:e.c-n}:{a:e.a/n,b:e.b/n,c:e.c/n});}}>Apply operation</button></>;
 }else if(gameId==='coordinate-constructor'){
 const targets=[[4,3],[-2,4],[-3,-2]],instructions=['Start (1, 2). Translate 3 right and 1 up.','Start (2, 4). Reflect across the y-axis.','Start (3, 2). Rotate 180 degrees about the origin.'];correct=num('Point x')===targets[round][0]&&num('Point y')===targets[round][1];explanation=`The transformed point is (${targets[round].join(', ')}).`;
 content=<><p>{instructions[round]}</p>{input('Point x',-6,6)}{input('Point y',-6,6)}<svg viewBox="-70 -70 140 140" width="240" height="240" role="img" aria-label="Coordinate plane. Positive x points right; positive y points up."><path d="M-60 0H60M0-60V60" stroke="currentColor"/>{Number.isFinite(num('Point x'))&&Number.isFinite(num('Point y'))&&<circle cx={num('Point x')*10} cy={-num('Point y')*10} r="4" fill="currentColor"/>}</svg></>;
 }else if(gameId==='angle-workshop'){
 const target=[60,125,270][round];correct=num('Angle in degrees')===target;explanation=`The requested angle is ${target} degrees anticlockwise.`;const angle=Number.isFinite(num('Angle in degrees'))?num('Angle in degrees'):0;
 content=<><p>Construct {target} degrees: {['acute','obtuse','reflex'][round]}.</p>{input('Angle in degrees',0,360)}<svg viewBox="-60 -60 120 120" width="200" height="200" role="img" aria-label={`Angle dial showing ${angle} degrees`}><circle r="48" fill="none" stroke="currentColor"/><path d="M0 0H48" stroke="currentColor"/><path d={`M0 0L${48*Math.cos(angle*Math.PI/180)} ${-48*Math.sin(angle*Math.PI/180)}`} stroke="currentColor" strokeWidth="3"/></svg></>;
 }else if(gameId==='probability-bag'){
 const totals=[6,8,9],blue=[2,6,3];correct=num('Blue counters')===blue[round]&&num('Orange counters')===totals[round]-blue[round];explanation=`${blue[round]} blue counters out of ${totals[round]} produce the target probability.`;
 content=<><p>Build a bag with exactly {totals[round]} counters. Target probability of blue: {['1/3','3/4','1/3'][round]}.</p>{input('Blue counters',0,12)}{input('Orange counters',0,12)}<p>Bag total: {(Number.isFinite(num('Blue counters'))?num('Blue counters'):0)+(Number.isFinite(num('Orange counters'))?num('Orange counters'):0)}</p></>;
 }else if(gameId==='sudoku-mini'){
 const grid=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1].map(n=>(n+round-1)%4+1),blanks=[0,6,9,15];correct=blanks.every(i=>num(`Row ${Math.floor(i/4)+1} column ${i%4+1}`)===grid[i]);explanation='Each row, column and 2 by 2 box must contain 1, 2, 3 and 4 exactly once.';
 content=<><p>Complete the four missing cells. Rows 1–2 and 3–4 form box bands; columns 1–2 and 3–4 form box stacks.</p><div className="sudoku-grid">{grid.map((n,i)=>blanks.includes(i)?input(`Row ${Math.floor(i/4)+1} column ${i%4+1}`,1,4):<span key={i} className="border p-3" aria-label={`Row ${Math.floor(i/4)+1} column ${i%4+1}: ${n}`}>{n}</span>)}</div></>;
 }else if(gameId==='prime-factor-tree'){
 correct=leaves.length>1&&leaves.every(l=>prime(l.n));explanation='Each split must multiply back to its parent; keep splitting until all leaves are prime.';
 content=<><p>Factor tree root: {[12,18,30][round]}. Current leaves: {leaves.map(l=>l.n).join(' × ')}.</p>{leaves.map(leaf=>prime(leaf.n)?<p key={leaf.key}>{leaf.n} is prime.</p>:<div key={leaf.key}>{input(`Left factor of ${leaf.n}`,2,leaf.n-1)}{input(`Right factor of ${leaf.n}`,2,leaf.n-1)}<button type="button" onClick={()=>{const a=num(`Left factor of ${leaf.n}`),b=num(`Right factor of ${leaf.n}`);if(!Number.isInteger(a)||!Number.isInteger(b)||a<2||b<2||a*b!==leaf.n){setNotice(`Those factors must be integers greater than 1 whose product is ${leaf.n}.`);return;}setLeaves(old=>old.flatMap(l=>l.key===leaf.key?[{key:l.key+'L',n:a},{key:l.key+'R',n:b}]:[l]));setNotice('Valid split: the product is preserved.');}}>Split {leaf.n}</button></div>)}</>;
 }else if(gameId==='geometry-tiles'){
 const areas=[12,10,16],perimeters=[14,14,16],x=num('Tile columns'),y=num('Tile rows');correct=Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0&&x*y===areas[round]&&2*(x+y)===perimeters[round];explanation=`Area = columns × rows = ${areas[round]}; perimeter = 2 × (columns + rows) = ${perimeters[round]}.`;
 content=<><p>Build a rectangle with area {areas[round]} square units and perimeter {perimeters[round]} units.</p>{input('Tile columns',1,8)}{input('Tile rows',1,8)}<p>Area: {Number.isFinite(x*y)?x*y:'—'}. Perimeter: {Number.isFinite(x+y)?2*(x+y):'—'}.</p>{Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0&&x<=8&&y<=8&&<div style={{display:'grid',gridTemplateColumns:`repeat(${x}, 24px)`}} aria-label={`${x} columns and ${y} rows of unit tiles`}>{Array.from({length:x*y},(_,i)=><span key={i} style={{width:24,height:24,border:'1px solid currentColor'}}/>)}</div>}</>;
 }else{
 const starts=[-1,5,4],a=[5,-6,-4],b=[-2,3,-3];correct=num('First signed jump')===a[round]&&num('Second signed jump')===b[round];explanation=`${starts[round]} + (${a[round]}) + (${b[round]}) = ${starts[round]+a[round]+b[round]}.`;
 content=<><p>Start at {starts[round]}. First jump: {Math.abs(a[round])} {a[round]>0?'right':'left'}. Second jump: {Math.abs(b[round])} {b[round]>0?'right':'left'}. Use positive for right, negative for left.</p>{input('First signed jump',-10,10)}{input('Second signed jump',-10,10)}<p>Route: {starts[round]} → {Number.isFinite(num('First signed jump'))?starts[round]+num('First signed jump'):'?'} → {Number.isFinite(num('First signed jump')+num('Second signed jump'))?starts[round]+num('First signed jump')+num('Second signed jump'):'?'}</p></>;
 }
 return <fieldset disabled={disabled} className="space-y-4 rounded-xl border p-4"><legend>{game?.title}</legend><p>{game?.instructions}</p>{content}<p role="status">{notice}</p><button type="button" onClick={()=>{if(!disabled)onResult({correct,message:correct?`Construction complete! ${explanation}`:`Check your construction. ${explanation}`});}}>Check construction</button></fieldset>;
}

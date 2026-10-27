'use client';
import { useState } from 'react';
import type { BoardProps } from '../../lib/universe/types';

export function CodingBoard({gameId,round,disabled,onResult}:BoardProps){
 const [queue,setQueue]=useState<string[]>([]);
 const [number,setNumber]=useState('0');
 const [choice,setChoice]=useState('');
 const [left,setLeft]=useState('A');const [right,setRight]=useState('A');
 const [stack,setStack]=useState<{value:number;operations:string[]}[]>([]);
 const [items,setItems]=useState([[3,1,2],[2,3,1],[3,2,1]][round]);
 const [bits,setBits]=useState([2,3,8][round]);
 const [routes,setRoutes]=useState<Record<string,string>>({});
 const [interval,setInterval]=useState([0,6]);
 const [preview,setPreview]=useState('');
 const report=(correct:boolean,message:string)=>{if(!disabled)onResult({correct,message});};
 const button=(name:string,action:()=>void)=><button type="button" disabled={disabled} onClick={()=>{if(!disabled)action();}} key={name}>{name}</button>;
 const numeric=(label:string)=><label>{label}<input type="number" value={number} onChange={e=>setNumber(e.target.value)}/></label>;
 const select=(label:string,value:string,change:(v:string)=>void,options:string[])=><label>{label}<select aria-label={label} value={value} onChange={e=>change(e.target.value)}><option value="">Choose…</option>{options.map(v=><option key={v}>{v}</option>)}</select></label>;
 let board;
 if(gameId==='robot-programmer'){
 const target=[[2,1],[1,2],[2,2]][round];
 board=<><p>Grid: columns 0–2, rows 0–2. Start (0, 0). Destination ({target.join(', ')}). East increases column; South increases row. Maximum 6 commands.</p><div role="img" aria-label="Three by three robot grid" style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:4}}>{Array.from({length:9},(_,i)=><span key={i} style={{border:'1px solid',padding:8}}>{i===0?'Robot':i%3===target[0]&&Math.floor(i/3)===target[1]?'Goal':`${i%3},${Math.floor(i/3)}`}</span>)}</div>{['East','South','West','North'].map(d=>button(`Queue ${d}`,()=>setQueue(q=>q.length<6?[...q,d]:q)))}<p>Queue: {queue.join(' → ')||'empty'}</p>{button('Clear queue',()=>setQueue([]))}{button('Run robot',()=>{let x=0,y=0;const trace=['(0,0)'];for(const d of queue){x+=d==='East'?1:d==='West'?-1:0;y+=d==='South'?1:d==='North'?-1:0;trace.push(`(${x},${y})`);if(x<0||y<0||x>2||y>2){setPreview(trace.join(' → '));report(false,'The robot left the grid. Shorten or redirect the queue.');return;}}setPreview(trace.join(' → '));report(x===target[0]&&y===target[1],`Robot stopped at (${x}, ${y}); destination is (${target.join(', ')}).`);})}</>;
 }else if(gameId==='debugging-workshop'){
 const step=round+2;board=<><p>Expected trace: {[0,step,step*2,step*3].join(' → ')}. Broken instruction: start at 0; repeat 3 times: add 1.</p>{numeric('Replacement increment')}{button('Run repaired trace',()=>{const trace=[0,1,2,3].map(n=>n*Number(number));setPreview(`Actual trace: ${trace.join(' → ')}`);report(Number(number)===step,`Each step must increase by ${step}. Your trace increases by ${number}.`);})}</>;
 }else if(gameId==='logic-gates'){
 const gate=['AND','OR','XOR'][round];const evaluate=(g:string,a:boolean,b:boolean)=>g==='AND'?a&&b:g==='OR'?a||b:g==='XOR'?a!==b:false;
 board=<><p>Target outputs for inputs (A,B): 00→0, 01→{Number(evaluate(gate,false,true))}, 10→{Number(evaluate(gate,true,false))}, 11→{Number(evaluate(gate,true,true))}. Wire two gate inputs.</p>{select('Gate',choice,setChoice,['AND','OR','XOR'])}{select('Left wire',left,setLeft,['A','B'])}{select('Right wire',right,setRight,['A','B'])}{button('Test circuit',()=>{const rows=[[false,false],[false,true],[true,false],[true,true]];const results=rows.map(([a,b])=>evaluate(choice,left==='A'?a:b,right==='A'?a:b));setPreview(`Circuit outputs: ${results.map(Number).join(', ')}`);report(Boolean(choice)&&rows.every(([a,b],i)=>results[i]===evaluate(gate,a,b)),'Check all four rows: both input wires must affect the target truth table.');})}</>;
 }else if(gameId==='loop-garden'){
 const count=round+2;board=<><p>Target garden: {Array(count).fill('Leaf Flower').join(' | ')}</p>{numeric('Repeat count')}{select('Loop body',choice,setChoice,['Leaf','Flower Leaf','Leaf Flower'])}{button('Grow loop',()=>{const n=Number(number);setPreview(Number.isInteger(n)&&n>=0&&n<=8?Array(n).fill(choice||'empty').join(' | '):'Use a whole repeat count from 0 to 8.');report(n===count&&choice==='Leaf Flower','Match both the order inside the loop and the number of repeats.');})}</>;
 }else if(gameId==='stack-machine'){
 const operate=(op:string)=>{if(stack.length<2){report(false,'An operator needs two values. Push both operands first.');return;}const a=stack[stack.length-2],b=stack[stack.length-1];setStack([...stack.slice(0,-2),{value:op==='Add'?a.value+b.value:op==='Subtract'?a.value-b.value:a.value*b.value,operations:[...new Set([...a.operations,...b.operations,op])]}]);};
 board=<><p>Target: {[5,5,12][round]}. Practice {["addition","subtraction (older value minus newer value)","multiplication"][round]}. Stack bottom → top: [{stack.map(entry=>entry.value).join(', ')}]</p>{numeric('Push value')}{button('Push onto stack',()=>{const n=Number(number);if(Number.isFinite(n)&&Math.abs(n)<=100&&stack.length<8)setStack([...stack,{value:n,operations:[]}]);else report(false,'Use a finite value between −100 and 100 and at most 8 stack entries.');})}{button('Pop top',()=>{if(stack.length)setStack(stack.slice(0,-1));else report(false,'The stack is empty; there is nothing to pop.');})}{['Add','Subtract','Multiply'].map(op=>button(op,()=>operate(op)))}{button('Check stack',()=>report(stack.length===1&&stack[0].value===[5,5,12][round]&&stack[0].operations.includes(['Add','Subtract','Multiply'][round]),'Use the requested arithmetic operator and leave exactly one value equal to the target. Operators consume the top two entries.'))}</>;
 }else if(gameId==='sorting-network'){
 board=<><p>Positions 1, 2, 3: {items.join(' | ')}. Each comparator swaps only when its left value is larger.</p>{[0,1].map(i=>button(`Compare positions ${i+1} and ${i+2}`,()=>{const next=[...items];if(next[i]>next[i+1])[next[i],next[i+1]]=[next[i+1],next[i]];setItems(next);}))}{button('Check ordering',()=>report(items.every((n,i)=>i===0||items[i-1]<=n),'Compare any neighboring pair that is still descending.'))}</>;
 }else if(gameId==='binary-register'){
 const target=[5,4,12][round];board=<><p>Four-bit register: {bits.toString(2).padStart(4,'0')}. Target: {target.toString(2).padStart(4,'0')}. Bit 1 is the rightmost bit. Shifts insert 0 and discard overflow.</p>{button('Shift left',()=>setBits((bits<<1)&15))}{button('Shift right',()=>setBits(bits>>1))}{[1,2,3,4].map(i=>button(`Toggle bit ${i}`,()=>setBits(bits^(1<<(i-1)))))}{button('Check register',()=>report(bits===target,'Inspect which bit positions differ from the target, then shift or toggle them.'))}</>;
 }else if(gameId==='flowchart-router'){
 const values=[[4,8,3],[5,10,4],[6,12,5]][round];const threshold=[6,8,10][round];const route=(n:number)=>n%2?'Odd':n<threshold?'Small even':'Large even';
 board=<><p>Flowchart: Is value even? No → Odd. Yes → Is it below {threshold}? Yes → Small even. No → Large even.</p>{values.map(n=><div key={n}>{select(`Route value ${n}`,routes[n]||'',v=>setRoutes({...routes,[n]:v}),['Odd','Small even','Large even'])}</div>)}{button('Run flowchart',()=>report(values.every(n=>routes[n]===route(n)),`Test evenness first; only even values use the below-${threshold} branch.`))}</>;
 }else if(gameId==='search-lab'){
 const values=[2,4,6,8,10,12,14];const target=[6,10,14][round];const [lo,hi]=interval;const mid=Math.floor((lo+hi)/2);const choose=(direction:string)=>{const correct=direction==='Found target'?values[mid]===target:direction==='Keep lower half'?target<values[mid]:target>values[mid];if(!correct){report(false,`Midpoint ${values[mid]} compared with target ${target}: keep the half containing the target.`);return;}if(direction==='Found target'){report(true,'Found the target by repeatedly halving the interval.');return;}setInterval(direction==='Keep lower half'?[lo,mid-1]:[mid+1,hi]);};
 board=<><p>Sorted list: {values.join(', ')}. Target: {target}. Active interval: {values.slice(lo,hi+1).join(', ')}. Midpoint: {values[mid]}.</p>{['Keep lower half','Keep upper half','Found target'].map(d=>button(d,()=>choose(d)))}</>;
 }else board=<p>Unknown coding activity.</p>;
 return <fieldset disabled={disabled} className="universe-board"><legend>Coding workbench · Stage {round+1}</legend>{board}{preview&&<p role="status">{preview}</p>}</fieldset>;
}

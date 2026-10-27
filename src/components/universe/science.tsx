'use client';
import {useState, type ReactNode} from 'react';
import type {BoardProps} from '@/lib/universe/types';

export function ScienceBoard({gameId,round,disabled,onResult}:BoardProps) {
 const r=Math.max(0,Math.min(2,round));
 const [values,setValues]=useState<Record<string,string>>({});
 const [edges,setEdges]=useState<string[]>([]);
 const [feedback,setFeedback]=useState('');
 const value=(name:string)=>values[name]??'';
 const number=(name:string)=>value(name).trim()===''?NaN:Number(value(name));
 const field=(name:string,options?:string[]) => <label key={name}>{name}{options?<select aria-label={name} value={value(name)} disabled={disabled} onChange={e=>setValues({...values,[name]:e.target.value})}><option value="">Choose…</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input aria-label={name} type={name==='Repaired DNA strand'?'text':'number'} step="any" value={value(name)} disabled={disabled} onChange={e=>setValues({...values,[name]:e.target.value})}/>}</label>;
 let content:ReactNode; let correct=false; let lesson='';
 switch(gameId) {
 case 'atom-builder': {
  const targets=[{name:'neutral helium',p:2,e:2},{name:'neutral carbon',p:6,e:6},{name:'oxide ion (charge −2)',p:8,e:10}][r];
  content=<><p>Build {targets.name}. Atomic numbers: helium 2, carbon 6, oxygen 8. Charge = protons − electrons.</p>{field('Protons')}{field('Electrons')}<p>Model: {value('Protons')||'?'} positive protons and {value('Electrons')||'?'} negative electrons.</p></>;
  correct=number('Protons')===targets.p&&number('Electrons')===targets.e; lesson='Proton count identifies the element; electron count sets its charge. This counting model omits orbitals and neutrons.'; break;
 }
 case 'equation-balancer': {
  const equations=[{text:'H₂ + O₂ → H₂O',left:[[2,0],[0,2]],right:[2,1]},{text:'N₂ + H₂ → NH₃',left:[[2,0],[0,2]],right:[1,3]},{text:'Fe + O₂ → Fe₂O₃',left:[[1,0],[0,2]],right:[2,3]}][r];
  const a=number('Coefficient 1'),b=number('Coefficient 2'),c=number('Coefficient 3');
  content=<><p>Balance {equations.text}. Enter positive whole-number coefficients, in displayed order. Any atom-conserving multiple works; never change subscripts.</p>{[1,2,3].map(n=>field(`Coefficient ${n}`))}</>;
  correct=[a,b,c].every(n=>Number.isInteger(n)&&n>0)&&[0,1].every(i=>a*equations.left[0][i]+b*equations.left[1][i]===c*equations.right[i]);lesson='Each element has the same atom count before and after. This is a symbolic puzzle, not an experiment to perform.';break;
 }
 case 'circuit-connect': {
  const paths=[['A–B','B–C','C–D','D–A'],['A–C','C–B','B–D','D–A'],['A–B','B–D','D–C','C–A']][r];
  const choices=[...paths,'A–D (bypass)','B–C (extra)'];
  content=<><p>Build a closed series loop through battery A, switch {r===1?'C':'B'}, lamp {r===1?'B':r===2?'D':'C'}, and return junction {r===2?'C':'D'}. Follow this route: {paths.join(' → ')}. Add its four wires; exclude bypasses.</p><div>{choices.map(edge=><button key={edge} type="button" aria-pressed={edges.includes(edge)} disabled={disabled} onClick={()=>setEdges(edges.includes(edge)?edges.filter(e=>e!==edge):[...edges,edge])}>Wire {edge}</button>)}</div><p>Connected wires: {edges.join(', ')||'none'}. {edges.length===4&&paths.every(e=>edges.includes(e))?'Closed series loop: lamp on.':'Loop incomplete or bypassed: lamp off.'}</p></>;
  correct=edges.length===4&&paths.every(e=>edges.includes(e));lesson='A series circuit needs one continuous return path through every component. This is an ideal, low-voltage diagram only.';break;
 }
 case 'dna-repair': {
  const strand=['ATCG','CGTA','TACGG'][r];content=<><p>Template strand: {strand}. Rebuild the missing aligned complementary strand from left to right. Pair A with T, and C with G. This simplified model omits strand direction.</p>{field('Repaired DNA strand')}</>;
  const pairs:Record<string,string>={A:'T',T:'A',C:'G',G:'C'}; correct=value('Repaired DNA strand').trim().toUpperCase()===Array.from(strand,c=>pairs[c]).join('');lesson='Complementary base pairing lets a DNA template specify another strand.';break;
 }
 case 'ecosystem-budget': {
  const budget=[8,12,16][r],minimum=[2,3,4][r];const p=number('Producer patches'),c=number('Consumer groups');
  content=<><p>Allocate exactly {budget} habitat tokens. Each producer patch costs 1; each consumer group costs 2. Support at least {minimum} consumer groups. Each consumer needs at least 2 producer patches.</p>{field('Producer patches')}{field('Consumer groups')}<p>Spent: {Number.isFinite(p+c)?p+2*c:'?'} / {budget} tokens.</p></>;
  correct=Number.isInteger(p)&&Number.isInteger(c)&&p>=0&&c>=minimum&&p>=2*c&&p+2*c===budget;lesson='Producer supply limits consumer populations. This toy budget ignores species differences, cycles and seasonal change.';break;
 }
 case 'microscope-focus': {
  const data=[{focus:3,ticks:4,scale:10,kind:'plant'},{focus:6,ticks:6,scale:5,kind:'animal'},{focus:8,ticks:5,scale:10,kind:'plant'}][r];const focused=number('Focus setting')===data.focus;
  content=<><p>Virtual microscope: best focus is where the fine-focus dial equals {data.focus}. Calibrated scale: 1 division = {data.scale} µm.</p>{field('Focus setting')}<div role="img" aria-label={focused?`Sharp toy cell spans ${data.ticks} divisions; ${data.kind==='plant'?'rigid outer wall and chloroplast dots':'rounded boundary, no wall or chloroplast dots'}`:'Blurred cell; adjust focus to reveal details'}>{focused?`|${'—|'.repeat(data.ticks)} Cell spans ${data.ticks} divisions. ${data.kind==='plant'?'Rigid wall + chloroplast dots':'Rounded boundary; no wall or chloroplast dots'}`:'░ Blurred specimen ░'}</div>{field('Cell width in micrometres')}{field('Observed structure',['plant','animal'])}</>;
  correct=focused&&number('Cell width in micrometres')===data.ticks*data.scale&&value('Observed structure')===data.kind;lesson='Focus reveals structure; a calibrated scale converts divisions into length. These schematic cells are not diagnostic images.';break;
 }
 case 'material-sort': {
  const items=[['iron','glass','rubber'],['copper','ceramic','plastic'],['aluminium','wood','silicone']][r]; const bins=['conductor','rigid insulator','flexible insulator'];
  content=<><p>Sort the sample cards by the listed properties. These are ideal dry samples at room temperature; real materials vary.</p>{items.map((item,i)=><div key={item}><p>{item}: {['conducts electric current; rigid','blocks current; rigid','blocks current; bends easily'][i]}.</p>{field(`Bin for ${item}`,bins)}</div>)}</>;
  correct=items.every((item,i)=>value(`Bin for ${item}`)===bins[i]);lesson='Useful material choices depend on both electrical and mechanical properties.';break;
 }
 case 'lab-measurement': {
  const low=[20,40,100][r],step=[5,10,5][r],reading=low+step*(r===2?5:3);
  content=<><p>Read this virtual cylinder in mL at the bottom of the meniscus, then convert to litres. Each tick is {step} mL.</p><ol aria-label="Cylinder scale">{Array.from({length:7},(_,i)=><li key={i}>{low+i*step} mL {low+i*step===reading?'← bottom of meniscus':''}</li>)}</ol>{field('Scale reading')}{field('Converted volume in litres')}<p>1000 mL = 1 L.</p></>;
  correct=number('Scale reading')===reading&&Math.abs(number('Converted volume in litres')-reading/1000)<1e-8;lesson='Read the calibrated scale before converting units. This upright text scale is a simplified cylinder.';break;
 }
 case 'method-investigator': {
  const experiments=[{question:'Does daily light duration affect seedling height?',vary:'light',control:'water',measure:'height'},{question:'Does daily water volume affect seedling height?',vary:'water',control:'light',measure:'height'},{question:'Does water temperature affect how long sugar takes to dissolve?',vary:'temperature',control:'water',measure:'time'}][r];const options=['light','water','height','temperature','time'];
  content=<><p>{experiments.question} Design a fair comparison. Here “water” means water volume. Use matched samples and keep other conditions alike.</p>{field('Variable to change',options)}{field('Variable to hold constant',options)}{field('Outcome to measure',options)}</>;
  correct=value('Variable to change')===experiments.vary&&value('Variable to hold constant')===experiments.control&&value('Outcome to measure')===experiments.measure;lesson='Vary one factor, control other conditions, and measure the predicted outcome. Repeat comparisons to reduce random error.';break;
 }
 default: content=<p>Unknown science challenge.</p>;
 }
 return <section aria-label="Science workbench">{content}<button type="button" disabled={disabled} onClick={()=>{if(disabled)return; const message=correct?`Model verified. ${lesson}`:`Revise the model. Check each constraint. ${lesson}`;setFeedback(message);onResult({correct,message});}}>Check science model</button><p role="status">{feedback}</p></section>;
}

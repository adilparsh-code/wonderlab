'use client';
import {useState} from 'react';
import type {BoardProps} from '@/lib/universe/types';

export function StrategyBoard({gameId,round,disabled,onResult}:BoardProps){
 const r=Math.max(0,Math.min(2,round));
 const [values,setValues]=useState<Record<string,string>>({});
 const [step,setStep]=useState(0);
 const [cargo,setCargo]=useState<{oxygen:number;fuel:number}|null>(null);
 const [notice,setNotice]=useState('');
 const n=(key:string)=>Number(values[key]||0);
 const set=(key:string,value:string)=>{if(!disabled&&!(gameId==='mars-expedition'&&cargo))setValues(v=>({...v,[key]:value}));};
 const number=(label:string)=> <label>{label}<input type="number" disabled={gameId==='mars-expedition'&&cargo!==null} min="0" max="30" step="1" value={values[label]??''} onChange={e=>set(label,e.target.value)}/></label>;
 const select=(label:string,options:[string,string][])=> <label>{label}<select aria-label={label} value={values[label]??''} onChange={e=>set(label,e.target.value)}><option value="">Choose…</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>;
 const integer=(...keys:string[])=>keys.every(k=>values[k]!==undefined&&values[k]!==''&&Number.isInteger(n(k))&&n(k)>=0&&n(k)<=30);
 let content;let correct=false;let success='';let failure='';
 if(gameId==='eco-city-planner'){
  const plots=['North plot','Central plot','South plot'];const uses=plots.map(p=>values[p]);
  const cost=uses.reduce((sum,v)=>sum+(v==='homes'?4:v==='solar'?3:v==='park'?2:v==='factory'?2:0),0);
  const pollution=uses.reduce((sum,v)=>sum+(v==='factory'?5:v==='homes'?1:v==='park'?-2:0),0);
  correct=uses.includes('homes')&&uses.includes('solar')&&uses.includes('park')&&cost<=9&&pollution<=0&&(r!==2||values['Central plot']==='solar');
  content=<><p>Mission {r+1}: {['house a new neighborhood','restore an industrial district','power the central transit hub'][r]}. Three plots; budget 9; pollution at most 0. Need homes, solar power, and a park.{r===2?' Solar must occupy the central plot.':''}</p><p>Homes: cost 4, pollution +1. Solar: cost 3, pollution 0. Park: cost 2, pollution −2. Factory: cost 2, pollution +5.</p>{plots.map(p=><div key={p}>{select(p,[['homes','Homes'],['solar','Solar'],['park','Park'],['factory','Factory']])}</div>)}<p aria-live="polite">Allocated cost: {cost}/9. Pollution: {pollution}. Layout: {uses.map(v=>v||'empty').join(' → ')}</p></>;
  success='Your city provides housing, clean energy, and green space within budget.';failure='Provide homes, solar, and a park within 9 credits and pollution 0; check the central-plot requirement.';
 }else if(gameId==='bridge-designer'){
  const beams=n('Bridge beams'),supports=n('Bridge supports'),steel=values['Beam material']==='steel';const strength=beams*(steel?3:1)+supports*2,cost=beams*(steel?3:1)+supports*2;const load=8+r*3,budget=8+r*3;
  correct=integer('Bridge beams','Bridge supports')&&!!values['Beam material']&&supports>=1&&strength>=load&&cost<=budget;
  content=<><p>Toy mission: {['footbridge','supply bridge','rover bridge'][r]}. Load {load}; budget {budget}. At least one support. This model is a game, not real bridge engineering.</p><p>Wood beam: strength 1, cost 1. Steel beam: strength 3, cost 3. Support: strength 2, cost 2.</p>{number('Bridge beams')}{number('Bridge supports')}{select('Beam material',[['wood','Wood'],['steel','Steel']])}<p aria-live="polite">Toy strength {strength}/{load}; cost {cost}/{budget}. Deck: {beams} beams over {supports} supports.</p></>;
  success='The supported toy bridge carries the load within budget.';failure='Use whole counts, at least one support, enough toy strength, and stay within budget.';
 }else if(gameId==='water-network'){
  const branch=r===1?'east':'west',loss=r+1,pressure=n('Pump pressure');correct=values['Source pipe']==='filter'&&values['Junction pipe']===branch&&integer('Pump pressure')&&pressure-loss>=2&&pressure<=r+3;
  content=<><p>Deliver clean water to the {branch} district. Source → filter or bypass → junction → west/east district. Route pressure loss {loss}; district needs pressure 2. Pump energy cap {r+3}.</p>{select('Source pipe',[['filter','Connect through filter'],['bypass','Bypass filter']])}{select('Junction pipe',[['west','Route west'],['east','Route east']])}{number('Pump pressure')}<p aria-live="polite">Route: source → {values['Source pipe']||'unconnected'} → {values['Junction pipe']||'unconnected'}. Delivered pressure: {Math.max(0,pressure-loss)}.</p></>;
  success='Filtered water reaches the target district with sufficient pressure.';failure='Filter the water, choose the requested district, and offset pressure loss within the pump cap.';
 }else if(gameId==='cyber-safety-defender'){
  const messages=['A mock prize message asks for your password and says you must act now.','A mock teammate asks you to change the shared project recovery email.','A mock game app asks to upload your entire contact list to unlock a badge.'];
  const answer=['report','verify','decline'][r];correct=values['Message response']===answer;
  content=<><p>Fictional inbox, mission {r+1}. {messages[r]}</p><p>No messages are sent and no external links are opened.</p>{select('Message response',[['report','Report and block the password request'],['verify','Verify with the teammate through a known separate channel'],['decline','Decline unnecessary contact access'],['comply','Comply immediately']])}</>;
  success=['Passwords should never be shared to claim prizes. Reporting helps flag phishing.','A separate known channel confirms identity before a sensitive account change.','Contacts are unrelated to a badge. Declining unnecessary access protects other people’s data.'][r];failure=['Urgency and a password request are phishing signals: report and block.','A sensitive account change needs independent verification with the teammate.','A badge does not justify uploading contacts: decline unnecessary access.'][r];
 }else if(gameId==='mars-expedition'){
  const oxygen=r+3,fuel=r+2;
  const advance=(expected:number)=>{
   if(disabled)return;
   if(step!==expected){setNotice('Follow the expedition order: pack, drive, collect, return.');return;}
   if(expected===0){
    if(!integer('Oxygen tanks','Rover fuel')||n('Oxygen tanks')<oxygen||n('Rover fuel')<fuel||n('Oxygen tanks')+n('Rover fuel')>oxygen+fuel){setNotice('Pack enough oxygen and fuel within the cargo limit.');return;}
    setCargo({oxygen:n('Oxygen tanks'),fuel:n('Rover fuel')});
   }else{
    const oxygenUse=expected===3?oxygen-2:1;
    const fuelUse=expected===2?fuel-2:1;
    if(!cargo||cargo.oxygen<oxygenUse||cargo.fuel<fuelUse){setNotice('Not enough packed oxygen or fuel for this action.');return;}
    setCargo({oxygen:cargo.oxygen-oxygenUse,fuel:cargo.fuel-fuelUse});
   }
   setStep(step+1);setNotice('');
  };
  correct=step===4&&cargo!==null&&cargo.oxygen===0&&cargo.fuel===0;
  content=<><p>Mission {r+1}: {['nearby crater','ridge survey','distant ice field'][r]}. Need {oxygen} oxygen tanks and {fuel} fuel total. Cargo cap {oxygen+fuel}. Drive and return each use 1 fuel; remaining {fuel-2} fuel supports research. Oxygen is used throughout the expedition. Packed supplies are locked for this mission.</p>{number('Oxygen tanks')}{number('Rover fuel')}<p aria-live="polite">Expedition: {['awaiting packing','packed at base','at research site','sample secured','returned with sample'][step]}. Cargo {n('Oxygen tanks')+n('Rover fuel')}/{oxygen+fuel}. Oxygen remaining {cargo?.oxygen??n('Oxygen tanks')}; fuel remaining {cargo?.fuel??n('Rover fuel')}.</p>{['Pack rover','Drive to research site','Collect rock sample','Return to base'].map((label,i)=><button key={label} type="button" disabled={disabled||step>i} onClick={()=>advance(i)}>{label}</button>)}<p role="status">{notice}</p></>;
  success='Your expedition returned a sample within its oxygen, fuel, and cargo limits.';failure='Pack within the cargo limit and complete all four expedition actions in order.';
 }else if(gameId==='energy-grid-manager'){
  const solar=n('Solar units'),wind=n('Wind units'),gas=n('Gas units'),demand=r+5,cost=solar+wind*2+gas*3;
  correct=integer('Solar units','Wind units','Gas units')&&solar<=r+2&&wind<=2&&solar+wind+gas===demand&&cost<=r+9&&gas*3<=3;
  content=<><p>Mission {r+1}: {['morning demand','midday demand','afternoon demand'][r]}. Demand {demand}. Solar availability {r+2}; wind availability 2. Each unit produces 1 power. Solar costs 1; wind 2; gas 3 and emits 3. Budget {r+9}; emissions cap 3.</p>{number('Solar units')}{number('Wind units')}{number('Gas units')}<p aria-live="polite">Supply {solar+wind+gas}/{demand}; cost {cost}/{r+9}; emissions {gas*3}/3.</p></>;
  success='Dispatch meets demand within renewable availability, cost, and emissions limits.';failure='Match demand exactly, respect solar/wind availability, and keep cost and emissions within the caps.';
 }else return <p>Strategy mission unavailable.</p>;
 return <section aria-label="Strategy mission"><fieldset disabled={disabled}><legend>Mission {r+1} planning controls</legend>{content}<button type="button" onClick={()=>{if(!disabled)onResult({correct,message:correct?success:failure});}}>Check strategy plan</button></fieldset></section>;
}

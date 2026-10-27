const fill=(label,value)=>({type:'fill',label,value:String(value)});
const select=(label,value)=>({type:'select',label,value});
const click=name=>({type:'click',name});
export const fixtures=[
{id:'eco-city-planner',rounds:[0,1,2].map(r=>[select('North plot','homes'),select('Central plot',r===2?'solar':'park'),select('South plot',r===2?'park':'solar'),click('Check strategy plan')])},
{id:'bridge-designer',rounds:[0,1,2].map(r=>[fill('Bridge beams',r+2),fill('Bridge supports',1),select('Beam material','steel'),click('Check strategy plan')])},
{id:'water-network',rounds:[0,1,2].map(r=>[select('Source pipe','filter'),select('Junction pipe',r===1?'east':'west'),fill('Pump pressure',r+3),click('Check strategy plan')])},
{id:'cyber-safety-defender',rounds:[['report'],['verify'],['decline']].map(([v])=>[select('Message response',v),click('Check strategy plan')])},
{id:'mars-expedition',rounds:[0,1,2].map(r=>[fill('Oxygen tanks',r+3),fill('Rover fuel',r+2),click('Pack rover'),click('Drive to research site'),click('Collect rock sample'),click('Return to base'),click('Check strategy plan')])},
{id:'energy-grid-manager',rounds:[0,1,2].map(r=>[fill('Solar units',r+2),fill('Wind units',2),fill('Gas units',1),click('Check strategy plan')])}
];

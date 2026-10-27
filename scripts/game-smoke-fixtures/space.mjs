const fill=(label,value)=>({type:'fill',label,value:String(value)});
const click=name=>({type:'click',name});
const rounds=fn=>[0,1,2].map(fn);
export const fixtures=[
 {id:'lunar-landing',rounds:rounds(r=>[fill('High-altitude burn',r+2),fill('Final landing burn',2),click('Land craft')])},
 {id:'orbit-planner',rounds:rounds(r=>[fill('Orbit radius',r+1),fill('Orbital speed',6/Math.sqrt(r+1)),click('Test orbit')])},
 {id:'rocket-staging',rounds:rounds(r=>[click('Fire booster'),click('Release empty booster'),...(r===1?[click('Release payload fairing')]:[]),click('Fire upper engine'),...(r===2?[click('Deploy radio antenna')]:[])])},
 {id:'vector-flight',rounds:rounds(r=>[fill('Horizontal thrust',r+2),fill('Vertical thrust',4-r),click('Fly vector')])},
 {id:'asteroid-tracker',rounds:rounds(r=>[[2,3,2],[3,2,1],[1,2,3]][r].map(l=>click(`Move to lane ${l}`)))},
 {id:'gravity-drop',rounds:rounds(r=>[fill('Drop height',r+2),fill('Mass of object A',1),fill('Mass of object B',5),click('Run drop experiment'),fill('Predicted fall time',2),click('Compare prediction')])},
 {id:'solar-route',rounds:rounds(r=>['Venus','Earth','Mars','Jupiter','Saturn'].slice(r,r+3).map(p=>click(`Travel to ${p}`)))},
 {id:'light-delay',rounds:rounds(r=>[['Near beacon','Middle beacon','Far beacon'],['Middle beacon','Far beacon','Near beacon'],['Far beacon','Near beacon','Middle beacon']][r].map(s=>click(`Receive ${s}`)))},
 {id:'escape-velocity',rounds:rounds(r=>[fill('Propulsion energy',8+r*2),fill('Shield energy',2),click('Launch escape')])},
];

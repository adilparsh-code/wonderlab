const click = name => ({type:'click',name});
const fill = (label,value) => ({type:'fill',label,value:String(value)});
const select = (label,value) => ({type:'select',label,value});
export const fixtures = [
{id:'robot-programmer',rounds:[['East','East','South'],['South','South','East'],['East','South','East','South']].map(a=>[...a.map(x=>click(`Queue ${x}`)),click('Run robot')])},
{id:'debugging-workshop',rounds:[2,3,4].map(n=>[fill('Replacement increment',n),click('Run repaired trace')])},
{id:'logic-gates',rounds:['AND','OR','XOR'].map(g=>[select('Gate',g),select('Left wire','A'),select('Right wire','B'),click('Test circuit')])},
{id:'loop-garden',rounds:[2,3,4].map(n=>[fill('Repeat count',n),select('Loop body','Leaf Flower'),click('Grow loop')])},
{id:'stack-machine',rounds:[[2,3,'Add'],[7,2,'Subtract'],[3,4,'Multiply']].map(([a,b,op])=>[fill('Push value',a),click('Push onto stack'),fill('Push value',b),click('Push onto stack'),click(op),click('Check stack')])},
{id:'sorting-network',rounds:[['Compare positions 1 and 2','Compare positions 2 and 3'],['Compare positions 2 and 3','Compare positions 1 and 2'],['Compare positions 1 and 2','Compare positions 2 and 3','Compare positions 1 and 2']].map(a=>[...a.map(click),click('Check ordering')])},
{id:'binary-register',rounds:[['Shift left','Toggle bit 1'],['Shift left','Toggle bit 2'],['Shift right','Toggle bit 4']].map(a=>[...a.map(click),click('Check register')])},
{id:'flowchart-router',rounds:[[4,8,3],[5,10,4],[6,12,5]].map(v=>[...v.map(x=>select(`Route value ${x}`,x%2?'Odd':x<([6,8,10][[4,5,6].indexOf(v[0])])?'Small even':'Large even')),click('Run flowchart')])},
{id:'search-lab',rounds:[['Keep lower half','Keep upper half','Found target'],['Keep upper half','Keep lower half','Found target'],['Keep upper half','Keep upper half','Found target']].map(a=>a.map(click))}
];

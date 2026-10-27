import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { SpaceBoard } from './space';
afterEach(cleanup);
const cases = ['lunar-landing','orbit-planner','rocket-staging','vector-flight','asteroid-tracker','gravity-drop','solar-route','light-delay','escape-velocity'];
function fill(label:string,value:number|string){fireEvent.change(screen.getByLabelText(label),{target:{value:String(value)}});}
function click(name:string){fireEvent.click(screen.getByRole('button',{name}));}
for(const id of cases) for(let round=0;round<3;round++) test(`${id} round ${round+1} is solvable`,()=>{
 const onResult=vi.fn();render(<SpaceBoard gameId={id} round={round} disabled={false} onResult={onResult}/>);
 if(id==='lunar-landing'){fill('High-altitude burn',round+2);fill('Final landing burn',2);click('Land craft');}
 if(id==='orbit-planner'){fill('Orbit radius',round+1);fill('Orbital speed',6/Math.sqrt(round+1));click('Test orbit');}
 if(id==='rocket-staging'){click('Fire booster');click('Release empty booster');if(round===1)click('Release payload fairing');click('Fire upper engine');if(round===2)click('Deploy radio antenna');}
 if(id==='vector-flight'){fill('Horizontal thrust',round+2);fill('Vertical thrust',4-round);click('Fly vector');}
 if(id==='asteroid-tracker'){for(const lane of [[2,3,2],[3,2,1],[1,2,3]][round])click(`Move to lane ${lane}`);}
 if(id==='gravity-drop'){fill('Drop height',round+2);fill('Mass of object A',1);fill('Mass of object B',5);click('Run drop experiment');fill('Predicted fall time',2);click('Compare prediction');}
 if(id==='solar-route'){for(const stop of [['Venus','Earth','Mars'],['Earth','Mars','Jupiter'],['Mars','Jupiter','Saturn']][round])click(`Travel to ${stop}`);}
 if(id==='light-delay'){for(const signal of [['Near beacon','Middle beacon','Far beacon'],['Middle beacon','Far beacon','Near beacon'],['Far beacon','Near beacon','Middle beacon']][round])click(`Receive ${signal}`);}
 if(id==='escape-velocity'){fill('Propulsion energy',8+round*2);fill('Shield energy',2);click('Launch escape');}
 expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
});
for(const id of ['lunar-landing','orbit-planner','vector-flight','escape-velocity'])test(`${id} rejects untouched controls`,()=>{const onResult=vi.fn();render(<SpaceBoard gameId={id} round={0} disabled={false} onResult={onResult}/>);click({'lunar-landing':'Land craft','orbit-planner':'Test orbit','vector-flight':'Fly vector','escape-velocity':'Launch escape'}[id]!);expect(onResult).toHaveBeenCalledWith(expect.objectContaining({correct:false}));});
test('incorrect sequence fails and disabled controls cannot report',()=>{const onResult=vi.fn();const view=render(<SpaceBoard gameId="rocket-staging" round={0} disabled={false} onResult={onResult}/>);click('Fire upper engine');expect(onResult).toHaveBeenCalledWith(expect.objectContaining({correct:false}));onResult.mockClear();view.rerender(<SpaceBoard gameId="rocket-staging" round={0} disabled onResult={onResult}/>);click('Fire booster');expect(onResult).not.toHaveBeenCalled();});

for(const id of ['asteroid-tracker','solar-route','light-delay','gravity-drop'])test(`${id} rejects an invalid plan`,()=>{const onResult=vi.fn();render(<SpaceBoard gameId={id} round={0} disabled={false} onResult={onResult}/>);click({'asteroid-tracker':'Move to lane 1','solar-route':'Travel to Saturn','light-delay':'Receive Far beacon','gravity-drop':'Compare prediction'}[id]!);expect(onResult).toHaveBeenCalledWith(expect.objectContaining({correct:false}));});

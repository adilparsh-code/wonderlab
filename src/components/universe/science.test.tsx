import {afterEach, expect, it, vi} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {ScienceBoard} from './science';
// Browser and unit tests share only actions, never production challenge answers.
import {fixtures as browserFixtures} from '../../../scripts/game-smoke-fixtures/science.mjs';
type Action = {type:'click';name:string}|{type:'fill'|'select';label:string;value:string};
const fixtures=browserFixtures as unknown as {id:string;rounds:Action[][]}[];
afterEach(cleanup);
for (const fixture of fixtures) {
 for (const round of [0,1,2]) it(`${fixture.id} evaluates winning stage ${round+1}`,()=>{
  const onResult=vi.fn(); render(<ScienceBoard gameId={fixture.id} round={round} disabled={false} onResult={onResult}/>);
  for(const action of fixture.rounds[round]) {
   if(action.type==='click') fireEvent.click(screen.getByRole('button',{name:action.name}));
   else fireEvent.change(screen.getByLabelText(action.label),{target:{value:action.value}});
  }
  expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
 });
 it(`${fixture.id} rejects an incomplete model`,()=>{
  const onResult=vi.fn(); render(<ScienceBoard gameId={fixture.id} round={0} disabled={false} onResult={onResult}/>);
  fireEvent.click(screen.getByRole('button',{name:'Check science model'}));
  expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
 });
 it(`${fixture.id} locks all actions when disabled`,()=>{
  const onResult=vi.fn(); render(<ScienceBoard gameId={fixture.id} round={0} disabled onResult={onResult}/>);
  fireEvent.click(screen.getByRole('button',{name:'Check science model'})); expect(onResult).not.toHaveBeenCalled();
 });
}
it('rejects positive coefficients that do not conserve atoms',()=>{
 const onResult=vi.fn();render(<ScienceBoard gameId="equation-balancer" round={0} disabled={false} onResult={onResult}/>);
 for(const n of [1,2,3])fireEvent.change(screen.getByLabelText(`Coefficient ${n}`),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Check science model'}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
});
it('accepts atom-conserving coefficient multiples',()=>{
 const onResult=vi.fn();render(<ScienceBoard gameId="equation-balancer" round={0} disabled={false} onResult={onResult}/>);
 [4,2,4].forEach((v,i)=>fireEvent.change(screen.getByLabelText(`Coefficient ${i+1}`),{target:{value:String(v)}}));
 fireEvent.click(screen.getByRole('button',{name:'Check science model'}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
});
it('rejects a habitat allocation that spends the budget but cannot feed consumers',()=>{
 const onResult=vi.fn();render(<ScienceBoard gameId="ecosystem-budget" round={0} disabled={false} onResult={onResult}/>);
 fireEvent.change(screen.getByLabelText('Producer patches'),{target:{value:'2'}});fireEvent.change(screen.getByLabelText('Consumer groups'),{target:{value:'3'}});
 fireEvent.click(screen.getByRole('button',{name:'Check science model'}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
});
it('turns a valid circuit off when a bypass is added',()=>{
 const onResult=vi.fn();render(<ScienceBoard gameId="circuit-connect" round={0} disabled={false} onResult={onResult}/>);
 for(const edge of ['A–B','B–C','C–D','D–A','A–D (bypass)'])fireEvent.click(screen.getByRole('button',{name:`Wire ${edge}`}));
 fireEvent.click(screen.getByRole('button',{name:'Check science model'}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
});

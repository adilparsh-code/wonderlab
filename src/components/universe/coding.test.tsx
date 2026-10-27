import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { CodingBoard } from './coding';
// Browser and unit verification share actions only; application code never imports answers.
import { fixtures } from '../../../scripts/game-smoke-fixtures/coding.mjs';
afterEach(cleanup);
for (const fixture of fixtures) for(let round=0;round<3;round++) test(`${fixture.id} stage ${round+1}`,()=>{
 const onResult=vi.fn();render(<CodingBoard gameId={fixture.id} round={round} disabled={false} onResult={onResult}/>);
 for(const action of fixture.rounds[round]) {
 if('name' in action)fireEvent.click(screen.getByRole('button',{name:action.name}));
 else fireEvent.change(screen.getByLabelText(action.label),{target:{value:action.value}});
 }
 expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
});
for(const [id,button] of [['robot-programmer','Run robot'],['debugging-workshop','Run repaired trace'],['logic-gates','Test circuit'],['loop-garden','Grow loop'],['stack-machine','Check stack'],['sorting-network','Check ordering'],['binary-register','Check register'],['flowchart-router','Run flowchart'],['search-lab','Found target']])test(`${id} provides wrong feedback and respects disabled`,()=>{
 const onResult=vi.fn();const view=render(<CodingBoard gameId={id} round={0} disabled={false} onResult={onResult}/>);
 fireEvent.click(screen.getByRole('button',{name:button}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false,message:expect.any(String)}));
 onResult.mockClear();view.rerender(<CodingBoard gameId={id} round={0} disabled onResult={onResult}/>);fireEvent.click(screen.getByRole('button',{name:button}));expect(onResult).not.toHaveBeenCalled();
});

test('stack requires the requested arithmetic operation, not just a directly pushed target',()=>{
 const onResult=vi.fn();render(<CodingBoard gameId="stack-machine" round={0} disabled={false} onResult={onResult}/>);
 fireEvent.change(screen.getByLabelText('Push value'),{target:{value:'5'}});
 fireEvent.click(screen.getByRole('button',{name:'Push onto stack'}));
 fireEvent.click(screen.getByRole('button',{name:'Check stack'}));
 expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
});

const stackClick=(name:string)=>fireEvent.click(screen.getByRole('button',{name}));
const push=(value:number)=>{fireEvent.change(screen.getByLabelText('Push value'),{target:{value:String(value)}});stackClick('Push onto stack');};
for(const round of [0,1,2]){
 test(`stack stage ${round+1} rejects discarded required work and preserves surviving expression provenance`,()=>{
  const onResult=vi.fn();render(<CodingBoard gameId="stack-machine" round={round} disabled={false} onResult={onResult}/>);
  const op=['Add','Subtract','Multiply'][round],target=[5,5,12][round];
  stackClick(op);expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false,message:expect.stringMatching(/two values/)}));
  push(0);push(0);stackClick(op);stackClick('Pop top');push(target);stackClick('Check stack');
  expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
  stackClick('Pop top');
  // Valid alternative operands, followed by another operator: provenance must survive composition.
  const operands=[[1,4],[9,4],[2,6]][round];push(operands[0]);push(operands[1]);stackClick(op);push(0);stackClick('Add');
  stackClick('Check stack');stackClick('Check stack');expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
 });
 test(`stack stage ${round+1} starts fresh on restart and accepts replay`,()=>{
  const onResult=vi.fn();const view=render(<CodingBoard key="first" gameId="stack-machine" round={round} disabled={false} onResult={onResult}/>);
  for(const key of ['first','restart']){
   if(key==='restart')view.rerender(<CodingBoard key={key} gameId="stack-machine" round={round} disabled={false} onResult={onResult}/>);
   stackClick('Pop top');expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false,message:expect.stringMatching(/empty/)}));
   push([5,5,12][round]);stackClick('Check stack');expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));stackClick('Pop top');
   const operands=[[6,-1],[3,-2],[-3,-4]][round];push(operands[0]);push(operands[1]);stackClick(['Add','Subtract','Multiply'][round]);stackClick('Check stack');
   expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
  }
 });
}

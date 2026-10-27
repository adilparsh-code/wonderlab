import {afterEach, expect, it, vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {StrategyBoard} from './strategy';
import {fixtures as rawFixtures} from '../../../scripts/game-smoke-fixtures/strategy.mjs';
type Action = {type:'click'; name:string} | {type:'fill'|'select';label:string;value:string};
const fixtures = rawFixtures as unknown as {id:string; rounds:Action[][]}[];
afterEach(cleanup);
for(const fixture of fixtures){
 for(const round of [0,1,2]) it(`${fixture.id} wins mission ${round+1}`,()=>{
  const onResult=vi.fn();render(<StrategyBoard gameId={fixture.id} round={round} disabled={false} onResult={onResult}/>);
  for(const a of fixture.rounds[round]){if(a.type==='click')fireEvent.click(screen.getByRole('button',{name:a.name}));else fireEvent.change(screen.getByLabelText(a.label),{target:{value:a.value}});}
  expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
 });
 it(`${fixture.id} rejects an empty plan`,()=>{const onResult=vi.fn();render(<StrategyBoard gameId={fixture.id} round={0} disabled={false} onResult={onResult}/>);fireEvent.click(screen.getByRole('button',{name:'Check strategy plan'}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));});
 it(`${fixture.id} respects disabled`,()=>{const onResult=vi.fn();render(<StrategyBoard gameId={fixture.id} round={0} disabled onResult={onResult}/>);fireEvent.click(screen.getByRole('button',{name:'Check strategy plan'}));expect(onResult).not.toHaveBeenCalled();for(const control of screen.getAllByRole('button'))expect(control.closest('fieldset')?.disabled || control.hasAttribute('disabled')).toBe(true);});
}
it('Mars cannot skip the expedition sequence',()=>{const onResult=vi.fn();render(<StrategyBoard gameId="mars-expedition" round={0} disabled={false} onResult={onResult}/>);fireEvent.click(screen.getByRole('button',{name:'Return to base'}));fireEvent.click(screen.getByRole('button',{name:'Check strategy plan'}));expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));});

const marsClick=(name:string)=>fireEvent.click(screen.getByRole('button',{name}));
const marsFill=(label:string,value:string)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
for(const round of [0,1,2]) {
 it(`Mars mission ${round+1} freezes valid cargo and consumes only packed supplies`,()=>{
  const onResult=vi.fn();render(<StrategyBoard gameId="mars-expedition" round={round} disabled={false} onResult={onResult}/>);
  marsFill('Oxygen tanks',String(round+3));marsFill('Rover fuel',String(round+2));marsClick('Pack rover');
  for(const value of ['0','-1','30','']){marsFill('Oxygen tanks',value);marsFill('Rover fuel',value);}
  expect((screen.getByLabelText('Oxygen tanks') as HTMLInputElement).value).toBe(String(round+3));
  expect((screen.getByLabelText('Rover fuel') as HTMLInputElement).disabled).toBe(true);
  marsClick('Drive to research site');expect(screen.getByText(/Oxygen remaining/).textContent).toContain(`fuel remaining ${round+1}`);
  marsClick('Collect rock sample');expect(screen.getByText(/Oxygen remaining/).textContent).toContain('fuel remaining 1');
  marsClick('Return to base');expect(screen.getByText(/Oxygen remaining/).textContent).toContain('Oxygen remaining 0; fuel remaining 0');
  marsClick('Check strategy plan');marsClick('Check strategy plan');expect(onResult.mock.calls.every(([result])=>result.correct)).toBe(true);
 });
 it(`Mars mission ${round+1} rejects invalid or insufficient cargo and can replay after remount`,()=>{
  const onResult=vi.fn();const view=render(<StrategyBoard key="first" gameId="mars-expedition" round={round} disabled={false} onResult={onResult}/>);
  for(const [o,f] of [['0','0'],['-1','2'],[String(round+2),String(round+2)],[String(round+3),String(round+1)],['30','30'],['1.5','2'],['','']]){
   marsFill('Oxygen tanks',o);marsFill('Rover fuel',f);marsClick('Pack rover');
   expect(screen.getByRole('status').textContent).toMatch(/enough oxygen and fuel/);
   marsClick('Drive to research site');marsClick('Collect rock sample');marsClick('Return to base');marsClick('Check strategy plan');
   expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
  }
  for(const key of ['first','replay']){
   if(key==='replay')view.rerender(<StrategyBoard key={key} gameId="mars-expedition" round={round} disabled={false} onResult={onResult}/>);
   marsClick('Check strategy plan');expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:false}));
   marsFill('Oxygen tanks',String(round+3));marsFill('Rover fuel',String(round+2));
   for(const name of ['Pack rover','Drive to research site','Collect rock sample','Return to base','Check strategy plan'])marsClick(name);
   expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
  }
 });
}

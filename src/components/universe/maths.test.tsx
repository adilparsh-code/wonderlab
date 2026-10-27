import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MathsBoard } from './maths';
// Browser fixtures deliberately remain outside application code.
import { fixtures } from '../../../scripts/game-smoke-fixtures/maths.mjs';
afterEach(cleanup);
type Action = {type:string;label?:string;value?:string;name?:string};
describe('Maths constructions',()=>{
 for(const fixture of fixtures){
 fixture.rounds.forEach((actions:Action[],round:number)=>it(`${fixture.id} round ${round+1} solves`,()=>{
 const onResult=vi.fn();render(<MathsBoard gameId={fixture.id} round={round} disabled={false} onResult={onResult}/>);
 for(const action of actions) if(action.type==='fill') fireEvent.change(screen.getByLabelText(action.label!),{target:{value:action.value}});else fireEvent.click(screen.getByRole('button',{name:action.name}));
 expect(onResult).toHaveBeenLastCalledWith(expect.objectContaining({correct:true}));
 }));
 it(`${fixture.id} rejects unfinished maths`,()=>{const onResult=vi.fn();render(<MathsBoard gameId={fixture.id} round={0} disabled={false} onResult={onResult}/>);fireEvent.click(screen.getByRole('button',{name:'Check construction'}));expect(onResult).toHaveBeenCalledWith(expect.objectContaining({correct:false}));});
 it(`${fixture.id} respects disabled`,()=>{const onResult=vi.fn();render(<MathsBoard gameId={fixture.id} round={0} disabled onResult={onResult}/>);fireEvent.click(screen.getByRole('button',{name:'Check construction'}));expect(onResult).not.toHaveBeenCalled();});
 }
});

it.each([
 ['fraction-kitchen','Portions','4'],
 ['equation-balance','Operation amount','1'],
 ['coordinate-constructor','Point x','3'],
 ['angle-workshop','Angle in degrees','120'],
 ['probability-bag','Blue counters','3'],
 ['sudoku-mini','Row 1 column 1','4'],
 ['prime-factor-tree','Left factor of 12','5'],
 ['geometry-tiles','Tile columns','6'],
 ['number-line-jumps','First signed jump','-5'],
])('%s rejects an incorrect numeric construction',(gameId,label,value)=>{
 const onResult=vi.fn();render(<MathsBoard gameId={gameId} round={0} disabled={false} onResult={onResult}/>);
 fireEvent.change(screen.getByLabelText(label),{target:{value}});
 fireEvent.click(screen.getByRole('button',{name:'Check construction'}));
 expect(onResult).toHaveBeenCalledWith(expect.objectContaining({correct:false}));
});
it('rejects invalid factor products without changing the tree',()=>{
 const onResult=vi.fn();render(<MathsBoard gameId="prime-factor-tree" round={0} disabled={false} onResult={onResult}/>);
 fireEvent.change(screen.getByLabelText('Left factor of 12'),{target:{value:'5'}});
 fireEvent.change(screen.getByLabelText('Right factor of 12'),{target:{value:'3'}});
 fireEvent.click(screen.getByRole('button',{name:'Split 12'}));
 expect(screen.getByRole('status').textContent).toContain('product is 12');
 expect(screen.getByRole('button',{name:'Split 12'})).toBeTruthy();
});

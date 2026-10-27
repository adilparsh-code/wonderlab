const fill = (label, value) => ({ type: 'fill', label, value: String(value) });
const click = name => ({type:'click',name});
const rounds = values => values.map(fields => [...fields.map(([label,value])=>fill(label,value)),click('Check construction')]);
export const fixtures = [
 {id:'fraction-kitchen',rounds:rounds([[['Portions',3]],[['Portions',5]],[['Portions',7]]])},
 {id:'equation-balance',rounds:[3,4,5].map(n=>[click('Subtract from both sides'),fill('Operation amount',n),click('Apply operation'),click('Divide both sides'),fill('Operation amount',2),click('Apply operation'),click('Check construction')])},
 {id:'coordinate-constructor',rounds:rounds([[['Point x',4],['Point y',3]],[['Point x',-2],['Point y',4]],[['Point x',-3],['Point y',-2]]])},
 {id:'angle-workshop',rounds:rounds([[['Angle in degrees',60]],[['Angle in degrees',125]],[['Angle in degrees',270]]])},
 {id:'probability-bag',rounds:rounds([[['Blue counters',2],['Orange counters',4]],[['Blue counters',6],['Orange counters',2]],[['Blue counters',3],['Orange counters',6]]])},
 {id:'sudoku-mini',rounds:rounds([[['Row 1 column 1',1],['Row 2 column 3',1],['Row 3 column 2',1],['Row 4 column 4',1]],[['Row 1 column 1',2],['Row 2 column 3',2],['Row 3 column 2',2],['Row 4 column 4',2]],[['Row 1 column 1',3],['Row 2 column 3',3],['Row 3 column 2',3],['Row 4 column 4',3]]])},
 {id:'prime-factor-tree',rounds:[12,18,30].map((n,i)=>[fill(`Left factor of ${n}`,i===2?5:3),fill(`Right factor of ${n}`,i===0?4:6),click(`Split ${n}`),fill(`Left factor of ${i===0?4:6}`,2),fill(`Right factor of ${i===0?4:6}`,i===0?2:3),click(`Split ${i===0?4:6}`),click('Check construction')])},
 {id:'geometry-tiles',rounds:rounds([[['Tile columns',3],['Tile rows',4]],[['Tile columns',5],['Tile rows',2]],[['Tile columns',4],['Tile rows',4]]])},
 {id:'number-line-jumps',rounds:rounds([[['First signed jump',5],['Second signed jump',-2]],[['First signed jump',-6],['Second signed jump',3]],[['First signed jump',-4],['Second signed jump',-3]]])}
];

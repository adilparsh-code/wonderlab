const fill = (label, value) => ({ type: 'fill', label, value: String(value) });
const select = (label, value) => ({ type: 'select', label, value });
const click = (name) => ({ type: 'click', name });
const check = click('Check science model');
export const fixtures = [
 {id:'atom-builder',rounds:[[fill('Protons',2),fill('Electrons',2),check],[fill('Protons',6),fill('Electrons',6),check],[fill('Protons',8),fill('Electrons',10),check]]},
 {id:'equation-balancer',rounds:[[fill('Coefficient 1',2),fill('Coefficient 2',1),fill('Coefficient 3',2),check],[fill('Coefficient 1',1),fill('Coefficient 2',3),fill('Coefficient 3',2),check],[fill('Coefficient 1',4),fill('Coefficient 2',3),fill('Coefficient 3',2),check]]},
 {id:'circuit-connect',rounds:[['A–B','B–C','C–D','D–A'],['A–C','C–B','B–D','D–A'],['A–B','B–D','D–C','C–A']].map(edges=>[...edges.map(e=>click(`Wire ${e}`)),check])},
 {id:'dna-repair',rounds:['TAGC','GCAT','ATGCC'].map(s=>[fill('Repaired DNA strand',s),check])},
 {id:'ecosystem-budget',rounds:[[fill('Producer patches',4),fill('Consumer groups',2),check],[fill('Producer patches',6),fill('Consumer groups',3),check],[fill('Producer patches',8),fill('Consumer groups',4),check]]},
 {id:'microscope-focus',rounds:[[fill('Focus setting',3),fill('Cell width in micrometres',40),select('Observed structure','plant'),check],[fill('Focus setting',6),fill('Cell width in micrometres',30),select('Observed structure','animal'),check],[fill('Focus setting',8),fill('Cell width in micrometres',50),select('Observed structure','plant'),check]]},
 {id:'material-sort',rounds:[['iron','glass','rubber'],['copper','ceramic','plastic'],['aluminium','wood','silicone']].map(items=>[select(`Bin for ${items[0]}`,'conductor'),select(`Bin for ${items[1]}`,'rigid insulator'),select(`Bin for ${items[2]}`,'flexible insulator'),check])},
 {id:'lab-measurement',rounds:[[fill('Scale reading',35),fill('Converted volume in litres',0.035),check],[fill('Scale reading',70),fill('Converted volume in litres',0.07),check],[fill('Scale reading',125),fill('Converted volume in litres',0.125),check]]},
 {id:'method-investigator',rounds:[['light','water','height'],['water','light','height'],['temperature','water','time']].map(a=>[select('Variable to change',a[0]),select('Variable to hold constant',a[1]),select('Outcome to measure',a[2]),check])}
];

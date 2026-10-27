# Game universe catalogue

50 implemented games: eight preserved legacy games and 42 new three-stage journeys. Verification evidence and limitations are recorded in [the expansion report](GAME_UNIVERSE_REPORT.md). All games use local controls, native keyboard/touch inputs and replay/reset. No external assets or services. New games share stage/score/persistence UI but use the distinct mechanics listed below.

## Space & Physics

| Game / route | Learning objective | Mechanic and controls | Stages |
|---|---|---|---|
| [Lunar Landing](/arcade/lunar-landing/) | Reach intermediate speed 4 and touchdown speed 2. | staged-thrust. Enter each burn amount, then land. | 3 |
| [Orbit Planner](/arcade/orbit-planner/) | Match the requested radius and stable orbit rule. | radius-speed-balance. Set radius and speed, then test your orbit. | 3 |
| [Rocket Staging](/arcade/rocket-staging/) | Complete the launch sequence in a physically useful order. | ordered-stage-resources. Fire the booster, release it, then use the upper engine. | 3 |
| [Vector Flight](/arcade/vector-flight/) | Reach the docking coordinates. | vector-endpoint. Set both thrust components and inspect the endpoint. | 3 |
| [Asteroid Tracker](/arcade/asteroid-tracker/) | Survive all three turns. | turn-based-lane-navigation. Read the clear-lane sequence and move once per turn. | 3 |
| [Gravity Drop](/arcade/gravity-drop/) | Control height and masses, then predict fall time. | controlled-gravity-experiment. Set the requested experiment, run it, and compare your calculation. | 3 |
| [Solar Route](/arcade/solar-route/) | Visit three adjacent stops in outward order. | fuel-limited-planet-route. Read the route and choose each next planet. | 3 |
| [Light Delay](/arcade/light-delay/) | Receive the three beacons in arrival order. | signal-timeline-order. Add send time and travel time before receiving each signal. | 3 |
| [Escape Energy](/arcade/escape-velocity/) | Fund escape and shielding without exceeding the budget. | escape-energy-allocation. Allocate both energy values, then launch. | 3 |

## Science Lab

| Game / route | Learning objective | Mechanic and controls | Stages |
|---|---|---|---|
| [Atom Builder](/arcade/atom-builder/) | Match proton and electron counts to an element and charge. | Particle construction. Set the two particle counts, then check your model. | 3 |
| [Equation Balancer](/arcade/equation-balancer/) | Find positive integer coefficients that conserve each element. | Atom conservation. Enter coefficients in equation order without changing subscripts. | 3 |
| [Circuit Connect](/arcade/circuit-connect/) | Close one path through the battery, switch and lamp. | Circuit construction. Toggle wire segments to complete the specified loop without bypasses. | 3 |
| [DNA Repair](/arcade/dna-repair/) | Pair every template base with its complement. | Sequence repair. Type the aligned complementary bases using A–T and C–G. | 3 |
| [Ecosystem Budget](/arcade/ecosystem-budget/) | Support consumers while respecting producer and budget constraints. | Constrained allocation. Allocate whole producer patches and consumer groups using every token. | 3 |
| [Microscope Focus](/arcade/microscope-focus/) | Reveal cell features and convert scale divisions to micrometres. | Focus and measurement. Adjust focus, inspect the sharp model, identify it and measure its width. | 3 |
| [Material Sort](/arcade/material-sort/) | Place each ideal sample in the matching property bin. | Property sorting. Read conductivity and flexibility clues, then choose each sample’s bin. | 3 |
| [Lab Measurement](/arcade/lab-measurement/) | Read the meniscus in millilitres and express the volume in litres. | Scale reading. Use the tick spacing and meniscus marker, then divide millilitres by 1000. | 3 |
| [Method Investigator](/arcade/method-investigator/) | Choose what to change, hold constant and measure. | Experimental design. Assign the variable, control and outcome for each investigation. | 3 |

## Coding & Logic

| Game / route | Learning objective | Mechanic and controls | Stages |
|---|---|---|---|
| [Logic Maze](/arcade/logic-maze/) | Practise sequencing, spatial reasoning, and debugging. | Preserved original gameplay. Move from the green start to the star. Dark squares are blocked; use the arrow keys or buttons. | Original rounds / levels |
| [Binary Challenge](/arcade/binary-challenge/) | Understand binary place values and number conversion. | Preserved original gameplay. Convert 19 to binary. Use only 0s and 1s; the leftmost digit has the largest place value. | Original rounds / levels |
| [Algorithm Builder](/arcade/algorithm-builder/) | Explore algorithms as precise, ordered instructions. | Preserved original gameplay. Choose each step in order: define a goal, write instructions, then test and improve them. | Original rounds / levels |
| [Robot Programmer](/arcade/robot-programmer/) | Reach the marked destination without leaving the grid. | command queue. Queue compass moves, inspect the route, then run. | 3 |
| [Debugging Workshop](/arcade/debugging-workshop/) | Make every trace step match the intended sequence. | trace repair. Inspect the expected trace and replace the faulty increment. | 3 |
| [Logic Gates](/arcade/logic-gates/) | Match the complete target truth table. | gate wiring. Choose a gate and its two input wires, then test. | 3 |
| [Loop Garden](/arcade/loop-garden/) | Reproduce the target garden exactly. | repeat loops. Set the loop body and repeat count, then grow. | 3 |
| [Stack Machine](/arcade/stack-machine/) | Leave exactly the target number on the stack. | postfix stack. Push numbers, apply an operator, and check the stack. | 3 |
| [Sorting Network](/arcade/sorting-network/) | Put all values in ascending order. | compare and swap. Run compare-and-swap links, then check the ordering. | 3 |
| [Binary Register](/arcade/binary-register/) | Make the register match the target bit pattern. | register operations. Shift bits or toggle individual positions, then check. | 3 |
| [Flowchart Router](/arcade/flowchart-router/) | Route each value to its correct output. | conditional routing. Check evenness, then compare even values to the threshold. | 3 |
| [Search Lab](/arcade/search-lab/) | Find the target by keeping the correct half each time. | interval search. Compare the midpoint to the target and discard a half. | 3 |

## Maths & Brain

| Game / route | Learning objective | Mechanic and controls | Stages |
|---|---|---|---|
| [Memory Matrix](/arcade/memory-matrix/) | Practise careful observation and sequential thinking. | Preserved original gameplay. Start a round, watch a sequence of tiles, then select them in order. Each level adds a step. | Original rounds / levels |
| [Number Quest](/arcade/number-quest/) | Build fluency with multiplication and explain a calculation. | Preserved original gameplay. Choose a multiplication level, solve the question, and enter a whole-number answer. | Original rounds / levels |
| [Pattern Detective](/arcade/pattern-detective/) | Recognise and describe a repeating mathematical rule. | Preserved original gameplay. Each number is twice the one before it. Enter the next number in the sequence. | Original rounds / levels |
| [Typing Sprint](/arcade/typing-sprint/) | Practise accurate typing and interpret a simple rate. | Preserved original gameplay. Type the sentence exactly, then check your accuracy and words per minute. Your text is never saved. | Original rounds / levels |
| [Reaction Challenge](/arcade/reaction-challenge/) | Measure one response time without making claims about ability. | Preserved original gameplay. Start a round and wait for the green signal. Tap too early and you can try again. | Original rounds / levels |
| [Fraction Kitchen](/arcade/fraction-kitchen/) | Count equal portions to match a target fraction. | fraction portion building. Set the number of scoops; the denominator tells you their size. | 3 |
| [Equation Balance](/arcade/equation-balance/) | Use inverse operations on both sides. | balanced algebra operations. Subtract the constant, then divide by the coefficient. Apply each operation to both sides. | 3 |
| [Coordinate Constructor](/arcade/coordinate-constructor/) | Plot the transformed point. | plot and transform points. Read the transformation and enter the new x and y coordinates. | 3 |
| [Angle Workshop](/arcade/angle-workshop/) | Turn the ray to match the requested angle. | angle construction. Enter a whole number of degrees measured anticlockwise from the rightward ray. | 3 |
| [Probability Bag](/arcade/probability-bag/) | Build the requested probability with a fixed total. | bag composition. Enter blue and orange counter counts. Every counter is equally likely to be selected. | 3 |
| [Sudoku Mini](/arcade/sudoku-mini/) | Place 1 to 4 once in each row, column and 2 by 2 box. | 4 by 4 sudoku. Fill the four empty cells and check every row, column and box. | 3 |
| [Prime Factor Tree](/arcade/prime-factor-tree/) | Build a complete factor tree. | recursive factor splitting. Enter two factors of a composite leaf and split it; continue until every leaf is prime. | 3 |
| [Geometry Tiles](/arcade/geometry-tiles/) | Match both an area and a perimeter. | area and perimeter tiling. Choose whole-number columns and rows; each square is one unit tile. | 3 |
| [Number Line Jumps](/arcade/number-line-jumps/) | Build two signed jumps that obey the route. | signed number line jumps. Enter the signed jump sizes, following both directions and lengths. | 3 |

## Adventure & Strategy

| Game / route | Learning objective | Mechanic and controls | Stages |
|---|---|---|---|
| [Eco City Planner](/arcade/eco-city-planner/) | Provide homes and clean power within the city budget. | plot allocation. Choose a use for each plot, inspect the totals, then check your plan. | 3 |
| [Bridge Designer](/arcade/bridge-designer/) | Meet the toy load rating within budget. | toy structural model. Set beam and support counts and choose material. These simplified units are not real engineering advice. | 3 |
| [Water Network](/arcade/water-network/) | Deliver clean water to the target district. | pipe routing. Connect the source and junction pipes, then set pump pressure to offset route loss. | 3 |
| [Cyber Safety Defender](/arcade/cyber-safety-defender/) | Protect private information using a justified safe action. | mock message triage. Read the mock message, choose a response, and learn why it helps. All messages stay in this game. | 3 |
| [Mars Expedition](/arcade/mars-expedition/) | Return a sample to base without exhausting supplies. | resource expedition. Pack supplies, drive, collect a sample, and return in order. | 3 |
| [Energy Grid Manager](/arcade/energy-grid-manager/) | Match demand within cost and emission limits. | power dispatch. Set generation units while respecting weather limits, cost, and emissions. | 3 |

## Scope and educational limits

These are small educational puzzles and construction/planning activities, not commercial physics simulations or complete courses. Numeric constructions are deliberately mixed with sequences, route planning, resource budgets, logical wiring, debugging, stack operations and grid puzzles. Fixed local scenarios support repeatable independent checks; replay does not generate infinite new content. Space/engineering models use disclosed toy units and simplifications. Chemical puzzles are symbolic, not practical experiment instructions; cyber messages are fictional. Older games retain their original age ranges and number of rounds. No claims of learning outcomes or measured student ability. Qualified curriculum and assistive-technology review remain useful before wider release.

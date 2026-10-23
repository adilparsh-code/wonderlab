# Content guide

## Every game entry

Keep a stable, unique lowercase ID and provide a title, plain-language description, learning objective, category, age range, difficulty, instructions, and an identifying symbol in `src/lib/catalog.ts`. `validateCatalog` checks required fields and duplicate IDs; cover new entries with tests.

## Writing and accuracy

- Write original, concise English suitable for ages 11–16.
- Explain why an answer works; do not rely only on right/wrong labels.
- Check arithmetic, units, equations, and terminology independently.
- State where a diagram or simulation simplifies reality.
- Avoid claims about intelligence, guaranteed grades, endorsements, or measured learning outcomes.
- Keep controls and hints close to the relevant activity.

## Interactive content

- Prefer fixed, locally validated choices over arbitrary code execution.
- Keep browser-only state temporary unless progress is explicitly useful.
- Do not collect identifying details or transmit answers or scores.
- Make every published card lead to an implemented activity.
- Add keyboard support and a non-color-only way to interpret state.

English is the initial release language. Keep content separated from presentation where practical so future translation can be considered without external content APIs.

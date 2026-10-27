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

## Adding a universe game

1. Add complete `UniverseGameSpec` metadata to one family file in `src/lib/universe/`. Use a unique kebab-case ID, a distinct mechanic, age/difficulty, objective, instructions and takeaway. Do not register a planned or unavailable activity.
2. Implement all three stages in that family's board. Accept `BoardProps`; respect `disabled`; call `onResult` with accurate explanatory feedback. The shell owns score, reset, progression and storage. Keep the experience distinct from other games, state model limitations, use labelled native controls, and never evaluate user code.
3. Add independently checked winning actions for all three stages to the corresponding test-only smoke fixture, plus wrong-input/incomplete/disabled unit tests. Keep answer fixtures out of app imports. Include adversarial shortcut and alternative-valid-answer tests where relevant.
4. Update the exact registry/family assertions and catalogue. Run frozen install, the full checks, security suite, and both browser matrices against a freshly built local export. Every game must actually finish, replay and reset; a rendered route is insufficient.
5. Check desktop/mobile overflow, keyboard play, failure feedback, progress restoration/reset, loading/error states, and requests. Recheck curriculum correctness with an educator before broad release. No external assets, accounts or telemetry without separate approval.

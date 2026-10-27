# Architecture

## Runtime

- Next.js App Router with strict TypeScript and React client components only where interaction requires them.
- Static export (`output: "export"`) to `out/`; no server runtime or API routes.
- Custom CSS tokens and semantic components instead of a utility CSS framework. This keeps the exported page styling dependency-free and avoids a separate CSS toolchain.
- No remote fonts, image services, analytics, or paid API dependencies.

## Source layout

- `src/app/`: route pages and root metadata/layout.
- `src/components/`: shared navigation, catalogs, games, science models, and coding challenges.
- `src/lib/catalog.ts`: typed game/science content and duplicate/required-field validation.
- `src/lib/game-logic.ts`: pure conversions, scoring, progress validation, and completion updates.
- `src/lib/progress.ts`: guarded access to versioned browser storage.

Game state is local to the game component. Educational prompts are fixed local content. Scores are browser-local convenience data, not verified achievements. No user-entered code is evaluated.

## Static route handling

The `/arcade/[game]/` route exports static pages for IDs in the typed game catalog using `generateStaticParams`. Unknown game IDs use a not-found state. New dynamic routes must supply all build-time parameters to remain compatible with export.

## Design and accessibility

The shared CSS defines colors, spacing, surfaces, typography fallbacks, focus indication, responsive breakpoints, and reduced-motion behavior. Pages use native links, buttons, headings, form labels, and status regions. The static output should be inspected on the chosen host because URL fallback behavior varies.

## Game universe expansion

The registry combines eight legacy entries with 42 metadata entries in `src/lib/universe/{space,science,coding,maths,strategy}.ts`. The static route selects the unchanged legacy player or `UniverseGamePlayer` according to the optional engine field. Five explicitly lazy-imported boards keep family controls in separate chunks. The shell owns loading/error boundaries, three stages, feedback, score, reset/replay and completion persistence. Each board is remounted on stage/reset so no previous puzzle state leaks into the next stage. No new timers, global keyboard handlers, or animation loops are needed. Native controls support keyboard and touch.

New scores start at 100, subtract 10 for each unsuccessful checked answer, and have a floor of 40. Scores are saved only after all three stages pass. The existing validated, bounded `wonderlab.progress.v1` schema and key are unchanged. The completion handler rereads storage immediately before merging; another tab's completed reset is respected. This is not an atomic cross-tab transaction and simultaneous writes remain a known limitation.

XP = 100 × unique known completions; level = 1 + floor(completions / 5). Badge rules are first completion, ten completions, all five worlds, and all 50 games. These are derived views of editable local data, not verified student achievements. Replaying never adds duplicate XP. The daily discovery is selected using floor(UTC epoch milliseconds / 86400000) modulo registry length. No dates, streaks, daily completion history, last-played ordering or saved mid-game state are stored. The UI offers replay and daily discovery rather than claiming those unsupported features.

The catalogue uses explicit `.ts` metadata imports because Node 24 gate scripts also import it directly. `allowImportingTsExtensions` is enabled for the existing no-emit TypeScript setup; dependencies and the lockfile are unchanged. Test-only winning actions stay in `scripts/game-smoke-fixtures/`; application modules never import them. See the catalogue and expansion report for functional browser evidence.

## Phase 6 focused correction

Family boards still load on demand through explicit imports, but rejected promises are no longer held in module-level React.lazy instances. Each mounted loader attempt owns its loading/error state, ignores settlement after reset/unmount, and exposes an explicit Retry game action. Reset discards that attempt and starts the next journey fresh; there is no automatic application retry loop. Successful modules use the bundler's normal cache. A render error boundary remains separate from download error handling. Regression tests cover repeated failures, stale success/rejection, unmount and real playable completion after recovery.

Mars freezes the already required oxygen/fuel loadout at packing and consumes that snapshot according to the existing stage display/rules. Stack arithmetic provenance travels with surviving values, so discarding an expression also discards its qualifying operation history; alternative valid operand expressions remain supported. No catalogue, score cap, XP/badge rule or storage schema changed.

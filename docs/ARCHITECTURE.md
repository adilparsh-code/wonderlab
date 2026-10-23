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

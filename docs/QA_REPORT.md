# QA report

## Verification date

2026-10-23. Checks were run from the dedicated WonderLab project directory on Windows with Node.js 24.13.0, npm 11.18.0, and Git 2.54.0.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed from a clean dependency install |
| `npm test` | Passed: 2 test files, 10 tests |
| `npm run build` | Passed: Next.js static export generated in `out/`, including all eight game routes |
| `npm audit` | Passed: 0 vulnerabilities |

The initial `npm ci` attempt in the project directory could not unlink the Windows SWC native module because a Next.js development server was already using it (`EPERM`). That process was not stopped. To verify a clean installation, the project was copied to an isolated temporary directory and `npm ci` completed there with zero vulnerabilities. Running the CI checks in that clean copy exposed a generated Next.js `LayoutProps` type that was unavailable before a build; the root layout now uses an explicit React `ReactNode` child type instead. Lint, type check, tests, and static build all passed after that fix.

## Browser smoke checks

The production `out/` export was served locally from a temporary static file server; this was not a public deployment.

- Home, Arcade, How Things Work, Coding Lab, Challenges, About, Privacy, and Accessibility loaded directly.
- All eight games were started and completed: Memory Matrix (all three levels), Number Quest (Stretch), Logic Maze (arrow-key route in six moves), Binary Challenge, Pattern Detective, Typing Sprint, Algorithm Builder, and Reaction Challenge.
- Science controls were exercised for all six models: circuit switch and knowledge check, gravity height, water-cycle stage, lever effort arm, selected planet/orbit, and binary value.
- A correct Coding Lab answer produced an explanation and its retry control reset the prompt.
- Best scores survived navigation; the Arcade reset control cleared progress and the cleared state survived reload.
- At a 375 CSS-pixel viewport, the menu opened and the document had no horizontal overflow.
- A fresh static preview loaded the home page and its emitted CSS/JavaScript assets successfully. Internal navigation uses ordinary links so static hosting does not depend on server-side routing.

## Accessibility and privacy review

- Source review confirmed semantic headings and landmarks, labelled inputs, visible focus, accessible status messages, maze keyboard/on-screen controls, and reduced-motion CSS.
- The Logic Maze was completed using arrow keys. Mobile menu operation and horizontal overflow were checked in-browser.
- No independent screen-reader, automated WCAG, or colorimeter audit was run.
- Application code contains no analytics, advertising, remote database, remote fonts, external API, or arbitrary code execution. Scores are optional versioned local storage. The reset control was verified.
- Storage-blocked behavior is handled in code, but was not exercised in a browser with storage deliberately disabled.

## Remaining release work

- No GitHub remote or hosting project is configured; no deployment URL exists.
- Verify direct-route and asset behavior on the chosen Cloudflare Pages project before launch.
- Review the host's current privacy terms and applicable child-privacy, consumer-protection, and accessibility obligations for intended jurisdictions.
- Add an operational contact channel and complete an independent accessibility review before inviting the public.

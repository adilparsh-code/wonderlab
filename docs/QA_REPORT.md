# QA report

## Current remediation verification

**Date:** 2026-10-23
**Commit tested:** `f4fc1223a882fbd58a2e5bc7597598f93f9cbbda`
**Environment:** Windows, Node.js 24.13.0, npm 11.18.0. The worktree contains uncommitted remediation changes.

| Check | Current result |
| --- | --- |
| `npm test` | Passed: 6 test files, 53 tests |
| `npm run lint` | Passed |
| `npm run typecheck -- --incremental false` | Passed |
| `npm run build` | Passed: Next.js generated a static export in `out/` |
| Export inspection | Passed: 19 HTML pages, including the home page, Arcade, How Things Work, Coding Lab, Challenges, About, Privacy, Accessibility, and all eight game routes. The home page's emitted CSS and JavaScript references resolve to files in `out/_next/static/`. |

The Memory Matrix preview now highlights one tile at a time and does not render the sequence as text. The component test checks the preview cues, tile progression, absence of complete sequence strings in rendered text, completion and score, replay, and reset.

### Test setup recovery

Vitest is configured without global test APIs, so suites must import `describe`, `it`, and `expect`. The four component test files already had explicit Vitest imports when inspected during this remediation; the earlier `describe is not defined` failure was therefore not reproducible from their current contents. The initial test run in this remediation instead reported 23 failures and 29 passes across six files. Causes included using jest-dom matchers without that matcher library, missing cleanup between rendered component tests, and ambiguous or incorrect selectors/assertions. The tests were corrected to use available Vitest/Testing Library APIs, clean up after each test, and target the intended controls. No dependencies or Vitest configuration were changed.

### Warnings

- Vitest prints a non-fatal warning that the current config loader does not support the config's ESM syntax; it notes this may matter if the native config loader becomes the default.
- Vitest also prints an informational suggestion about sharing jsdom environments between workers. Tests nevertheless pass.
- The production build completed without a reported warning or error.

## Historical checks recorded before this remediation

The previous version of this report recorded a clean-install check, an `npm audit` result of zero vulnerabilities, and local browser smoke checks for site routes, game flows, science controls, local progress, and a 375-pixel viewport. Those checks are historical report entries; they were **not repeated during this remediation**. The browser checks were not a public deployment.

No dependency audit, browser session, hosted-route check, screen-reader test, automated accessibility scan, or independent color-contrast assessment was run during this remediation.

## Remaining release work

- No Git remote or hosting project is configured, and no public deployment URL exists.
- Preview the built export on the chosen host and verify direct navigation to nested routes and loading of assets there. The successful local export inspection does not prove hosted routing.
- Review the selected host's current privacy terms and applicable child-privacy, consumer-protection, and accessibility obligations for intended jurisdictions.
- Complete independent assistive-technology and accessibility testing before public launch.
- Add an operational contact channel before inviting the public; no public contact address is configured.

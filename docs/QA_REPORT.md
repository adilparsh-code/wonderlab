# QA report

## Historical remediation verification — 23 October 2026

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

## Historical release work from that remediation

These entries describe that earlier review, not the current repository/hosting state; use the Phase 4 update and release report for current gates.

- No Git remote or hosting project is configured, and no public deployment URL exists.
- Preview the built export on the chosen host and verify direct navigation to nested routes and loading of assets there. The successful local export inspection does not prove hosted routing.
- Review the selected host's current privacy terms and applicable child-privacy, consumer-protection, and accessibility obligations for intended jurisdictions.
- Complete independent assistive-technology and accessibility testing before public launch.
- Add an operational contact channel before inviting the public; no public contact address is configured.

## Phase 4 local verification — 27 October 2026

The prior sections are historical. Current branch `work`, HEAD `70e441437c2864c8f5296789e120eec60230e132`, with uncommitted privacy/security/release-engineering work. Final local results: frozen npm install, lint/typecheck, **96 Vitest tests across8 files**, **43 focused security/privacy tests** (35+8, subset of96), **13 separate Node fixture tests**, **28 browser scenarios**, **19 generated HTML pages**, **16 expected page routes**, **384 local references**, dependency audit with0 reported vulnerabilities, actionlint/YAML and diff checks all pass with exit0. Actual commands/evidence and limits are in the Phase4 sections of the [security report](./RED_TEAM_SECURITY_REPORT.md) and [release report](./PHASE_2B_RELEASE_REPORT.md).

The increased test count is five additional storage/notification/repeated-click/timer cases; no old test was removed/skipped. Browser checks additionally validate resolved URL origins and delayed reset state. Regex leak scans are bounded, browser-internal traffic is not measured, and local static-host behaviour does not verify production settings. Hosted CI execution, production privacy/security/retention, verified operator/contact and current legal requirements remain unverified. **Production release remains BLOCKED.** No commit, push, PR, merge or deployment was performed.

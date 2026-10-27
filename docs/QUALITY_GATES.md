# Local quality gates and CI

Requirements: Node.js **24 or later**, npm, and the checked-out repository. Run commands from the repository root. The lockfile is authoritative; installation and checks do not authorize committing, pushing or deploying.

## Standard contributor checks

```sh
npm ci
npm run check
npm run test:security
npm run audit:dependencies
```

`check` runs lint, typecheck, the complete Vitest suite, the Node quality-gate fixture tests, the production build, and static-export validation sequentially. `&&` preserves failure: later commands do not run after a failure, and the command exits nonzero. Security/privacy tests are a subset of the full Vitest suite; the explicit alias is useful for focused work. Dependency audit is a separate online check; registry/access failure is not a passing audit and does not justify disabling verification or automatically upgrading dependencies.

| Task | Exact command |
| --- | --- |
| Frozen dependency installation | `npm ci` |
| Lint / types | `npm run lint` / `npm run typecheck` |
| All component and logic tests | `npm test` |
| Focused privacy/security | `npm run test:security` |
| Gate failure-behaviour fixtures | `npm run test:quality` |
| Build static export | `npm run build` |
| Validate expected routes/assets/maps | `npm run validate:export` |
| Advisory audit | `npm run audit:dependencies` |
| Legacy/security browser scenarios | `npm run test:browser` (prerequisites below) |
| 42-game expansion matrix | `npm run test:universe` (same prerequisites) |
| Focused gameplay/download regressions | `node scripts/remediation-browser.mjs` (same prerequisites) |
| Whitespace | `git diff --check` |

The export checker derives all current page routes from `src/app` and expands the known game route using the catalog. A new unsupported dynamic route fails explicitly until its enumeration is added. It requires regular files for every expected page, the static 404, and referenced local links/assets; symlinks anywhere in the inspected export are rejected. It parses case-insensitive `src`/`href` attributes (including spacing and quoted/unquoted values) and a constrained image `srcset` syntax. Malformed/unsupported inspected references fail closed with diagnostics. HTML base elements are rejected because their reference-resolution behavior is outside this scanner’s contract. CSS URLs, inline script strings and other URL-bearing HTML attributes remain outside this bounded scanner contract. Exported maps, internal documents/configuration and known credential patterns are checked in a bounded scan; a regex scan cannot prove that no secrets exist. Tests use disposable synthetic fixtures, never delete repository source/output, and prove incomplete exports, missing assets and source maps fail.

## Browser prerequisites and local execution

The browser harness requires **Playwright 1.62.1** and Chromium; it is not a declared application dependency. The audit environment already provides Playwright and `/usr/bin/chromium`. An isolated, version-pinned tool installation keeps browser tooling outside the application's dependency graph and lockfile:

```sh
task_browser_tools="$(mktemp -d /tmp/wonderlab-browser-tools.XXXXXX)"
npm install --prefix "$task_browser_tools" --no-save --ignore-scripts --no-audit --no-fund playwright@1.62.1
export NODE_PATH="$task_browser_tools/node_modules"
export PLAYWRIGHT_BROWSERS_PATH="$task_browser_tools/browsers"
node "$task_browser_tools/node_modules/playwright/cli.js" install chromium
export WONDERLAB_BROWSER_PATH="$(node -p 'require("playwright").chromium.executablePath()')"
```

Playwright downloads a compatible Chromium; normal OS browser libraries are also required. Follow Playwright's supported local OS dependency installation if needed, with normal local permission controls. Do not disable TLS/checksum verification to make installation succeed. Browser/package downloads may be unavailable in restricted environments: report that prerequisite as blocked. Phase 4 verified the isolated npm installation and harness with the existing system Chromium; it did not claim a fresh browser download/OS installation was executed.

After `npm run build`, serve only the export in one terminal:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory out
```

In a second terminal with the tool variables above:

```sh
WONDERLAB_TEST_ORIGIN=http://127.0.0.1:4173 npm run test:browser
WONDERLAB_TEST_ORIGIN=http://127.0.0.1:4173 npm run test:universe
WONDERLAB_TEST_ORIGIN=http://127.0.0.1:4173 node scripts/remediation-browser.mjs
```

By default the harness uses loopback port 4173 and `/usr/bin/chromium` when present, otherwise Playwright's installed browser. `WONDERLAB_BROWSER_PATH` overrides the executable. `WONDERLAB_TEST_ORIGIN` can select another **loopback-only** origin; production targets are rejected. Only trusted synthetic local pages are tested; the headless harness uses no-sandbox Chromium launch arguments for this isolated environment, not production browser advice.

The legacy/security harness checks the original eight games, normal and malformed routes, unsafe text inertness, timed reset cancellation, score persistence, two-tab reset/update, blocked/quota storage, keyboard/mobile and captured page requests. It records and blocks unexpected external page requests. Browser-internal/OS/background traffic is **not measured**. Local GETs still disclose technical metadata to their local server and are not automatically anonymous. Python's static 404 and response headers are test-server behaviour; the live provider's rewrites/headers require separate verification.

The expansion harness separately completes all three stages of each of the 42 new games at desktop and 375px widths, validates saved results, replay/reset and library controls. The focused remediation harness exercises failed module downloads followed by reset/retry without reloading the document, repeated failures, invalid Mars cargo and Stack discarded-work rejection, followed by genuine valid completions. Run it from the repository root against that exact root’s freshly built `out/`: it locates the matching space-board chunk in the local export. Its default origin is port 4187 and the expansion harness defaults to 4175, so the explicit shared origin above avoids mismatched server ports. All harnesses are local-only.

## CI contract

The sole workflow is `.github/workflows/ci.yml`. It validates pushes to `main`/`work`, PRs targeting `main`, merge groups and manual dispatch. There are no path filters, conditional quality steps, `continue-on-error`, deployment jobs, uploaded artifacts or automatic publishing steps.

- Workflow permissions default to none; the validation job gets only `contents: read`.
- Checkout credential persistence is disabled. No explicit secret is passed to PR shell commands; no `pull_request_target` is used.
- Checkout/setup-node are pinned to full commit SHAs resolved from their official v4 refs and inspected action manifests. This reduces mutable-tag risk; it is not an independent audit of every action source file.
- Node 24, npm lockfile installation, lint/types/tests, gate-fixture tests, build/export and advisory audit run with a 15-minute timeout.
- Concurrency is scoped to workflow/ref, with cancellation only for superseded PR runs. Push/merge-group runs are not cancelled by that setting.
- Build-tool telemetry is disabled in this job. This says nothing about production/provider tracking.

Browser checks stay an explicit **manual local release gate** because the repository has no locked browser-tool dependency/CI browser installation. A green CI result does not imply browser checks ran. Workflow syntax was validated locally with checksum-verified actionlint 1.7.7 and a YAML structure check; remote execution still needs an approved push. To reproduce actionlint, use its official v1.7.7 release and verify the published archive checksum before running it; do not copy an unverified binary.

Branch protection/rulesets were not accessible to the audit. The owner must separately require the actual `validate` check for the intended branch/merge-queue policy and latest commit, review bypass/admin permissions and prevent direct production writes where appropriate. A workflow file alone does not enforce branch protection. Audit service availability and failed/cancelled checks require explicit triage; never silently waive them.

See [the release checklist](./DEPLOYMENT.md#controlled-release-checklist) and [the latest release report](./PHASE_2B_RELEASE_REPORT.md). Local quality gates do not establish production privacy, legal compliance or owner approval.

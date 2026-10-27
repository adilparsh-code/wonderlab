# WonderLab Phase 3 — local red-team security and privacy assessment

**Date:** 27 October 2026, Asia/Calcutta. **Final production release gate: BLOCKED.**

## 1. Executive summary

The authorized, bounded assessment found and locally fixed **three application findings: 0 critical, 0 high, 1 medium, 2 low**. Independent review additionally identified two low-severity verification defects in the new browser harness; both were corrected before handoff (five confirmed findings overall: 0 critical, 0 high, 1 medium, 4 low). The medium finding is local privacy persistence after reset; the low findings are storage-validation/robustness and educational game integrity, not server compromise. No demonstrated XSS, open redirect, secret exposure, remote score API or server authorization bypass was found in the inspected static application. Negative results are limited to reviewed code and executed local tests, not a guarantee that every attack is absent.

The preserved Phase 2 baseline passed 61 tests. Final local verification passes 91 tests, including 30 new security cases, and lint/typecheck/build/dependency audit. Static export inspection found 19 HTML files, 384 valid local asset/link references, no exported source maps or known secret-pattern matches. Browser and production evidence is detailed below. Passing local checks does not close production, hosting, contact or legal gates.

All changes remain local and uncommitted. No push, PR, merge, deployment, promotion, DNS/alias/protection/environment update or paid service use occurred.

## 2. Scope, authorization and preservation

The uploaded Phase 3 request authorizes the checked-out WonderLab repository, localhost development/static export, local synthetic tests and authorized read-only provider/GitHub metadata. The production URL is not permission for intrusive testing. No staging ownership/access was established; no staging or production attack tests ran.

Used only harmless synthetic educational data, inert strings and a local sentinel. Local browser code rejects non-loopback targets and records/aborts unexpected external requests. No child/student data, production forms, access-bypass tokens, credential guesses, high-volume scanning or access-control bypass was used. Existing HTTPS/proxy verification was not disabled.

Before edits, all five pending privacy files were archived at `/tmp/wonderlab-phase3-existing-work.tar.gz`, with hashes in `/tmp/wonderlab-phase3-existing-hashes.json`. Existing policy, page, tests and reports were reviewed, not discarded. Phase 3 makes scoped incremental updates to the policy/page and Phase 2B report; Phase 2 audit and privacy tests are preserved. No Git reset, clean, amend, branch switch, cherry-pick or worktree creation occurred.

## 3. Repository branch, commits and actual baseline

- Root: `/workspace/wonderlab`; branch: `work`.
- HEAD / remote `work`: `70e441437c2864c8f5296789e120eec60230e132` — `fix: repair game player test type errors`.
- HEAD parent: `466513b1b7c16b34149c1aeb8eb816ecd80d2a5a`.
- Remote `main`: `8eed0edf3c0720b6ba4bd5bfe9b98a518846999a` (merge of the prior test fix).
- Read-only remote evidence: `git ls-remote --heads origin main work`, exit 0. Both configured origin URLs identify `https://github.com/adilparsh-code/wonderlab.git`.
- At start, `docs/PRIVACY.md` and `src/app/privacy/page.tsx` were modified; `docs/PHASE_2_AUDIT_REPORT.md`, `docs/PHASE_2B_RELEASE_REPORT.md`, and `src/components/privacy.test.tsx` were untracked. Privacy improvements were not in the checked remote commit trees. Their deployment status cannot be inferred without provider evidence.
- Reviewed recent Git history, AGENTS instructions and installed Next testing guidance before source changes.

Stack: Node 24/npm, Next 16.4.2, React/React DOM 19.3.0, TypeScript, Vitest 5.0.5/jsdom/Testing Library. `next.config.ts` exports static files with trailing slashes and unoptimized images. No app backend, API route, server action, database or account requirement was found. No standalone npm integration/E2E script existed; component integration tests run in Vitest, and Phase 3 supplies separate local browser/artifact scripts without adding dependencies.

## 4. Threat model

| Adversary | Assets and trust boundary | Capabilities / realistic impact | Controls and executed tests | Remaining uncertainty |
| --- | --- | --- | --- | --- |
| Anonymous visitor | User input and browser state enter React/game/storage boundaries | Can type arbitrary text and edit own local scores; could confuse local state, not modify a server account | Controlled inputs, React text rendering, preventDefault, strict storage validation, inert-payload/browser tests | Local scores remain user-editable; no tamper-proof claim |
| Shared-device user | Browser-profile progress and in-memory state | Can read same-profile scores; old open session could restore cleared data | Single-key reset, same/cross-tab notifications, fresh read on completion; real two-tab reset regression | Shared profile/extensions remain outside confidentiality boundary; near-simultaneous storage writes are not transactional |
| Malicious URL sender | URL path/query/fragment into navigation/rendering | Can send encoded strings or unknown routes; risk would require an actual URL-to-HTML/redirect sink | No query-driven rendering/redirect handler found; unknown/single/double-encoded paths, query/fragment and static links tested | Real host rewrite/fallback rules unknown |
| Source/build observer | Public repository and shipped export | Can inspect bundled code; secrets/maps/private files could leak if included | Manifest/config/workflow inspection; exported file/link/map/known-secret scan | Pattern scan is not universal secret detection; provider build logs/settings unavailable |
| Script/dependency attacker | Dependency install/build and executable client code | A compromised dependency could execute code; no invented current third-party service | Frozen lockfile, advisory audit, registry/integrity review, no dynamic eval/HTML sink, no external runtime request observed in bounded local tests | No independent package provenance/source audit; provider-injected scripts unverified |

Public learning content has no privileged operation requiring authentication. Client-only cheating and developer-tools access are not server authorization vulnerabilities. No backend or auth system was added.

## 5. Attack-surface inventory

Routes: `/`, `/arcade/`, eight `/arcade/<catalog-id>/` game pages, `/how-it-works/` (science; no `/science/` route), `/coding-lab/`, `/challenges/`, `/about/`, `/privacy/`, `/accessibility/`, icon and generated not-found files.

Inputs: catalog search/selects; multiplication/binary/pattern answers; Typing Sprint textarea; game buttons, keyboard maze movement and timing; science sliders/options; fixed-choice coding prompts. No personal-detail form, comments, upload, chat, account or general-purpose code executor. Dynamic link segments come from the static catalog, not a user-entered URL.

Persistence: one app key, `wonderlab.progress.v1`, stores format version, numeric best scores by known game ID, and completed IDs. No app sessionStorage, IndexedDB, cookie writes, service worker, remote sync or URL-state parser was found. Temporary educational inputs remain in React memory. `storage` events and a local DOM notification contain no transmitted content or new persistent identifier.

Searched and traced `dangerouslySetInnerHTML`, DOM HTML setters/script creation, eval/Function, markdown/preview rendering, transports, navigator/storage/cookies, dynamic href/src, query/fragment handling, environment reads and logging. No untrusted executable rendering path was established. Raw string presence alone was not labelled XSS.

## 6. Confirmed findings and evidence

### WL-01 — stale session restores cleared local progress

**Severity:** MEDIUM. **Confidence:** high. **Status:** fixed locally; production unverified.

- Affected: `src/components/game-player.tsx`, `src/lib/progress.ts`, `src/components/progress-summary.tsx`.
- Preconditions: same browser origin/profile has saved progress and an open game that loaded it; visitor clears saved progress in another view/tab.
- Reproduction (localhost only): seed Binary Challenge score 80; open/start Number Quest; in another tab use Privacy reset; verify storage key absent; complete Number Quest with 56. Before fix, the old Binary score 80 reappeared alongside Number Quest 100.
- Evidence: `/tmp/wonderlab-phase3-baseline-browser.log` shows `afterReset: null` then old/new scores and `staleScoresResurrected: true`, command exit 1. New Vitest cases also reproduced stale display, delayed-event overwrite and missing summary synchronization.
- Impact: contradicts the visitor's expectation of clearing local educational progress and can preserve scores visible to another shared-profile user. No remote disclosure or privileged account access demonstrated.
- Root cause: completion merged the component's mount-time progress snapshot; views did not subscribe to app/storage changes.
- Minimal fix: read latest validated storage at completion; use empty progress when unreadable; notify same-tab observers on successful writes/removal and subscribe/clean up browser storage listeners in game and summary components. Continue using only the existing key; never clear unrelated storage.
- Regression: `does not resurrect previously cleared scores when an already-open game finishes`, `uses another session's latest scores even before its storage event arrives`, mounted-summary/storage-clear and same-tab personal-best tests; browser two-tab reset and update scenarios.
- Retest: relevant unit tests pass; final browser result below. New completions may intentionally create new progress. Browser storage has no cross-tab transaction; truly simultaneous operations remain last-writer-wins. The policy keeps a close-other-tabs caveat and does not promise global erasure or permanent opt-out.

### WL-02 — permissive storage schema accepts out-of-model records

**Severity:** LOW. **Confidence:** high. **Status:** fixed locally; production unverified.

- Affected: `src/lib/game-logic.ts`, `src/lib/progress.ts`.
- Preconditions: a visitor, extension or same-origin script can modify local storage. This is not a new remote attacker capability.
- Reproduction: parse version-1 JSON with unknown/HTML-shaped/computed-property IDs, duplicate completed IDs, a Number Quest score over 100 or a Reaction score over 1000, or a record carrying over 20,000 synthetic characters. Earlier parser accepted such records or silently ignored a special property instead of rejecting them.
- Evidence: nine malformed/out-of-model table cases and the completion-write assertion failed on the original source. No unsafe markup execution or prototype pollution was demonstrated; those hypotheses must not be inferred from acceptance alone.
- Impact: incorrect counts/scores, inconsistent recovery, unnecessary parsing of large untrusted records; constrained to local client state. No practical remote denial of service was attempted or claimed.
- Root cause: IDs were arbitrary strings, scores only non-negative/finite, completions could duplicate, and input size had no bound.
- Minimal fix: reject records over 16,384 JavaScript string code units before parsing; cap record entry counts to catalog size; accept only current catalog IDs, unique completions and finite scores from 0 through 100 (Reaction ceiling 1000). The scoring functions and gameplay rules are unchanged by these conservative ceilings. Completion writer applies the same score/ID bounds; storage writer validates and serializes only the schema, dropping unused fields.
- Recovery: invalid records are reported without deletion; play stays usable; an explicit reset removes the one key, and successful later completion can create a fresh valid record. Valid version-1 progress is retained.
- Regression: 21 input-table cases plus boundary and invalid-write cases; browser malformed/oversized/unknown-ID recovery, blocked storage and quota checks.
- Retest: all unit cases pass and local valid game flows persist bounded numeric scores. Scores are not tamper-proof even after validation.

### WL-03 — wrong Memory Matrix prefix counts toward advancement

**Severity:** LOW (educational integrity/correctness). **Confidence:** high. **Status:** fixed locally; production unverified.

- Affected: `src/components/game-player.tsx`, `chooseMemoryTile`.
- Preconditions: a local Memory Matrix round is in recall mode. No access to another person or privileged backend is involved.
- Reproduction: after level-one preview (Tile 3 then Tile 1), choose Tile 1 twice. Earlier state appended the wrong first tile; the second selection matched the sequence's last position and incorrectly advanced to level two.
- Evidence: `requires a complete correct sequence after a wrong first tile` failed with status `Level 2: watch...`; `/tmp/wonderlab-phase3-memory-red.log`, exit 1, 1 failed/29 passed.
- Impact: level/score validity can be bypassed in a practice game. This is not a server security boundary, verified achievement or serious privilege escalation.
- Root cause: the incorrect tile was committed to recall state before validation.
- Minimal fix: only append a validated tile; reset recall inputs on a wrong guess with clear retry feedback. Do not expose the answer sequence. Preview timing, correct sequence, replay and reset remain intact.
- Regression: wrong-prefix unit and browser test; existing all-level preview/hidden recall/completion/replay tests.
- Retest: 30/30 focused security tests, full 91-test suite and final browser result below.

## 7. Hypotheses and unverified concerns

- **XSS:** local img/SVG/script/quote-breaking strings and `javascript:alert(1)` remained input text or were rejected; inert sentinel, dialog and page-error assertions observed no execution in tested paths. No unsafe sink found. Not a confirmed XSS finding.
- **Prototype pollution:** special JSON keys now rejected; previous numeric `__proto__` handling did not demonstrate prototype mutation/execution. Not a confirmed pollution exploit.
- **Open redirect / dangerous schemes:** source links use static internal catalog paths; route/query/fragment inputs did not create navigation targets in local tests. No arbitrary URL input/sink exists to warrant a speculative URL sanitizer or new auth gate.
- **Header weakness:** absence of tracked host header configuration is an unverified defence-in-depth gap, not evidence of missing production headers.
- **Hosted tracking/logging:** app transport negatives do not establish provider behaviour. Production remains unverified.
- **Concurrent writes:** fresh reads prevent stale mount-snapshot reuse, but localStorage does not offer a read/merge/write transaction. Near-simultaneous tab completions/reset may race. Do not promise an atomic multi-tab database or confidentiality on shared devices.

## 8. Fixes and file inventory

New Phase 3 source changes: `src/lib/game-logic.ts` (strict schema/bounds), `src/lib/progress.ts` (validated persistence and local notifications), `src/components/game-player.tsx` (fresh state at completion/subscription, correct memory transition), `src/components/progress-summary.tsx` (synchronized summaries).

New tests/tools: `src/components/security.test.tsx`, `scripts/security-browser.mjs`, `scripts/security-artifacts.mjs`. Browser tool uses environment-provided Playwright/Chromium; no dependency, lockfile or npm script change. It is loopback-only, not a production test command. Offline artefact tool uses Node built-ins.

Scoped updates to existing privacy work: reset semantics in `docs/PRIVACY.md` and `src/app/privacy/page.tsx`; Phase 3 addendum in `docs/PHASE_2B_RELEASE_REPORT.md`. New `docs/RED_TEAM_SECURITY_REPORT.md` is this report. Existing `src/components/privacy.test.tsx` and `docs/PHASE_2_AUDIT_REPORT.md` remain intact; older findings are dated baseline evidence, superseded by Phase 3 retests where applicable.

No unrelated educational redesign, new backend, student account, tracking, remote sync, paid resource, major dependency upgrade, production header/configuration change or publication.

## 9. Before/after regression evidence

| Stage / exact command | Actual result | Exit |
| --- | --- | --- |
| Baseline `npm test` | 61 passed / 7 files | 0 |
| New `npm test -- src/components/security.test.tsx` before storage/session fixes | 14 failed, 15 passed / 29 tests; expected red | 1 |
| `node /tmp/wonderlab-phase3-baseline-browser.cjs` | Confirmed old score restored after two-tab reset | 1 |
| Focused tests after storage/session fix | 29 passed | 0 |
| New memory regression before memory fix | 1 failed, 29 passed / 30 tests; incorrect level advance | 1 |
| Focused tests after memory fix | 30 passed | 0 |
| Full post-fix tests | 91 passed / 8 files, no failures or skips | 0 |

One intermediate lint run failed because newly added `.cjs` helpers used imports forbidden by the repository's TypeScript ESLint rule (5 errors). Converted helpers to `.mjs` ES modules and reran lint successfully. No rule was disabled or configuration weakened. This was a tooling compatibility issue, not an application security vulnerability.

## 10. Full verification and reproducible local commands

Working directory `/workspace/wonderlab`. Existing local static server serves `out/` on loopback port 4173. To reproduce in a new local session: run `npm ci` if dependencies are absent; run the listed build; serve with `python -m http.server 4173 --bind 127.0.0.1 --directory out`; execute the scripts below. Playwright is supplied by this environment; another machine must provide a compatible authorized installation and Chromium. Browser path/origin overrides are `WONDERLAB_BROWSER_PATH` and loopback-only `WONDERLAB_TEST_ORIGIN`. These are test-tool inputs, not production requirements.

| Command | Baseline | Final | Exit |
| --- | --- | --- | --- |
| `npm run lint` | Passed | Passed | 0 |
| `npm run typecheck` | Passed | Passed | 0 |
| `npm test` | 61 tests / 7 files | 91 tests / 8 files | 0 |
| `npm run build` | 19 generated static pages | 19 generated static pages | 0 |
| `npm audit --json --cache /workspace/.npm` | 0 reported vulnerabilities | 0 reported vulnerabilities | 0 |
| `node scripts/security-artifacts.mjs` | Not present at baseline | 19 HTML files; 384 asset/link references resolve; 0 exported maps, known secret-pattern matches or external HTML resource references | 0 |
| `node scripts/security-browser.mjs` | Not present at baseline | 28 checks passed after independent review; page-request inventory and limits are recorded in closing evidence; no request bodies/cookies/dialogs/page errors | 0 |
| `git diff --check` | Passed | No whitespace errors | 0 |

No separate configured npm integration/E2E target was skipped under a false success label: Testing Library component integration tests ran in the full suite; the explicit browser workflow is separate. Static generated files include not-found variants, so 19 HTML files do not mean 19 unique learning routes.

Retained evidence: `/tmp/wonderlab-phase3-baseline-*.log`, `*-red.log`, `*-green.log`, `*-final-*.log`, remote evidence JSON and the preserved-work archive. Temporary logs are current-instance evidence, not a guaranteed durable external CI record. The committed-source regression tools and this uncommitted report are reviewable without public publication.

## 11. Production deployment evidence

Historical owner-provided context: project `wonderlab`, READY, branch main, SHA `8eed0edf3c0720b6ba4bd5bfe9b98a518846999a`, deployment URL `https://wonderlab-5737pqk5t-my-self18.vercel.app`, inspector `https://vercel.com/my-self18/wonderlab/y8TKxS8M1hphrjkiykcXw4grguph`. These are not independently current metadata.

Phase 3 read-only attempts at approximately **11:54 IST, 27 October 2026**:

- Production `/` and `/privacy/`, Vercel inspector and runtime-log documentation: HTTPS proxy tunnel `403 Forbidden` before origin content was retrieved.
- `gh api 'repos/adilparsh-code/wonderlab/deployments?per_page=5'` and `gh api repos/adilparsh-code/wonderlab/commits/main/status`: `Forbidden`, no deployment records/status payload available.
- Native Git remote SHA lookup succeeded, but a remote branch SHA does not prove the deployed SHA.

Current production deployment ID/state/time, target (production versus preview), assigned aliases, branch/deployed SHA, protection metadata, build logs, actual HTML/scripts/cookies/headers/retention remain **UNVERIFIED**. A deployment-shaped hostname is not proof of a production alias. The local privacy/security changes are not in the remote branch commits checked; no provider evidence establishes whether an out-of-band deployment contains them.

## 12. Nature of the 403 limitation

`URLError: Tunnel connection failed: 403 Forbidden` is an environment proxy CONNECT denial, not an observed HTTP response from the app. It does not establish that Vercel returned 403, that the site is down, that Vercel SSO/protection is enabled, or that credentials are invalid. GitHub API denials likewise do not establish the absence of deployments. Stops respected these boundaries; no alternative proxy, bypass token, credentials or protection changes were tried.

Owner-safe verification: from an authorized read-only context, open the known project/inspector; confirm target, READY state, creation time, aliases and Git SHA; inspect build logs without sharing secrets; obtain normal browser response headers/network/cookie evidence for public routes; record origin/protection responses separately. If access requires login, use the owner's normal authorized session. Do not disable protection or promote a deployment to make an audit pass.

## 13. Privacy assessment

Source still has no accounts, intentional identifying-details collection, analytics/ad SDK, AI API, remote educational upload or database. Browser-local progress stays on one existing key. Notifications are local browser events, not network telemetry. Game/search/typing/science/coding inputs remain local state; no raw text is persisted by tested completions. Reset removes one key and preserves unrelated data. Invalid/blocked/quota cases remain playable.

Local browser request inventory distinguishes same-origin delivery/navigation/synthetic URL probes from external, explicitly recognized same-origin development-tool paths, and unattributed page requests. Browser-internal/background traffic is outside this instrumentation and is **not measured**; no zero-traffic claim is made for that category. Same-origin GETs still disclose technical metadata to a server; they are not automatically anonymous. The local static server is not the production host. Build tools may have their own telemetry (Next's informational build notice has been observed); that is separate from a student browser session and is not covered by an app-only no-tracking statement.

Shared-profile users and extensions can inspect/edit scores; local encryption or user authentication was not added. Reset cannot remove remote logs or another device's data. No privacy officer, legal operator or monitored private contact was invented. Production logs, analytics, scripts, cookies, locations, retention and deletion remain unknown.

Official DPDP Act/Rules/Gazette requests were retried read-only in Phase 3 and each failed at the same HTTPS proxy boundary. Exact sources/access timestamps are in `/tmp/wonderlab-phase3-remote-evidence.json`; source URLs and legal issues remain in the Phase 2B report. No publication/notification/effective dates or exemptions could be newly verified; no legal compliance or zero-collection claim is made. The owner's ages 11–18 inclusive/all-visitors commitment remains a voluntary product policy, not a universal statutory ban.

## 14. Dependencies and software supply chain

Final npm advisory audit reported 0 critical/high/moderate/low/info vulnerabilities, exit 0, with 259 reported total dependencies. Lockfile v3 has 260 package entries including the root; resolved packages have integrity fields; resolved destinations inspected are npm registry sources. Only optional `fsevents` 2.3.3 is marked `hasInstallScript` in this lockfile. Registry advisory absence does not prove code provenance, no malicious package or no future vulnerability. Dependencies/lockfile were not changed.

CI `.github/workflows/ci.yml`: push to main / PR into main; permissions `contents: read`; checkout and setup-node actions at version tags; Node 24, `npm ci`, lint, typecheck, tests, build. No `pull_request_target`, deployment action, interpolated untrusted shell input, artifact-upload step or explicit secret export found. Running package scripts on PR code is ordinary CI execution with read-only repo token permissions; runner/network exposure still merits owner review. Action version tags are not immutable SHA pins (informational hardening opportunity); no unverified new action SHA or CI edit was introduced.

Static export scans inspect public HTML/JS/CSS/JSON/text for known private-key/token/credential-URL patterns without printing values, exported source maps, internal documents/config and unresolved assets/links. No hits in executed checks. This is bounded pattern/structure inspection, not universal leak detection or an independent dependency source audit.

## 15. Security headers and hosting configuration

No `vercel.json` or linked `.vercel/project.json` was present; Next configuration is static export. No app header policy was added. A Next server `headers()` declaration would not establish pure-static host enforcement, and CSP cannot safely be guessed around Next inline bootstrap scripts/styles.

| Control | Source/configuration observation | Live verification |
| --- | --- | --- |
| HTTPS/TLS and redirects | Owner supplies HTTPS URL; no claim based on scheme alone | Blocked |
| CSP / frame restrictions | No explicit tracked host policy | Unknown |
| HSTS, nosniff, referrer and permissions policies | No explicit tracked host policy | Unknown |
| Cache-control, MIME, static delivery/fallback | Local export and local server checks only | Production unknown |
| Cookies / injected scripts / monitoring | No app integration; local results bounded | Production unknown |

The Python static test server's headers and 404 pages are test-fixture behaviour, not Vercel production evidence. Local unknown/encoded paths return 404 without script execution; actual hosting rewrites/error rendering require separate confirmation. No production CSP, alias or protection setting was changed.

## 16. Remaining risks and remediation order

1. Unblock **authorized read-only** provider/production and official-source access, or provide verified owner exports. Confirm the actual production target and deployed SHA before making any release assertion.
2. Verify technical-data categories, logs/retention/deletion, regions/access, analytics/drains/integrations, cookies/scripts and provider responsibilities. Collect real TLS/headers/static-routing evidence. Do not change settings without separate approval.
3. Obtain verified operator identity and monitored private contact/response ownership, and complete current official-source/qualified legal review.
4. Owner reviews the local findings/fixes/tests/policy and residual simultaneous-write/shared-device limits. Source changes are technically reviewable; do not treat that as production approval.
5. If later authorized, create a reviewed non-production-branch commit/PR after a fresh diff/remote check; no amend/force-push. Warn that push/PR/merge may trigger provider automation. Explicit owner approval is required before any publication or production release.

## 17. Checks not performed / limits

No intrusive production tests, access-control bypass, denial-of-service/high-volume scan, credential guessing, real-child data, paid service, staging test, hosted browser capture, provider configuration change, TLS/security-header validation against production, private log/retention inspection, independent package-source/provenance audit, exhaustive multi-browser/assistive-technology evaluation or verified current legal commencement review. No configured npm integration/E2E command existed; actual component/browser checks are listed above. No claim is made about unseen routes/dependencies/future releases. Atomic simultaneous cross-tab persistence is not implemented or proven.

## 18. Final assessment and closing evidence

**Local assessment:** three confirmed findings fixed and regression-tested; no unresolved demonstrated critical/high local security vulnerability found within scope. **Production release: BLOCKED** because production evidence and material operational/legal verification remain unavailable. This is not a claim that the app is legally compliant, collects zero data or is secure against every threat.

The reviewed local browser harness passes 28 checks, including a controlled sentinel self-test and per-surface checks before navigation. Every browser context, including storage-failure contexts, records page requests and blocks unexpected external egress. Browser-internal/background traffic is explicitly outside the capture scope. Offline export checks and `git diff --check` passed. The independent reviewer found no additional concrete application defect, independently reran all 30 focused security tests successfully and confirmed the prior privacy-test/audit hashes matched the preservation manifest. Final request counts are recorded in the evidence appendix. No user approval is inferred from this report or passing checks.

### Independent-review verification fixes

- **VT-01, LOW, high confidence — sentinel checked too late.** The first browser harness reset the sentinel on navigation but checked it only after moving through several payload surfaces, which could mask earlier execution. Corrected by checking immediately after each input interaction and after every route navigation before leaving that page. A controlled local sentinel increment is deliberately caught with `assert.rejects`, then cleared; this proves the guard detects execution without executing a harmful payload or falsely reporting it as an application XSS. Browser payload tests were rerun after the correction. No production source change was needed for this test defect.
- **VT-02, LOW, high confidence — unmeasured traffic category reported as zero.** The first harness initialized a browser/development array without populating it. Corrected by classifying recognized same-origin development-tool paths explicitly and stating browser-internal/background traffic is not measured. Removed the unsupported zero-browser-traffic claim. Real page-request capture runs in every test context; external page requests are recorded and aborted. No inference about system-wide network traffic is made.

The earlier 26-/27-check browser runs remain intermediate local evidence; the reviewed 28-check run supersedes their sentinel/capture claims. No critical/important source-review defect remained. A stronger test harness does not prove production tracking absence.

### Final evidence appendix

Reviewed browser rerun: `node scripts/security-browser.mjs`, exit **0**, **28 passed checks**; captured page requests: **610 same-origin**, **0 external**, **0 recognized development-tool**, **0 unattributed**. Non-GET/body-bearing requests: **0**; observed cookies **0**, dialogs **0**, page errors **0**. Browser-internal/background traffic remains **NOT MEASURED**. The controlled sentinel self-test is a harness test, not a discovered application XSS. Evidence is `/tmp/wonderlab-phase3-final-reviewed-browser.log`.

Latest lint and whitespace checks exit 0 after the review fixes. Full application verification remains 91/91 tests, typecheck, lint, build (19 pages) and dependency audit (0 reported vulnerabilities), all exit 0. Original Phase 2 audit/privacy test hashes still match the preservation manifest. Dependency/lockfile/CI/Next configuration remain unchanged. HEAD and all publishing restrictions remain unchanged.

## Phase 4 — independent review and release-engineering update (27 October 2026)

### State and preservation

Branch `work`, HEAD `70e441437c2864c8f5296789e120eec60230e132`; read-only remote SHA lookup still finds work at that SHA and main at `8eed0edf3c0720b6ba4bd5bfe9b98a518846999a`. No new commit exists. All 13 original pending files were individually inventoried and archived before edits at `/tmp/wonderlab-phase4-preserved-work.tar.gz`, with hashes and original tracked diff in `/tmp/wonderlab-phase4-initial-manifest.json` and `*-initial-tracked.diff`. The original security/privacy work was not reset, stashed or discarded.

Upstream configuration discrepancy: `branch.work.remote=origin`, `branch.work.merge=refs/heads/work`, but the configured fetch refspec maps only main. `git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'` fails even though an `origin/work` tracking ref exists. Direct `git ls-remote` establishes the remote SHA; no local Git configuration was silently changed. Before later publishing, the owner should review the intended tracking/refspec configuration. This is not a source/security failure.

### The 13-file starting set reviewed

| Existing file | Classification | Phase 4 treatment |
| --- | --- | --- |
| `src/app/privacy/page.tsx` | Application code | Preserved unchanged |
| `src/components/game-player.tsx` | Application code | Independently reviewed; preserved unchanged |
| `src/components/progress-summary.tsx` | Application code | Independently reviewed; preserved unchanged |
| `src/lib/game-logic.ts` | Application code | Independently reviewed; preserved unchanged |
| `src/lib/progress.ts` | Application code | Independently reviewed; preserved unchanged |
| `src/components/privacy.test.tsx` | Tests | Preserved all 8 tests unchanged |
| `src/components/security.test.tsx` | Tests | Preserved original 30 tests; added 5 justified edge-case tests |
| `docs/PRIVACY.md` | Privacy documentation | Preserved unchanged |
| `docs/PHASE_2_AUDIT_REPORT.md` | Audit documentation | Preserved historical evidence unchanged |
| `docs/PHASE_2B_RELEASE_REPORT.md` | Release documentation | Appended Phase 4 state/evidence/gates |
| `docs/RED_TEAM_SECURITY_REPORT.md` | Security documentation | Appended this independent-review section |
| `scripts/security-artifacts.mjs` | Other: local verification tool | Added independent expected-route checks |
| `scripts/security-browser.mjs` | Other: local verification tool | Stronger URL assertions and delayed reset checks; portable executable fallback |

There were no build/CI changes in the original 13 files. `docs/PRIVACY_AUDIT.md` remains absent due the earlier intentional rename; no duplicate privacy audit was created.

### Independent assessment of security-sensitive fixes

A separate read-only reviewer inspected application modules, original game/logic/privacy/security test assertions, both scripts, policy and audit documents. They independently executed `npm run test:security`: initially 38/38 (30 security +8 privacy), then 43/43 after the five additional tests. They also reran the 13 Node gate-fixture tests successfully. No additional confirmed application functional/security defect or unsafe workflow execution path was identified.

| Fix / original transition | Why current implementation prevents that failure | Assertions inspected / edge cases |
| --- | --- | --- |
| Clear scores in another view, then an old game saves its mount snapshot | Completion rereads validated storage; game/summary subscribe to same-tab and storage notifications and unsubscribe on teardown | Real two-tab evidence plus exact payload assertions; delayed notification, unrelated keys and cleanup checked. Near-simultaneous writes remain nontransactional; no global-erasure claim |
| Arbitrary/duplicate/oversized IDs or scores restored from storage | Pre-parse size bound, catalog whitelist, unique completion set, finite model-bounded scores; validated schema-only writes | Parser table, model boundaries and malformed/denied/quota recovery; added writer test for NaN/Infinity/negative/excessive scores and stripped unused fields, preserving prior valid record |
| Wrong Memory tile counted toward recall prefix | Incorrect tile clears prefix before return; only correct tile advances state | Original Tile 1/Tile 1 failure and full correct retry inspected; normal multi-level preview/hidden recall/replay preserved; added delayed reset cancellation tests |
| Privacy reset fails or deletes unrelated data | Single-key removal with explicit success/failure result; no `clear()` in app | Actual Privacy control, malformed storage and denied-removal tests inspect stored state rather than only rendering |

No URL-entry feature or unsafe HTML sink exists in application source, so no speculative application URL sanitizer/authentication layer was introduced. Safe-payload/browser checks remain scoped; local scores remain editable and are not verified achievements. Existing keyboard/mobile and normal gameplay coverage is retained. No application code change was necessary during Phase 4.

### New findings and fixes — verification tooling, not application exploits

- **P4-G01, LOW, confirmed gate defect:** the DOM reference check used `startsWith('/')`, which accepts protocol-relative and backslash-normalized external links. No actual such app link/exploit was found, and request interception/export origin checks already supplied other protection. A pure helper now resolves references as URLs and checks HTTP(S), exact origin and absence of credentials. Two negative cases failed before the change and pass afterward.
- **P4-G02, LOW, confirmed release-check defect:** the export checker accepted a self-consistent root-only export with no broken references. A synthetic incomplete export reproduced exit 0 before the fix. It now independently derives all page routes from source/catalog, rejects unsupported new dynamic route patterns and requires a 404 artifact; the missing-route fixture now fails as intended. Current export has 16 expected page routes, 19 HTML files including error variants, and 384 references.
- **P4-CI01, INFORMATIONAL, hardening:** movable action tags, default persisted checkout credentials, absent explicit timeout/concurrency, and no export gate were repository risks/recommendations, not demonstrated credential compromise. The sole workflow was hardened without a deployment job.
- **Coverage additions, no new demonstrated app bug:** writer field stripping/failed-write preservation, subscription cleanup/unrelated-event filtering, repeated completion clicks, and delayed Memory/Reaction callbacks after reset. Old source already passed these properties; tests improve evidence without inventing a new vulnerability.

The new Node gate suite first reported **3 failed /10 passed**, then **13/13 passed** after fixes. It additionally verifies successful complete synthetic export, missing-asset failure, source-map failure and dangerous/reference URL cases. Synthetic credential-shaped URL text in a negative fixture is intentional test data, not a real credential. There is no network dependency in these fixture tests.

### CI/CD review and changes

Only `.github/workflows/ci.yml` exists. It now uses workflow permissions `{}` and job `contents: read`, `persist-credentials: false`, a 15-minute timeout, per-workflow/ref concurrency with PR-only cancellation, frozen `npm ci`, lint/types/tests/gate fixtures/build/export validation and advisory audit. Triggers cover main/work pushes, PRs into main, merge groups and manual dispatch. No paths/conditional quality filters, `continue-on-error`, `pull_request_target`, untrusted shell interpolation, secret-forwarding, artifact transfer or deployment step was added.

Checkout `11d5960a326750d5838078e36cf38b85af677262` and setup-node `49933ea5288caeca8642d1e84afbd3f7d6820020` were resolved from the official repositories' v4 tags via `git ls-remote`; immutable action manifests were retrieved from raw.githubusercontent.com (HTTP200) and inspected. This preserves the existing majors and is not an independent audit of every bundled action source file. Action manifests use their own Node20 action runtime; application commands use Node24. Actual hosted-run compatibility/execution is not claimed before an approved push.

Local validation used actionlint **1.7.7**, installed only in `/tmp` from the official release and matched against its official SHA-256 archive checksum `023070a287cd8cccd71515fedc843f1985bf96c436b7effaecce67290e7e0757`; validation exited 0. YAML parsing with string-key preservation checked triggers/permissions/no ignored step failures, also exit0. `/usr/bin/go` was not a usable Go compiler (`Unknown option: install`); that optional installation route failed and was replaced with the verified release binary, not with disabled verification. No repository tool dependency was added.

Branch protection/ruleset access returned `Forbidden`. CI YAML does not prove required checks or prevent direct writes by itself. Owner must verify required checks for latest SHA, review/bypass/admin settings and merge-queue policy. Remote CI has not executed this local workflow. Browser tests remain an explicitly documented manual local gate, separate from CI; a green workflow does not claim browser execution.

### Reproducibility and documentation

`package.json` adds `check`, `test:security`, `test:quality`, `test:browser`, `validate:export` and `audit:dependencies` aliases without dependency/version changes. `check` chains required local checks with `&&` and preserves nonzero exits. Lockfile and Next/Vitest/ESLint configuration are unchanged. A fresh frozen install actually ran successfully (204 packages); a separate pinned Playwright1.62.1 installation in `/tmp` also succeeded without changing the app dependency graph. Browser rerun uses that isolated tool installation and existing Chromium154.0.8037.57; no claim is made that a fresh browser download/OS install was executed.

`docs/QUALITY_GATES.md` documents Node24/npm, exact commands, pinned isolated browser-tool setup, explicit loopback-only execution and capture limits, CI contract and owner branch-protection action. README links it and corrects automatic local-saving wording. Deployment/QA documents keep historical results/options but identify outdated no-remote/no-deployment assertions as historical and provide a current owner checklist, not production permission.

Warnings retained: the existing Vitest future native-config-loader warning/performance suggestion, plus Node's non-fatal `MODULE_TYPELESS_PACKAGE_JSON` notice when standalone Node24 scripts read the typed catalog. No package-wide module-type flip, lint-rule suppression or test weakening was introduced just to hide these warnings.

### Production, legal and operational gates

Read-only Phase4 attempts at approximately **12:16 IST on 27 October 2026** to owner-provided production `/` and `/privacy/`, the Vercel inspector/runtime-log docs and official IndiaCode/MeitY/Gazette sources failed at the HTTPS proxy tunnel boundary with403. GitHub main protection and deployments APIs returned `Forbidden`. Exact URLs/timestamps/errors: `/tmp/wonderlab-phase4-remote-access.json`. No origin headers/content or current provider records were obtained; owner-reported READY/main/8eed metadata stays historical. No bypass, credential guessing or production setting change occurred.

Current production target/ID/state/time/alias/SHA/build logs, HTTPS/headers, cookies/scripts/tracking, provider log/retention/deletion, operator identity/private monitored contact and current official legal dates/exemptions remain **UNVERIFIED**. No new legal date/conclusion was inferred. Qualified legal and operational review remains necessary. The [controlled release checklist](./DEPLOYMENT.md#controlled-release-checklist) gives exact owner read-only steps.

### Phase 4 final evidence

Final command results and preservation/new-file lists follow below. Historical Phase3 counts above are retained; the Phase4 baseline independently reproduced91tests,30security,28browser,19HTML/384references, and new tests explain later count changes. Final overall status remains **BLOCKED** for production while the local change set is prepared for human review. Nothing was committed, pushed, opened as a PR, merged, deployed, promoted, rolled back or published.

| Command | Phase 4 result | Exit |
| --- | --- | --- |
| `npm ci --cache /workspace/.npm` | Frozen install, 204 packages; lockfile unchanged | 0 |
| `npm run check` | Lint/types +96 Vitest tests/8 files +13 gate-fixture tests +19-page build +16 expected page routes/384 references | 0 |
| `npm run test:security` | 43 passed: 35 security +8 privacy | 0 |
| `npm run audit:dependencies` | 0 reported vulnerabilities | 0 |
| `NODE_PATH=/tmp/wonderlab-phase4-browser-tools/node_modules npm run test:browser` | 28 passed checks; stronger URL and delayed-reset assertions | 0 |
| `/tmp/wonderlab-phase4-tools/actionlint .github/workflows/ci.yml` | Workflow validation passed | 0 |
| YAML trigger/permissions/step structure check | Passed | 0 |
| `node --check` on verification scripts | Passed | 0 |
| `git diff --check` | Passed; untracked files also checked for trailing whitespace | 0 |
| Hosted CI execution | NOT RUN: no approved commit/push | N/A |
| Production/provider/official legal checks | BLOCKED by documented access barriers; no content verified | Not a pass |

Final browser inventory: **610 captured same-origin GETs**, **0 external**, **0 recognized development-tool**, **0 unattributed** page requests; no bodies, observed cookies, dialogs or page errors. Browser-internal/background traffic remains NOT MEASURED. Count remains28 scenarios, but URL resolution and post-reset timer assertions are stronger. Vitest increased91→96 solely from5 new edge-case tests; focused security30→35, privacy stays8. The separate13 Node fixture tests are not included in the96 Vitest total. Build/export counts remain19HTML/384references; independent expected-route coverage now explicitly requires16 page routes.

Current tool/runtime evidence: Node24.19.0, npm11.9.0, isolated Playwright1.62.1, system Chromium154.0.8037.57. No browser download/OS install is claimed. Baseline browser28checks/610GETs passed before harness edits. The archived original artifact checker was also rerun non-destructively against the app-identical export and passed19HTML/384references. Logs: `/tmp/wonderlab-phase4-baseline-*`, `*-gates-red.log` (3fail/10pass), `*-gates-green.log` (13pass), `*-expanded-security.log`, `*-final-check.log`, `*-final-browser.log`, `*-final-audit.log`, frozen/tool installation logs and action manifests.

### A. Existing user changes preserved

All 13 original pending files listed in the starting-set table remain present, with their full pre-Phase4 versions preserved in the archive. Eight are byte-identical to the initial hashes: the five application files, `docs/PRIVACY.md`, `docs/PHASE_2_AUDIT_REPORT.md` and `src/components/privacy.test.tsx`. The other five have only the justified incremental changes described above: both security tools, expanded security tests, and appended security/release report sections. Existing tests and historical findings were retained.

### B. New changes introduced in Phase 4

Eight additional files join the original change set: `.github/workflows/ci.yml`, `package.json`, `README.md`, `docs/DEPLOYMENT.md`, `docs/QA_REPORT.md`, `docs/QUALITY_GATES.md`, `scripts/security-helpers.mjs`, `scripts/quality-gates.test.mjs`. Of these, three are new untracked files (quality guide/helper/fixture tests); five are newly modified tracked files. Plus the five incremental edits to original pending files described in A. Total complete pending set: **21 files, 11 tracked modifications and10 untracked files**, not13. No application dependency, lockfile or runtime configuration changed.

**Independent Phase4 finding counts:** no new confirmed application vulnerability or functional defect; two low-severity verification-gate defects corrected, plus informational CI/upstream/coverage recommendations. Original Phase3 findings remain historical and fixed locally. No unresolved critical/high local source issue was identified within review scope, which is not a universal security or legal guarantee.

**Final status: BLOCKED.** The local changes are ready for human review; required production/privacy/legal/operational evidence is not available. Single safest next action: owner review of the exact21-file diff and documented unresolved gates before authorizing any commit/publishing step. No commit, push, PR, merge, deployment, promotion, rollback or publication occurred.

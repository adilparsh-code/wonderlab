# Phase 6 — focused remediation and regression evidence

27 October 2026 (Asia/Kolkata). **READY FOR REVIEW — focused fixes only.** All work remains uncommitted and unpublished. This is not production release approval or a statement that every prior audit finding is closed.

## Initial state and preservation

Repository `/workspace/wonderlab`, branch `work`, HEAD `70e441437c2864c8f5296789e120eec60230e132`. Initial `git status --short --branch` reported `## work`, 23 modified tracked files and 41 untracked files: **64 pending files**, including the Phase 5 review. Nothing was staged. This matches the review's post-report state, so no stop for a material mismatch was necessary.

Before editing, 86 tracked/untracked source/documentation/configuration files were hashed and archived to `/tmp/wonderlab-phase6-before.json` and `/tmp/wonderlab-phase6-before.tar.gz`. A fresh baseline `npm test` passed **316 tests / 15 files**, exit 0 (`/tmp/wonderlab-phase6-baseline.log`). No branch, remote, upstream, Git history or index change was made. Existing work was incrementally edited only within the focused scope listed below. No original file is missing.

Package versions, `package.json`, `package-lock.json`, configuration, all 50 registry entries/routes, game catalogue, filtering, XP/badge/daily-discovery rules, storage schema and existing privacy implementation are unchanged. The historical Phase 5 review remains untouched.

## Root causes and corrections

### Mars — GU5-01

Root cause: packing validated editable form values once, while completion later accepted only action step 4. Changing cargo after packing bypassed the required oxygen/fuel constraints.

Correction: a validated packed snapshot owns remaining oxygen and fuel. Packing locks those inputs and ignores subsequent change handlers. Driving, collecting and returning consume/check that snapshot; completion requires the returned state and the correctly consumed supplies. Existing requirements are preserved: stage r needs r+3 oxygen, r+2 fuel, with a cargo cap equal to their sum. Oxygen usage matches the previous displayed counters; drive/return each use one fuel and research uses the previously defined remainder. No cargo types or new difficulty rules were invented: the game has only oxygen and rover fuel inputs.

Regressions cover all three stages, zero/negative/missing/fractional/over-cap/incomplete cargo, attempts to mutate packed inputs, action order, displayed consumption, valid completion, repeated submission and remount/replay. Browser checks prove an empty mission grants neither next-stage access nor saved completion; valid supplies still complete all three stages and reset cleanly.

### Stack Machine — GU5-02

Root cause: a separate global operator history remained qualified after the arithmetic result was popped and replaced with a directly entered target.

Correction: each stack entry carries its own numeric value and the requested-operator provenance of its surviving expression. Operators combine operand provenance; popping removes that value's work. The final target must itself derive from the required operator. This permits legitimate alternative and nested expressions rather than hard-coding the example operands.

Regressions cover every stage's discarded-work bypass, empty/underflow operations, alternative positive/negative operands, composed expressions, invalid direct targets, repeated checks and remount/replay. Browser checks reject discarded `0 op 0` work without granting completion, then complete the original valid examples and confirm replay starts without old provenance.

### Game-module loading — GU5-03

Root cause: module-level React.lazy objects cached rejected imports. Reset remounted the error boundary but reused the rejected lazy object.

Correction: explicit family import functions remain code-split and on demand. Each mounted download attempt owns its loading/error state and ignores success or failure after cleanup. Reset/unmount invalidates that attempt. Retry game starts one new user-requested attempt; there is no automatic application retry loop. A request queued before immediate unmount does not start. The board key also includes game ID, so a changed game cannot retain the previous board instance. The render-error boundary remains separate from download handling. Successful modules use the bundler's normal cache; no dependency was added.

Six lifecycle tests cover initial failure/reset/successful real-board completion, repeated manual failure/retry, a stale rejection after newer success, stale success during a newer pending attempt, leaving during a pending attempt, and leaving before initialization starts. Unit tests mock only the download boundary and mount the real SpaceBoard. A production Chromium regression blocks the actual family chunk, restores access and proves both Reset→Start and repeated Retry can recover, play all three stages and persist a score **without a document reload**, with one game instance.

## Export validator — GU5-04

The original false negatives were reproduced with failing fixtures before correction. The checker now:

- Requires regular files for every expected page, the static 404 and referenced assets, rejecting directory-shaped stand-ins.
- Rejects symlinks anywhere in the inspected export, including symlinked roots, instead of following them outside the intended tree.
- Reads supported HTML references with a bounded parser that handles case-insensitive attributes, whitespace around assignment, quoted/unquoted values, constrained srcset candidates and relevant HTML entity decoding. It skips comments and raw script/style/textarea/title bodies to avoid false positives from embedded strings.
- Fails with useful nonzero diagnostics for malformed/unsupported inspected markup, duplicate attributes, malformed srcset, invalid encodings/control characters/traversal, missing output and missing targets.
- Rejects HTML base elements explicitly. Independent review demonstrated that an otherwise local base could change relative URL resolution and falsely pass; a new failing fixture reproduced it before the rejection was added.
- Retains route enumeration from the unchanged registry, secret-pattern/source-map/internal-file checks, and the positive healthy-export fixture. Negative fixtures assert an intended diagnostic and normal nonzero exit, with no spawn error/signal, instead of accepting any crash as proof of rejection.

**Bounded contract:** HTML src, href and constrained srcset only. CSS URLs, inline script strings and other URL-bearing attributes remain explicitly outside inspection. This is neither a general browser HTML parser nor proof of zero production networking. Unsupported relevant constructs fail closed rather than being silently accepted. Positive fixtures exercise valid mixed-case/spaced/quoted/unquoted/local-srcset syntax as well as the real export.

The final checker passes the actual **61 HTML files / 58 expected page routes / 1,310 supported local references**. No expected route count was lowered.

## Test-first evidence and encountered failures

| Stage | Actual result | Exit / evidence |
|---|---|---|
| Gameplay RED before edits | 6 failed, 74 passed; post-pack mutation and discarded-work cases reproduced | 1, `/tmp/wonderlab-phase6-game-red.log` |
| Gameplay GREEN | 80 tests passed | 0, `/tmp/wonderlab-phase6-game-green.log` |
| Failed-download browser RED | Restored connection + Reset could not show Land craft | 1, `/tmp/wonderlab-phase6-loader-red.log` |
| Initial loader lifecycle expectations RED | 5 new cases failed against old lifecycle | 1, `/tmp/wonderlab-phase6-loader-unit-red.log` |
| Queued-init cleanup RED | 1 failed / 5 passed, proving abandoned initialization still started | 1, `/tmp/wonderlab-phase6-loader-cleanup-red.log` |
| Focused final unit GREEN | 92 tests / 4 files passed, including six lifecycle cases | 0, `/tmp/wonderlab-phase6-focused.log` |
| Export baseline RED | 13 passed / 24 failed against archived original validator | 1, `/tmp/wonderlab-phase6-export-red.log` |
| Numeric-entity RED | 37 passed / 1 failed | 1, `/tmp/wonderlab-phase6-export-entity-red.log` |
| Local-base RED | 39 passed / 1 failed | 1, `/tmp/wonderlab-phase6-export-base-red.log` |
| Final export fixtures GREEN | 40/40 passed | 0, `/tmp/wonderlab-phase6-export-base-green.log` and final aggregate |

The first aggregate attempt stopped on one unused browser-instrumentation counter in the new regression harness. It was corrected and the complete aggregate rerun; failure log retained at `/tmp/wonderlab-phase6-check-initial-failure.log`. An early browser assertion counted Next's initial same-URL history events as reloads. A trace confirmed the document was unchanged; the regression now proves document identity directly instead of assuming a single navigation event. This changes only the new harness instrumentation, not any existing gate or application requirement. The original before-fix download test failed on genuinely missing controls.

## Final actual commands and results

All commands below completed with **exit 0**. The aggregate uses `&&`, so its success confirms every constituent command completed successfully.

| Command | Result |
|---|---|
| `npm ci` | Frozen-lockfile install, 204 packages; dependency versions/lockfile unchanged |
| `NEXT_TELEMETRY_DISABLED=1 npm run check` | Complete final aggregate passed |
| `npm run lint` within aggregate | ESLint passed |
| `npm run typecheck` within aggregate | Strict `tsc --noEmit` passed |
| `npm test` within aggregate | **334 tests / 16 files passed**; +18 focused regressions over baseline |
| `npm run test:quality` within aggregate | **40 Node tests passed**, up from 13 |
| `npm run build` within aggregate | Production compilation/type validation passed; **61 static pages generated** |
| `npm run validate:export` within aggregate | **58 expected page routes**, 61 HTML files, 1,310 references; no missing/external inspected references, known secret hits or exported source maps |
| `npm run test:security` | **43 tests / 2 files passed**, subset of full suite |
| `npm run audit:dependencies` | **0 reported vulnerabilities** |
| `npm run test:browser` with loopback/browser environment | **28 legacy/security scenarios passed**, including all eight original gameplay flows |
| `node --import /tmp/wonderlab-phase6-evidence-path.mjs scripts/universe-browser.mjs` with same environment | Existing 42-game matrix passed; **252 successful stages** at desktop/mobile widths, persistence/replay/reset/library controls |
| `node scripts/remediation-browser.mjs` with same environment | Four focused groups passed: reset download recovery, repeated retry recovery, Mars rejection/valid play/reset, Stack rejection/valid play/reset |
| `git diff --check` | No whitespace errors |

Browser environment: `NODE_PATH=/tmp/wonderlab-phase4-browser-tools/node_modules`, `WONDERLAB_TEST_ORIGIN=http://127.0.0.1:4187`, existing Playwright 1.62.1 and `/usr/bin/chromium` 154.0.8037.57. A loopback-only server served the freshly built `out/`. The temporary import hook redirects only the existing universe harness's hardcoded JSON output to `/tmp/wonderlab-phase6-universe-browser.json` to preserve earlier evidence; assertions and source are unchanged. No browser or project dependencies were added.

Normal suites recorded zero external page requests/page errors; the legacy suite also recorded zero cookies/dialogs/body/non-GET requests. Intentional blocked downloads occur only in the focused recovery harness. These are local page-request observations, not production/provider or browser-internal traffic assurances. Existing non-blocking Node typeless-module and Vite future-loader warnings remain; configuration was not changed to hide them.

Fresh evidence: `/tmp/wonderlab-phase6-{install,check,security,audit,legacy-browser,universe-browser,browser-final}.log`, `/tmp/wonderlab-phase6-universe-browser.json`. Regression RED/GREEN logs are above. Independent review found no remaining material Mars/Stack/loader issue; its base-resolution finding was fixed and rechecked: the original fixture now exits 1 with an unsupported-base diagnostic.

## Exact Phase 6 file scope

14 files added or incrementally modified relative to the archived Phase 6 starting point. All other pre-existing work remains unchanged. The full working tree still includes earlier uncommitted privacy/security/game-expansion work; this list does not authorize a blanket commit of that broader set.

| File | Purpose |
|---|---|
| `src/components/universe/strategy.tsx` | Freeze/check/consume the required Mars supplies |
| `src/components/universe/strategy.test.tsx` | Six Mars stage/state regressions |
| `src/components/universe/coding.tsx` | Attach operator provenance to surviving stack values |
| `src/components/universe/coding.test.tsx` | Six Stack stage/provenance/alternative-path regressions |
| `src/components/universe-game-player.tsx` | Attempt-scoped loading, cleanup, explicit retry and reset recovery |
| `src/components/universe/board-loaders.ts` (new) | Explicit on-demand family import boundary |
| `src/components/universe-loading.test.tsx` (new) | Six loading/retry/stale-response/unmount regressions |
| `scripts/security-artifacts.mjs` | Regular-file/symlink/reference validation and safe diagnostics |
| `scripts/export-html-references.mjs` (new) | Bounded supported-HTML reference inspection |
| `scripts/quality-gates.test.mjs` | Expanded precise negative and positive export fixtures |
| `scripts/remediation-browser.mjs` (new) | Actual production-chunk failure/recovery and gameplay regressions |
| `docs/ARCHITECTURE.md` | Corrected loader/resource/provenance architecture |
| `docs/QUALITY_GATES.md` | Accurate scanner scope and all three local browser commands |
| `docs/PHASE_6_REMEDIATION_REPORT.md` (new) | This evidence, scope and remaining-gates report |

## Remaining defects and release gates

Confirmed Phase 6 targets GU5-01 through GU5-04 are corrected within the stated scanner contract. Other Phase 5 findings were deliberately left outside this approved scope: Memory Matrix's nonvisual/colour-only preview accessibility gap (GU5-05), negative orbital-speed semantics (GU5-06), invisible new-game personal bests (GU5-07), mount-only daily rotation at UTC midnight (GU5-08), and remaining policy/provider/audience wording (part of GU5-09). Browser-gate instructions from GU5-09 were directly updated because they describe the affected regression checks. No unrelated UI or game was redesigned.

The preserved simultaneous localStorage write race remains non-transactional and disclosed. Full assistive-technology, natural tab-order, real-device and cross-browser audits remain incomplete. No full security, privacy or legal compliance certification is made.

**Production release remains BLOCKED** on verified deployment identity/SHA/aliases and live HTTPS/redirect/header/cookie/script/request evidence, provider logs/retention/deletion/integrations, verified operator/private monitored contact, applicable current official Indian legal-source/commencement review and qualified advice where needed, plus owner-approved release engineering. These gates were not investigated or changed by this focused local task.

**Next action:** review the exact focused remediation diff and evidence. No staging, commit, push, PR, merge, deployment, production setting, remote or upstream change occurred. Separate explicit approval is still required before any such action.

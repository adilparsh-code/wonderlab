# WonderLab child privacy, data protection and trust audit

Audit date: **27 October 2026 (Asia/Calcutta)**. Engineering review, not a legal opinion, independent certification or proof of zero collection.

## Scope and method

Reviewed `/workspace/wonderlab`, branch `work`, HEAD `70e441437c2864c8f5296789e120eec60230e132`. Initial working tree was clean. The five recent commits, origin fetch/push URLs and full relevant source were inspected. Fetch found `origin/main` at `8eed0edf3c0720b6ba4bd5bfe9b98a518846999a` (merge PR #1); `origin/work` remained `70e4414`. Main's tree equals the reviewed work tree, including the game-player test fix. No branch switch, merge, cherry-pick, commit, push, PR or deployment was performed. No other repository was touched.

Inspected all application routes, layout/CSS, footer/navigation, game/science/coding/catalog/progress implementations and tests; README; product, architecture, content, deployment, QA and privacy documents; package manifests/lockfile; CI and Next/Vitest/TypeScript configuration. Searched browser storage, transports, cookies, environment references, server actions/routes, unsafe rendering, scripts, embeds, resources, logging and credentials. Only relevant exported variable **names** were inspected; no secret values were printed. `GH_TOKEN` is tooling authentication, not an application integration. No app `process.env` references were found. No Vercel project configuration or dashboard access was present.

Actual routes: `/`, `/arcade/`, eight `/arcade/<game>/` routes, `/how-it-works/`, `/coding-lab/`, `/challenges/`, `/about/`, `/privacy/`, `/accessibility/`, plus framework not-found output and icon. **There is no `/science/` route**; science lives at `/how-it-works/`. The build reports 19 static pages; this is not 19 distinct educational activities.

Plan: retain the static application and educational behaviour; expand the existing policy; reuse the existing progress-reset component on Privacy; add focused regression tests; validate source and the built export; separately record infrastructure and legal evidence that cannot be obtained. No new dependencies, accounts, consent/age gates, collection channels or hosting settings.

## A. Existing commitments

These are findings from the baseline at `70e4414`, before policy changes. Paths describe locations in that baseline; new promises are distinguished below.

| Existing statement and location | Implementation evidence | Assessment and response |
| --- | --- | --- |
| “No account needed” — `src/app/page.tsx`; “No sign-in” — `src/app/arcade/page.tsx`; `src/app/about/page.tsx` | No auth routes, login inputs or auth SDK; local activities | Supported by reviewed app. Retained. |
| “does not ask for a name, email address, birthday, location, or school” — `src/app/privacy/page.tsx`; no personal-details form — `docs/PRIVACY.md` | Inputs are search, practice answers, typing and science controls; no account/profile/upload APIs | Supported as no intentional identifying-information request, not an absolute inability to type identifying text. New policy asks visitors to use practice text only. |
| No analytics, advertising or tracking scripts — Privacy page; `docs/PRIVACY.md`; `docs/PRODUCT_SPEC.md` | No such SDK or script integration in source/manifest; local styles/system fonts | Supported within reviewed bundle. Does not prove host-injected features are absent in production. |
| No third-party tracking — product spec; no remote fonts/images — `docs/ARCHITECTURE.md` | Source renders local UI/assets; CSS uses local font fallbacks; no embeds or external font imports | Supported for current app, not every future host. |
| “Optional local progress”; not sent to servers; reset available — Privacy page; docs; About | `src/lib/progress.ts`; `GamePlayer.finish`; `ProgressSummary` on Arcade | Local-only implementation supported, but persistence happens automatically on completion if supported, without opt-in. Changed wording to **automatic device-local progress**, disclosed shared profiles and no expiry. |
| “Typing stays in the round” — Privacy page; `src/lib/catalog.ts` Typing Sprint instructions | `typedText` in React state; storage path receives only score/ID; reset clears typed text | Supported as no app persistence/transmission, not guaranteed browser/device erasure. |
| No external AI API — `docs/PRIVACY.md`, product spec; “Answers are checked locally” — Coding Lab | Fixed-choice `CodingChallenges`; no API transport or arbitrary code evaluation | Supported. More explicit promise now covers student work and AI providers. |
| No public deployment “configured or verified” — Privacy page, docs, deployment/QA docs | Audit cannot inspect a deployment, but owner reports a Vercel workflow and main now includes a merge | Historical text could falsely imply no deployment exists. Updated privacy text to **production configuration/behaviour not verified in this review**. Other deployment/QA docs are historical, not current infrastructure evidence. |
| Footer Privacy link — `src/components/site-footer.tsx`; no public contact configured — Accessibility page/docs | Link exists and points to `/privacy/`; no monitored private contact or legal operator identity in repo | Link preserved and tested. Contact/identity remain explicit gaps. |

**Not existing explicit promises at baseline:** ages 11–18 inclusive; all-visitors privacy default; no sale of children's personal data; explicit no behavioural profiling/session replay; cookie/session-storage statement; student-work-to-AI statement; no-expiry/shared-device/cross-tab-reset caveats. These are new product commitments or disclosures, not invented historical claims. No secure-host-log or absolute-zero-data promise was found or added.

## B. Data-flow inventory

“Local-only” describes the inspected app's behaviour, not anonymity or privacy from people sharing a device. Even non-identifying educational values may become personal data if associated with a known learner. No pseudonymous visitor ID was found.

| Data/class | Origin and processing | Storage/retention | Leaves device/recipient | Evidence/uncertainty |
| --- | --- | --- | --- | --- |
| Names, email, DOB, school IDs, parent details, profiles, media — personal data | No intentional request or collection feature | No corresponding app store | No corresponding app recipient | Source and rendered UI reviewed; free text can still contain unsolicited information locally. No children were involved in tests. |
| Practice answers and search text — potentially personal if visitor types identifying text | `GamePlayer`/`GameCatalog` controlled inputs; submit prevents default; local checks/filtering | React state; no app persistence | No app transmission found | Inspected handlers; representative tests/browser interactions. Browser recovery/extensions not audited. |
| Typing text, accuracy/time and reaction/memory/maze/algorithm round state — educational, potentially linked on a shared device | Local state, timers, `Date.now`/`performance.now`; no keystroke telemetry | Component lifetime; reset clears state. Completed-game score may persist separately | No app transport found | Complete game-player source reviewed; tests cover typed text not persisted; no promise about browser autofill/recovery/OS software. |
| `wonderlab.progress.v1` — device-local educational progress, potentially identifying in context | Completing any game calls `recordCompletion` then `saveProgress` | Local storage: `version: 1`, `bestScores: {gameId: number}`, `completedGames: string[]`; no timestamps/name/visitor ID; no automatic expiry | No sync/upload by app; shared browser users/extensions may access it | Exact payload tested after actual game completion. Parser accepts strings/finite scores and ignores extra top-level fields; no arbitrary personal field is produced by current callers. Storage is not an encrypted vault or a guarantee of anonymous data. |
| Coding Lab choices — temporary educational data | Fixed binary/condition/loop buttons in `CodingChallenges` | React state, resettable; no code editor/upload/execution | No external service | Source, component tests and local browser check. No AI provider integration. |
| Science selections/sliders/check answers — temporary educational data | `ScienceExperiences` state and local calculations | Memory only | No external service | Source and representative tests/browser interaction. |
| Static content/assets — non-personal educational content | Build produces HTML, JS, CSS, icon and route payloads | Export in `out/`; host/CDN cache behaviour unverified | Browser requests host assets; same-origin navigation/prefetch may produce further GET requests | Local browser checks observe requests. This is website delivery, not proof that a GET cannot carry identifying technical metadata. |
| IP, requested URL/path, user-agent and network/security metadata — potentially identifying technical data | Network/browser request to hosting/CDN, potentially Vercel | Actual logs, regions, access, recipients, retention, deletion and log drains **unknown** | Hosting/CDN and network intermediaries may receive it | No verified production URL/settings or retrieved current host documentation. No retention/security/zero-collection claim. Keep personal data out of URLs. |
| Cookies, analytics, replay, remote errors, advertising, AI, auth, database | No app integration, cookie write, session storage, telemetry forwarding, API routes/server actions found | None implemented by reviewed application | Host-injected/platform features **unknown** | Unit tests instrument fetch/XHR only; local Chromium observes broader requests/cookies for exercised flows. Production must be separately inspected. |
| Build/developer tooling | npm install/audit and Git/CI contact registries/GitHub; Next build runs in developer/CI environment | Build caches/artifacts and service tooling logs | npm/GitHub/build platforms, not student input from a browser session | Lockfile/CI reviewed; not a claim about every provider's tooling telemetry. Do not conflate build-time traffic with student runtime flows. |

Reset already existed on Arcade. Privacy now reuses it. It removes one key, preserves unrelated storage, reports errors and works even if stored data is malformed. It does not clear game state in other tabs, prevent new completions, remove remote logs or erase another device. Policy advises closing game tabs before resetting. No cloud deletion capability is invented.

## C. Indian legal review — current-law verification blocked

**The current commencement schedule and Rules were not verified. This section is a review framework and provisional Act summary, not an authoritative statement of obligations in force on 27 October 2026.**

Attempts to retrieve these official sources failed with `URLError: Tunnel connection failed: 403 Forbidden` from the environment's egress proxy:

1. [DPDP Act 2023, India Code](https://www.indiacode.nic.in/bitstream/123456789/22037/2/a2023-22.pdf).
2. [DPDP Rules 2025 and commencement material, MeitY](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025).

No dates, notification numbers, exemptions or current legal status have been inferred from the 2023/2025 titles. Enactment, notification and commencement are different events. Different sections/rules can commence at different times. **Effective dates for sections 3–9, associated Rules and obligations currently in force remain an open release gate**, requiring official Gazette commencement notifications and any subsequent amendments/corrigenda as of the audit date. The requested complete current-law review therefore remains unfinished for an external access reason.

| Provision | Provisional Act-level subject to verify against official text | Commencement / applicability finding |
| --- | --- | --- |
| Section 2(f) | A child means an individual who has not completed 18 years | Under-18 is distinct from owner's voluntary **11–18 inclusive** scope. Current text/commencement not independently revalidated here. |
| Section 3 | Digital personal data processed in India, including non-digital data subsequently digitised; certain processing outside India connected with offering goods/services in India; personal/domestic and specified publicly available data exclusions | Do not infer exemption merely because the site is free, static or educational. Map operator/host roles and data flows with counsel. Effective date unverified. |
| Sections 4–5 | Lawful purpose and consent or specified legitimate uses; notice requirements | No universal ban on children's data processing. Determine actual data fiduciary/processor roles, technical-data processing and applicable grounds/notices. Effective dates unverified. |
| Sections 6–7 | Consent standards and withdrawal; enumerated legitimate uses | Do not claim an educational website automatically qualifies for a legitimate use, or that a policy notice is consent. Dates/rules unverified. |
| Section 8 | General obligations including processor arrangements, safeguards, breach handling, erasure subject to retention duties, contact/grievance mechanisms and other applicable duties | No host contract, security control or retention verified. Identify responsibility and operative obligations with counsel; effective date unverified. |
| Section 9 | Verifiable parental consent before processing a child's personal data; processing detrimental to well-being; tracking/behavioural monitoring and targeted-advertising restrictions; qualified statutory/rule-based exceptions and possible notified age-related treatment | Do not assume all processing under 18 is prohibited. Do not assume any educational, safety or institution exception covers WonderLab. Rule criteria, scope and dates unverified. Do not build DOB/parent data collection to compensate for this uncertainty. |
| DPDP Rules 2025 | Notice, consent verification, reasonable safeguards, breach notices, retention, children's processing and any schedules/exemptions, rights/contact handling, phased commencement | Exact operative rule numbers, published wording, conditions and dates must be checked in the official notified text, not substituted with draft rules or secondary commentary. No exemption relied upon. |

Counsel should also assess applicable Information Technology Act 2000 provisions and rules (including any continuing SPDI/security/privacy requirements and interaction with DPDP amendments), CERT-In directions where applicable, consumer protection/advertising, child protection, contracts/hosting and cross-border processing, and accessibility duties. This is a referral list, not a finding that every instrument applies. Foreign child-privacy laws may matter if serving those jurisdictions; no cross-jurisdiction certification is made.

WonderLab's stricter chosen policy is to avoid intentional personal-data collection for every visitor, expressly including ages 11–18; no accounts, profiling, targeted advertising or remote student-work processing. This policy does not remove responsibility to investigate unavoidable hosting metadata. Do not publish a claim of “DPDP compliant”, “certified”, or “zero data collected”.

## D. Gaps and priorities

Severity reflects visitor impact and release uncertainty, not a legal conclusion.

| Severity | Evidence/gap | Impact | Action/status |
| --- | --- | --- | --- |
| High — unresolved release gate | No verified live URL, Vercel settings, host documentation, retention, log drains, platform analytics, injected scripts/cookies, data regions or access controls | Technical data about children may be processed despite local-only game state | Owner must supply verified deployment context and review dashboard/contracts, minimise logging/retention, disable unnecessary analytics/replay/drains if present, and verify hosted traffic/headers. No production settings changed. |
| High — unresolved legal gate | Official Act/Rules/commencement retrieval blocked | Cannot establish applicable current duties, dates, exceptions or processor responsibilities | Obtain official notified texts and commencement amendments; qualified legal review. No compliance assertion. |
| High — unresolved trust gap | No verified legal operator or monitored private privacy contact in repo | Families lack a verified private concern/rights channel | Owner must provide verified identity/contact and response ownership. Never ask children to put details in a public issue. No email or officer invented. |
| Medium — corrected disclosure | Progress called “optional” though automatically saved; no expiry/shared-browser disclosure | Misunderstanding of persistence or privacy | Updated page/docs accurately explain automatic save, visibility, reset and no expiry. |
| Medium — improved control | Reset available only on Arcade; no regression tests for storage deletion/failure | Visitors may miss deletion or mistake failed reset for success | Privacy now has the same real control; tests cover malformed/blocked storage and preservation of unrelated keys. |
| Medium — residual limitation | An open game has in-memory progress; finishing it after reset can write old scores again | Clearing one key is not global cross-tab erasure | Explicit warning and close-tabs advice; no promise of immediate multi-tab erasure. A future synchronised reset design can be reviewed separately. |
| Medium — unresolved defence-in-depth | No CSP or explicit security headers in tracked configuration; static export has inline framework/bootstrap scripts | Source cannot establish host protections or script injection resistance | Review deployed TLS, CSP compatible with actual generated scripts (hash/nonce strategy), frame protection, MIME sniffing, referrer and permissions policies. Do not add an untested CSP or Next headers that won't affect a static host. |
| Low — corrected policy scope | Baseline lacked explicit ages 11–18, no-sale and student-work/AI commitments; stale undeployed wording | Ambiguous promises or misleading infrastructure status | Clear scoped commitments added; deployment behaviour stated as unverified rather than non-existent. |
| Residual test scope | No full hosted browser/network capture, screen-reader assessment or browser-extension analysis | Local tests cannot prove complete production privacy/accessibility | Manual production review with no child data remains required. |

No existing account, tracker or remote collection path was found to remove. No collection consent system is introduced: doing so would add personal-data flows contrary to this task.

## E. Changes made

- `docs/PRIVACY.md`: replaces the limited statement with the existing policy's expanded, evidence-scoped commitments, automatic storage schema/retention, shared-browser/reset limits, host uncertainty, identity/contact gaps and legal review boundary. This remains the policy document, not a duplicate competing policy.
- `src/app/privacy/page.tsx`: presents parent-friendly commitments in existing cards/callouts; includes update date, ages 11–18/all-visitors default, no account/tracking/sale/AI, local activity details, hosting caveat and contact gap; reuses `ProgressSummary` for real deletion on Privacy. Existing footer Privacy link retained.
- `src/components/privacy.test.tsx`: eight tests cover discoverable policy/no collection controls, commitment and hosting caveat, actual Privacy reset and unrelated-key preservation, malformed progress, denied deletion, numeric score/ID-only persistence with no fetch/XHR, typing reset/non-persistence, and local coding/science/search interactions without persistent profiles. Successful Typing Sprint completion is also checked for an exact score/ID-only payload, with no raw text.
- `docs/PHASE_2_AUDIT_REPORT.md`: this evidence inventory, legal limitations, risks and validation report.

No game engine changes, dependency updates, configuration changes, collection features, accounts or age checks. Memory Matrix source and its existing preview/recall tests are unchanged. Existing user changes were absent at start; no reset/clean/amend was used.

## F. Verification

Results are current-instance engineering checks, not production assertions. Node 24.19.0/npm 11.9.0; Chromium uses the newly built static export served locally.

| Check | Result | Exit |
| --- | --- | --- |
| New focused tests before policy implementation | 2 failed (missing child commitment and Privacy reset), 6 passed; expected red baseline | 1 |
| `npm test -- src/components/privacy.test.tsx` after implementation | 8 passed | 0 |
| `npm run typecheck` | Passed | 0 |
| `npm test` | 61 passed across 7 files, none skipped; includes existing 10 GamePlayer tests and Memory Matrix all levels, preview/recall, replay/reset | 0 |
| `npm run lint` | Passed | 0 |
| `npm run build` | Passed; generated 19 static pages and export | 0 |
| `npm audit --json --cache /workspace/.npm` | 0 reported vulnerabilities across all reported severities | 0 |
| `git diff --check` | Passed with no whitespace errors | 0 |
| `node /tmp/wonderlab-privacy-browser.cjs` | Passed against built export: 150 same-origin GET requests, zero observed external requests/request bodies/cookies/page errors; eight main routes and footer links; actual game completion, reset preserving unrelated storage, typing non-persistence, coding/science/search, Memory Matrix all levels/hidden recall/replay/reset, 375px Privacy layout | 0 |

Vitest emits an existing non-fatal warning about ESM syntax under a future native config loader, and a jsdom worker performance suggestion. Neither is suppressed. npm audit is registry advisory evidence, not proof of no vulnerabilities or malicious code. Lockfile v3 has integrity hashes and npm registry resolved sources; only optional `fsevents` is marked `hasInstallScript`. No packages or trust verification were changed. Installed optional platform helper packages noted by `npm ls` do not establish that every transitive artefact was independently audited.

Automated transport spies cover fetch/XHR for selected component interactions only. They do not observe all browser networking. The separate Chromium check observes real page requests in a fresh browser context for representative routes/flows, with no production access or child data. It must not be generalized to all deployments, provider scripts, browsers or future changes.

A separate reviewer found no critical or important defects and independently reran all eight privacy tests successfully. Two minor suggestions were addressed: narrowed the reset description to temporary round/input state, and asserted successful typing completion persists only the score and game ID.

## G. Remaining risks and required manual work

1. Verify actual live deployment/domain and Vercel project ownership; inspect host documentation and current contracts/settings for IP/user-agent/URL/security/edge/access/runtime logs, retention, regions, subprocessors, support access, analytics, monitoring and log drains. Runtime logs alone would not establish CDN/security logging practices.
2. Review live browser requests (including first visit, redirects, 404s and storage-blocked paths), cookies, service workers and host-injected analytics/preview tooling. Verify response headers and HTTPS on production, not the local Python server.
3. Confirm operator identity and a monitored private contact with a responsible response process; update the policy using verified details only. Do not collect parent/child identifiers through a new form in this task.
4. Complete official-source legal commencement/rules review as of the audit date, assess exceptions without assuming them, and obtain qualified legal advice. Extend review to served jurisdictions where needed.
5. Review the shared-device and open-tab limits of local progress; do not call it anonymous, encrypted or globally erasable. Clearing browser data may lose scores. Future changes adding remote collection require explicit approval and another data-flow review.
6. Independently review accessibility and mobile reading of the longer policy; automated DOM checks and one viewport are not assistive-technology certification.

## H. Proposed final commitments

Supported by inspected application source and scoped local tests:

- Learning activities need no student account or personal profile.
- We do not intentionally request or collect personal data from visitors aged 11–18 and use the same default for everyone.
- Educational inputs stay within local activity state; only completed game IDs and numeric best scores are saved automatically on the current browser when storage is available.
- The app does not upload educational inputs or progress, including to AI providers.
- The app includes no analytics, advertising, tracking pixels, session replay or behavioural profiling. We will not sell children's personal data or use it for targeted advertising.
- Visitors can remove saved local progress from Privacy or Arcade; failures and cross-tab/host-log limitations are disclosed.

**Qualification:** no account, tracker, AI or sale integration exists in reviewed source, but prospective organisational promises and infrastructure processing require ongoing owner enforcement. Hosting metadata is separate and unverified. Do not shorten these commitments into a zero-data or compliance guarantee.

## I. Deployment readiness

The scoped code/policy changes are for human review, left uncommitted. Passing engineering checks do not close the high-priority legal, hosting and operator/contact gates. Do not describe this as a completed legal audit or approve production privacy readiness until those gates are resolved. No deployment, production settings/secrets changes, publication or integration was performed.

## Production approval requirement

Production deployment requires the project owner's explicit approval after reviewing the actual code diff, automated test/build evidence, findings and remaining risks. No approval is inferred from passing checks or from this report. Do not deploy, publish, merge, open a PR, push or commit as part of this audit task.

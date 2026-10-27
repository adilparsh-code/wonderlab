# Privacy statement

Last updated: 27 October 2026.

## Purpose, audience and operator

WonderLab is an independent educational project providing browser games, science models and beginner coding activities, primarily for learners aged 11–16. We do not intentionally request or collect personal data from visitors aged 11–18. We apply the same privacy-first default to every visitor. This voluntary product commitment is not a statement that Indian law prohibits every form of processing relating to anyone under 18.

The repository is https://github.com/adilparsh-code/wonderlab. A repository owner is not verified evidence of a legal operator's identity. No verified legal operator name or monitored private privacy contact has been published. The project owner must resolve this gap before a production release of these changes. Do not post children's personal information in public issue trackers. No company, address, officer or contact details are invented here.

## No student accounts or personal-information requests

Activities require no registration, login or profile. There are no personal-detail forms, public comments, chat, uploads, photographs, recordings or parental-account collection. We do not ask for names, email addresses, phone numbers, birthdays, addresses, school details, student IDs or social accounts. Do not enter personal information in practice inputs; use the supplied typing sentence and educational answers. We do not collect dates of birth to establish eligibility.

## What stays in the browser

- Search terms and filters, game answers, round timing, maze moves, memory recall choices, science controls and Coding Lab choices are held in component memory for interaction. Typing Sprint compares text in memory and does not save the typed sentence. Resetting a round clears its temporary inputs and round state; leaving the activity discards its component state; this is not a guarantee about browser recovery, extensions or device software.
- Coding Lab evaluates fixed choices locally; it neither executes arbitrary code nor uploads submissions.
- On game completion, if local storage is available, the app automatically saves `wonderlab.progress.v1`: a format `version`, `bestScores` mapping game IDs to numeric best scores, and `completedGames` containing game IDs. It does not save raw answers, names, identifiers, timestamps, typing text or detailed interaction histories. “Local progress” is automatic when supported, not a separate opt-in feature.
- Application code does not transmit or sync this record, scores, typing text, coding choices or science interactions to a server, AI provider, analytics platform or remote logging service. Local scores are not verified educational records.
- There is no automatic expiry. The data remains until reset, browser removal/eviction, or private-session disposal, subject to browser behaviour. Anyone using the same browser profile may see it. Device-local does not mean anonymous or inaccessible to other people using that device; no cloud backup or confidentiality guarantee is made.
- Blocked or malformed storage does not prevent educational play. The app reports read/save failures. A successful future game completion can replace a malformed record with new progress.

## Reset and deletion

The Privacy page and Arcade offer **Reset local progress**. The control removes only `wonderlab.progress.v1` from the current browser's local storage, without clearing unrelated storage. If deletion fails it reports failure. Site data can also be removed using browser settings; this can lose saved progress.

Open game views refresh saved progress when browser storage changes. Before saving a completion, the app rereads the latest validated record so a later completion does not simply restore its old in-memory score snapshot. New completions can create a new record. Browser local storage is not a transactional multi-tab database: close other game tabs before clearing if a completion could occur at the same time. Reset does not erase temporary activity inputs in other tabs, another device's data or hosting logs, and does not cancel third-party retention.

## Cookies, tracking, advertising and external services

Reviewed application code does not set cookies, use session storage, create visitor identifiers, include analytics/advertising pixels, perform cross-site tracking or behavioural profiling, or integrate session replay. We will not sell children's personal data or use it for targeted advertising. Educational data is not intentionally shared with third-party services by the app.

Scripts and CSS are served as site assets; fonts are system fallbacks, and science diagrams are local UI. There are no external AI APIs, third-party embeds, remote images/fonts, authentication services or remote database in the reviewed implementation. Site navigation and asset delivery still make HTTP requests to the host. Provider-injected scripts, cookies, technical logs, request metadata and network infrastructure require separate verification; this document does not promise their absence.

## Hosting, technical data and security limits

A host/CDN can process IP addresses, requested URLs, user-agent information and technical/security logs. These may identify or be linked to a person. The deployment workflow refers to Vercel, but no production URL, dashboard settings, log destinations, access controls, regions, retention or deletion behaviour were verified in this audit. Current Vercel documentation could not be retrieved in the audit environment. We do not claim zero collection, a retention period, secure-log guarantees, or verified host privacy.

The source uses a static export without application API routes/server actions, local React rendering without unsafe HTML insertion, and guarded browser storage. No application log forwarding or credentials are required. These are implementation facts, not guarantees against every security risk. TLS, CSP and other response headers, platform analytics, error monitoring, log drains, retention minimisation and any injected resources must be reviewed on the real deployed service before release. A static export's hosting headers cannot be established from Next.js source configuration alone.

## Future changes and legal review

Any feature intentionally requesting personal information requires explicit product approval and appropriate legal review before use, with revised notices and implementation. No such feature is approved by this audit. The app's protective policy covers ages 11–18 inclusive and all visitors by default; this differs from the DPDP Act's under-18 child definition.

This is an engineering description and product commitment, not a legal opinion, certification or claim of DPDP compliance. Applicable commencement dates, rules, exceptions and jurisdiction-specific duties require current official-source verification and qualified advice. The evidence, gaps and checks for this review are recorded in [the privacy audit](./PHASE_2_AUDIT_REPORT.md); the visitor-facing statement is `/privacy/`.

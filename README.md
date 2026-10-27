# WonderLab

**Don't Just Learn It. Explore It.**

WonderLab is a free, static learning arcade for curious students aged approximately 11–18. It combines playable maths and logic games, interactive science models, and beginner coding challenges. No account, payment, external API, or server-side game processing is required.

## Get started

Requirements: Node.js 24 or later and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js. To verify a release build:

```sh
npm run check
npm run test:security
npm run audit:dependencies
```

The production build writes a static site to `out/`. `check` includes lint, types, all tests, gate-fixture tests, build and export validation. Browser checks are a separate local gate; see [quality gates and prerequisites](./docs/QUALITY_GATES.md). Passing these checks does not authorize deployment.

## What's included

- Fifty playable games: the original eight plus 42 three-stage space, science, coding, maths, and strategy journeys.
- Five world filters, search, difficulty and neutral sort, with browser-local completion status, derived XP, levels and badges.
- A daily discovery pick that rotates by UTC day without storing daily activity.
- Six interactive science models with controls, knowledge checks, and model limitations.
- Three guided coding concepts evaluated locally; arbitrary code is never executed.
- Browser-local best scores and completion counts, saved automatically when storage is available.
- Responsive routes for the arcade, science, coding, challenges, about, privacy, and accessibility.

See [the product spec](./docs/PRODUCT_SPEC.md), [architecture](./docs/ARCHITECTURE.md), and [deployment guide](./docs/DEPLOYMENT.md) for details. Known gaps and verified checks are recorded in [the QA report](./docs/QA_REPORT.md).

See the [game catalogue and controls](./docs/GAME_UNIVERSE_CATALOGUE.md) and [expansion verification report](./docs/GAME_UNIVERSE_REPORT.md) for exact coverage and limitations.

## Privacy

The app includes no analytics or advertising SDKs. Scores are saved automatically when available in browser local storage and are not sent by application code. The typing exercise keeps typed text only in memory for the current round. Hosting providers may process request data; see [the privacy statement](./docs/PRIVACY.md) and review the selected host's terms before launch.

## License and contact

WonderLab is licensed under the [MIT License](./LICENSE). You are free to use, copy, modify, and redistribute it subject to the license terms.

No public contact address has been configured yet. Do not publish a placeholder as if it were monitored. Public repository issues are not a private privacy-contact channel; never include children's personal information there. A verified monitored private privacy contact remains an owner action.

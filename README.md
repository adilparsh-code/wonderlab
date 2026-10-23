# WonderLab

**Don't Just Learn It. Explore It.**

WonderLab is a free, static learning arcade for curious students aged 11–16. It combines playable maths and logic games, interactive science models, and beginner coding challenges. No account, payment, external API, or server-side game processing is required.

## Get started

Requirements: Node.js 24 or later and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js. To verify a release build:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The production build writes a static site to `out/`.

## What's included

- Eight playable games with explanations, score feedback, reset, and replay.
- Six interactive science models with controls, knowledge checks, and model limitations.
- Three guided coding concepts evaluated locally; arbitrary code is never executed.
- Optional browser-local best scores and completion counts.
- Responsive routes for the arcade, science, coding, challenges, about, privacy, and accessibility.

See [the product spec](./docs/PRODUCT_SPEC.md), [architecture](./docs/ARCHITECTURE.md), and [deployment guide](./docs/DEPLOYMENT.md) for details. Known gaps and verified checks are recorded in [the QA report](./docs/QA_REPORT.md).

## Privacy

The app includes no analytics or advertising SDKs. Optional scores are stored in browser local storage and are not sent by application code. The typing exercise keeps typed text only in memory for the current round. Hosting providers may process request data; see [the privacy statement](./docs/PRIVACY.md) and review the selected host's terms before launch.

## License and contact

No license or public contact address has been configured yet. Do not assume this project is open source for reuse until a license is added.

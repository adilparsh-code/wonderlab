# Deployment

## Current release status — 27 October 2026

**Production release is BLOCKED.** The owner provided `https://wonderlab-5737pqk5t-my-self18.vercel.app` and historical Vercel/main deployment metadata, but this environment cannot independently verify the current deployed SHA, target/aliases, headers, cookies/scripts, logging/retention or legal/operational gates. See [the release report](./PHASE_2B_RELEASE_REPORT.md). The Cloudflare/GitHub hosting options and pricing/limit statements below are historical planning context, not verified current production settings or a recommendation to change hosts. No deployment is authorized by these instructions.

## Controlled release checklist

- [ ] Preserve/review the exact complete Git diff, including untracked reports/tests/scripts; verify HEAD, remote refs and approved file scope.
- [ ] Run the frozen install and all [quality gates](./QUALITY_GATES.md), including the separately installed local browser suite. Record actual commands/counts/exits and failures.
- [ ] Obtain owner-approved read-only provider metadata for the actual production target: project, deployment state/time, aliases and deployed Git SHA, plus relevant build logs without secrets. Do not infer deployment identity from a local or preview SHA.
- [ ] Verify live HTTPS/redirects, public routes and 404s, headers, cookies/storage, scripts and outgoing requests in an authorized session, without intrusive testing or personal data.
- [ ] Verify hosting logs/retention/deletion, analytics/integrations/injected scripts, contracts, operator identity, monitored private contact and current official-source legal review. Update notices using verified facts only.
- [ ] Owner verifies GitHub required checks/rulesets, latest-SHA enforcement, reviews and bypass permissions. Workflow syntax/local passing checks do not establish branch protection or successful remote CI execution.
- [ ] Obtain explicit approval for any commit, then separately for push/PR. Warn that provider automation can run on those events even though this workflow has no deployment job. Do not force-push or amend prior work.
- [ ] Before any merge/production deployment, obtain separate explicit owner approval, confirm material gates are closed, and recheck remote state and artifact-to-commit provenance.

If an access barrier prevents verification, stop there; do not change protection, aliases, credentials or production settings to make a check pass. The owner can collect read-only screenshots/exports with secrets withheld. A proxy tunnel 403 is not proof of an application-origin 403.

## Primary: Cloudflare Pages

The application is a Next.js static export. Run `npm ci` and `npm run build`; upload the generated `out/` directory as the Pages artifact. For Git integration, configure the build command as `npm run build` and the output directory as `out`. No Pages Functions or environment secrets are needed.

Cloudflare's [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) state that the Free plan currently includes 500 builds per month, one concurrent build, up to 20,000 files per site, and a 25 MiB maximum individual asset. The site has no intentionally large media assets or functions. At this configuration and within current free-plan limits, estimated recurring hosting cost is **$0/month**, excluding an optional custom domain, taxes, or usage beyond the free limits. Limits and plan terms can change.

Before enabling Git integration, confirm repository ownership and permissions. Preview a deployment, test direct navigation to nested trailing-slash routes, verify HTTPS and privacy behavior, and record the verified URL. No account, project, or deployment has been created from this workspace.

## Fallback: GitHub Pages

GitHub Pages can serve the static `out/` files. Follow the current [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) and [Next.js static-export guidance](https://nextjs.org/docs/app/guides/static-exports). GitHub documents a recommended 1 GB source repository limit, a 1 GB published-site limit, a soft 100 GB/month bandwidth limit, and a soft 10 builds/hour limit for standard publishing. Confirm the repository visibility, deployment workflow, base path requirements for project sites, and direct-route behavior before choosing this fallback.

## Rollback

Keep each deployed artifact tied to a reviewed Git commit. To roll back, redeploy the last known-good static artifact or revert the release commit in a new commit, then rebuild and verify all routes. Do not force-push or rewrite shared history.

## Historical initial setup statement

The following sentence is retained as initial-project history and is superseded by the current release status above; repository remotes/workflow and an owner-provided URL exist now.

No custom domain, hosting account, Git remote, credentials, GitHub Actions workflow, or deployment URL has been configured or verified. No paid resource or subscription has been created.

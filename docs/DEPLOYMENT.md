# Deployment

## Primary: Cloudflare Pages

The application is a Next.js static export. Run `npm ci` and `npm run build`; upload the generated `out/` directory as the Pages artifact. For Git integration, configure the build command as `npm run build` and the output directory as `out`. No Pages Functions or environment secrets are needed.

Cloudflare's [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) state that the Free plan currently includes 500 builds per month, one concurrent build, up to 20,000 files per site, and a 25 MiB maximum individual asset. The site has no intentionally large media assets or functions. At this configuration and within current free-plan limits, estimated recurring hosting cost is **$0/month**, excluding an optional custom domain, taxes, or usage beyond the free limits. Limits and plan terms can change.

Before enabling Git integration, confirm repository ownership and permissions. Preview a deployment, test direct navigation to nested trailing-slash routes, verify HTTPS and privacy behavior, and record the verified URL. No account, project, or deployment has been created from this workspace.

## Fallback: GitHub Pages

GitHub Pages can serve the static `out/` files. Follow the current [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) and [Next.js static-export guidance](https://nextjs.org/docs/app/guides/static-exports). GitHub documents a recommended 1 GB source repository limit, a 1 GB published-site limit, a soft 100 GB/month bandwidth limit, and a soft 10 builds/hour limit for standard publishing. Confirm the repository visibility, deployment workflow, base path requirements for project sites, and direct-route behavior before choosing this fallback.

## Rollback

Keep each deployed artifact tied to a reviewed Git commit. To roll back, redeploy the last known-good static artifact or revert the release commit in a new commit, then rebuild and verify all routes. Do not force-push or rewrite shared history.

## Not configured

No custom domain, hosting account, Git remote, credentials, GitHub Actions workflow, or deployment URL has been configured or verified. No paid resource or subscription has been created.

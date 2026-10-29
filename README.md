# btreiner.com

Source for [btreiner.com](https://btreiner.com), my portfolio site. It's a static Astro site with plain CSS, hosted on Cloudflare. Every change goes through a pull request, and the accessibility, Lighthouse, and smoke tests below have to pass before it merges. I wrote about why I moved the site here from headless WordPress in [the site migration case study](https://btreiner.com/work/site-migration/).

## Commands

- `pnpm dev` starts the dev server.
- `pnpm build` builds the site to `dist/`.
- `pnpm preview` serves the build with Astro. It doesn't apply `_redirects` or `_headers`.
- `pnpm preview:cf` builds the site and serves it with `wrangler dev`, so redirects, headers, and the 404 page work as they do on Cloudflare.
- `pnpm check` type-checks components and content.
- `pnpm format:check` and `pnpm lint` check formatting, TypeScript, Astro, and CSS. `pnpm format` fixes formatting.

These need a build in `dist/` first:

- `pnpm test` runs the Playwright tests against `wrangler dev`: axe on every page in light and dark mode, on desktop and phone sizes, plus smoke tests for redirects, headers, metadata, and the 404 page.
- `pnpm test:fonts` checks that every character on the built pages is in each font file.
- `pnpm test:lighthouse` runs Lighthouse three times on every page in the sitemap.

## Content

Content lives in `src/content/`, with schemas in `src/content.config.ts`. A missing or malformed field fails the build.

- `work/` has the case studies, in MDX.
- `projects/` has one file per home page entry, with its tier and order. A case study entry points to its page in `work/`.
- `resume/` has the resume data, in YAML.

Unfinished spots are marked with `{/* TODO */}`. `grep -rn TODO src/content` finds them.

## Checks and deploys

CI runs format, lint, type checks, the build, and the font check, then the Playwright tests and Lighthouse in parallel. Lighthouse must score 100 for accessibility and SEO, 95 for best practices, and 90 for performance. `main` requires a pull request with passing checks. Cloudflare Workers Builds deploys each merge to `main`, and that's the only way the site is deployed.

Old URLs are redirected in `public/_redirects`. Security headers and caching are in `public/_headers`. The Content Security Policy allows no scripts, so adding one means changing the policy first.

## Resume PDF

The PDF linked from `/resume/` is exported by hand from the print stylesheet. Re-export it whenever `src/content/resume/resume.yaml` changes.

## Personal details

This repository is public. The resume data has no phone number or street address, and the schema rejects fields it doesn't list. Keep both out of the repo.

## Versions

Dependencies are pinned to exact versions, and `.npmrc` sets `save-exact` so new ones are too. Upgrade on purpose, one at a time. Node is set in `.node-version` and pnpm in `packageManager`. TypeScript stays on 6.x until `astro check` supports 7. Try new Node versions on a branch first, since Cloudflare's build image can lag behind a release. Dependabot opens grouped update pull requests weekly.

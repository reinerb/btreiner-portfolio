# btreiner.com

Source for [btreiner.com](https://btreiner.com). Built with Astro as a static site, with plain CSS. Content is Markdown, MDX, and YAML in `src/content/`.

## Commands

- `pnpm dev` starts the dev server.
- `pnpm build` builds the site to `dist/`.
- `pnpm preview` serves the build.
- `pnpm astro check` type-checks components and content.

## Resume PDF

The PDF linked from `/resume/` is exported by hand from the print stylesheet. Re-export it whenever `src/content/resume/resume.yaml` changes.

## Personal details

This repository is public. The resume data has no phone number or street address, and the schema rejects fields it doesn't list. Keep both out of the repo.

## Versions

Dependencies are pinned to exact versions (`.npmrc`). Upgrade on purpose, one at a time.

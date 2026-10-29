import { readFileSync } from 'node:fs';

const sitemap = readFileSync(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');

export const pages = [...sitemap.matchAll(/<loc>https:\/\/btreiner\.com([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((path): path is string => Boolean(path));

if (pages.length === 0) {
  throw new Error('No pages found in dist/sitemap-0.xml. Run `pnpm build` first.');
}

export const notFoundPath = '/this-page-does-not-exist/';

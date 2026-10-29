const { readFileSync } = require('node:fs');

const port = 8788;
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/btreiner\.com([^<]+)<\/loc>/g)].map(
  (match) => `http://127.0.0.1:${port}${match[1]}`,
);

const median = { aggregationMethod: 'median-run' };

module.exports = {
  ci: {
    collect: {
      startServerCommand: `pnpm exec wrangler dev --port ${port} --ip 127.0.0.1`,
      startServerReadyPattern: 'Ready on',
      url: urls,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 1, ...median }],
        'categories:seo': ['error', { minScore: 1, ...median }],
        'categories:best-practices': ['error', { minScore: 0.95, ...median }],
        'categories:performance': ['error', { minScore: 0.9, ...median }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.01, ...median }],
      },
    },
    upload: { target: 'filesystem', outputDir: 'lighthouse-report' },
  },
};

import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { notFoundPath, pages } from './pages';

const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    for (const path of [...pages, notFoundPath]) {
      test(`no accessibility violations on ${path}`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
        const summary = violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`,
        );
        expect(summary).toEqual([]);
      });
    }
  });
}

import { expect, test } from '@playwright/test';
import { notFoundPath, pages } from './pages';

const origin = 'https://btreiner.com';

test.describe('server behavior', () => {
  test.skip(({ isMobile }) => isMobile, 'The same at every screen size');

  for (const path of ['/work', '/work/']) {
    test(`${path} redirects to the work section`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(302);
      expect(response.headers()['location']).toMatch(/\/#work$/);
    });
  }

  const oldUrls: [from: string, status: number, to: string][] = [
    ['/about', 301, '/about/'],
    ['/contact', 301, '/#contact'],
    ['/contact/', 301, '/#contact'],
    ['/portfolio', 301, '/work/'],
    ['/portfolio/bif-sms', 301, '/work/ferry-alerts/'],
    ['/portfolio/bif-sms/', 301, '/work/ferry-alerts/'],
    ['/portfolio/block-island-ferry', 301, '/work/ferry-rebuild/'],
    ['/portfolio/block-island-ferry/', 301, '/work/ferry-rebuild/'],
    ['/portfolio/theme-boilerplate', 301, '/#smaller-projects'],
    ['/portfolio/theme-boilerplate/', 301, '/#smaller-projects'],
    ['/portfolio/aa-window-cleaning', 301, '/work/'],
    ['/portfolio/premeer-real-estate', 301, '/work/'],
    ['/portfolio/oshnn', 301, '/work/'],
    ['/portfolio/a-page-that-never-existed', 301, '/work/'],
  ];

  for (const [from, status, to] of oldUrls) {
    test(`old URL ${from} redirects to ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(status);
      const location = new URL(response.headers()['location'] ?? '', 'http://localhost');
      expect(location.pathname + location.hash).toBe(to);
    });
  }

  test('pages without a trailing slash redirect to it', async ({ request }) => {
    const response = await request.get('/about', { maxRedirects: 0 });
    expect([301, 307, 308]).toContain(response.status());
    expect(response.headers()['location']).toMatch(/\/about\/$/);
  });

  test('unknown pages get the custom 404 with a 404 status', async ({ request }) => {
    const response = await request.get(notFoundPath);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('Page not found');
  });

  for (const path of [...pages, notFoundPath]) {
    test(`security headers on ${path}`, async ({ request }) => {
      const headers = (await request.get(path)).headers();
      expect(headers['content-security-policy']).toContain("script-src 'none'");
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['strict-transport-security']).toMatch(/^max-age=\d+/);
      expect(headers['speculation-rules']).toBe('"/speculationrules.json"');
    });
  }

  test('hashed assets are cached for a year', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const asset = html.match(/\/_astro\/[^"']+\.css/)?.[0];
    expect(asset).toBeDefined();
    const response = await request.get(asset ?? '');
    expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  test('speculation rules are served with their content type', async ({ request }) => {
    const response = await request.get('/speculationrules.json');
    expect(response.headers()['content-type']).toBe('application/speculationrules+json');
  });

  for (const path of ['/robots.txt', '/sitemap-index.xml', '/og-image.png', '/favicon.svg']) {
    test(`${path} is served`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(200);
    });
  }

  test('the email address is never plain text in the HTML', async ({ request }) => {
    for (const path of pages) {
      expect(await (await request.get(path)).text()).not.toContain('hello@btreiner.com');
    }
  });
});

test.describe('page content', () => {
  for (const path of pages) {
    test(`metadata on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(/Benjamin Reiner/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin + path);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        `${origin}/og-image.png`,
      );
      await expect(page.locator('h1')).toHaveCount(1);
    });

    test(`no sideways scrolling on ${path} at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('the email links decode to the address', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a[href="mailto:hello@btreiner.com"]');
    await expect(links).toHaveCount(2);
    await expect(page.locator('#contact a[href^="mailto:"]')).toHaveText('hello@btreiner.com');
  });

  test('the home page has Person structured data without an email', async ({ page }) => {
    await page.goto('/');
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(json ?? '{}') as Record<string, unknown>;
    expect(data['@type']).toBe('Person');
    expect(json).not.toContain('@btreiner.com');
  });
});

test.describe('keyboard and motion', () => {
  test.skip(({ isMobile }) => isMobile, 'Keyboard and motion checks run on desktop');

  test('the skip link appears on focus and moves focus to the content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip')).toBeFocused();
    await expect(page.locator('.skip')).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`page transitions with reduced motion: ${reducedMotion}`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.goto(new URL('/', test.info().project.use.baseURL).href);
      const transitionsOn = await page.evaluate(() => {
        const active = (rules: CSSRuleList): boolean =>
          [...rules].some((rule) => {
            if (rule instanceof CSSMediaRule) {
              return matchMedia(rule.conditionText).matches && active(rule.cssRules);
            }
            if (rule instanceof CSSGroupingRule) return active(rule.cssRules);
            return (
              rule.constructor.name === 'CSSViewTransitionRule' &&
              'navigation' in rule &&
              rule.navigation === 'auto'
            );
          });
        return [...document.styleSheets].some((sheet) => active(sheet.cssRules));
      });
      expect(transitionsOn).toBe(reducedMotion === 'no-preference');
      await context.close();
    });
  }

  test('the contours turn off when more contrast is requested', async ({ browser }) => {
    const context = await browser.newContext({ contrast: 'more' });
    const page = await context.newPage();
    await page.goto(new URL('/', test.info().project.use.baseURL).href);
    const display = await page.evaluate(() => getComputedStyle(document.body, '::before').display);
    expect(display).toBe('none');
    await context.close();
  });
});

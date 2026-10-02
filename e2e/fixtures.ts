import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';

/**
 * `test` with the Google Fonts CDN stubbed out. Fonts are a progressive enhancement (system
 * fonts are the fallback), and a flaky network or a TLS-inspecting proxy must not turn into
 * console errors that hide real ones.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) =>
      route.fulfill({
        status: 200,
        contentType: route.request().url().includes('googleapis') ? 'text/css' : 'font/woff2',
        body: '',
      }),
    );
    await use(page);
  },
});

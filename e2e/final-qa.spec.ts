import { expect, test } from './fixtures';
import {
  brokenImages,
  collectErrors,
  horizontalOverflow,
  ROUTES,
  stubExternalHosts,
  VIEWPORTS,
} from './support';

/**
 * Final sweep: every route, both languages, every target width. A route must render one h1,
 * have no horizontal overflow, no broken images and no console errors or uncaught exceptions.
 */
for (const lang of ['bn', 'en'] as const) {
  for (const width of VIEWPORTS) {
    test(`all routes at ${width}px in ${lang}: no overflow, broken images or console errors`, async ({
      page,
    }) => {
      test.setTimeout(300_000);
      await stubExternalHosts(page);
      const errors = collectErrors(page);
      const failed: string[] = [];
      page.on('response', (r) => {
        if (r.status() >= 400 && !r.url().endsWith('/this-page-does-not-exist')) {
          failed.push(`${r.status()} ${r.url()}`);
        }
      });
      await page.setViewportSize({ width, height: 900 });
      const problems: string[] = [];
      for (const route of ROUTES) {
        const path = `/${lang}${route}`;
        const before = errors.length;
        await page.goto(path);
        await page.locator('main').waitFor();
        if (route === '/this-page-does-not-exist') {
          // The browser logs the 404 document itself; any other error stays in the list.
          const own = errors.splice(before).filter((e) => !/status of 404/.test(e));
          errors.push(...own);
        }
        const overflow = await horizontalOverflow(page);
        if (overflow > 0) problems.push(`${path}: horizontal overflow ${overflow}px`);
        const broken = await brokenImages(page);
        if (broken.length) problems.push(`${path}: broken images ${broken.join(', ')}`);
        const h1 = await page.locator('h1').count();
        if (h1 !== 1) problems.push(`${path}: ${h1} h1 elements`);
      }
      expect(problems).toEqual([]);
      expect(failed).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

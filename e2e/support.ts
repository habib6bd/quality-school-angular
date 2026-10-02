import type { Page } from './fixtures';

/** 1×1 transparent PNG, used to stand in for remote images. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/**
 * The sandbox and CI have no access to YouTube or Google Maps. Serve small stand-ins so tests
 * are deterministic and any real console error stays visible. Returns the requested URLs.
 */
export async function stubExternalHosts(page: Page): Promise<string[]> {
  const requested: string[] = [];
  await page.route(/https:\/\/(i\.ytimg\.com|img\.youtube\.com)\//, (route) => {
    requested.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
  });
  await page.route(
    /https:\/\/(www\.youtube-nocookie\.com|maps\.google\.com|www\.google\.com)\//,
    (route) => {
      requested.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' });
    },
  );
  return requested;
}

/** Collects console errors and uncaught exceptions for the rest of the test. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

export const VIEWPORTS = [320, 375, 425, 768, 1024, 1280, 1440] as const;

export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/** Images that finished loading with no pixels: broken images. */
export async function brokenImages(page: Page): Promise<string[]> {
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .map((img) => {
          // Off-screen lazy images never start loading on their own; load them so they can be checked.
          img.loading = 'eager';
          return img;
        })
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }),
        ),
    ),
  );
  return page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  );
}

/** Every route a visitor can reach, (language prefix left out); includes detail pages and the 404 page. */
export const ROUTES = [
  '',
  '/about',
  '/about/history',
  '/about/mission-vision',
  '/about/philosophy',
  '/about/messages',
  '/about/facilities',
  '/academics',
  '/academics/programs',
  '/academics/programs/nine',
  '/academics/calendar?month=2026-10',
  '/results',
  '/resources',
  '/admission',
  '/admission/apply',
  '/faq',
  '/teachers',
  '/teachers/md-abdullah-al-mizan',
  '/notices',
  '/notices/admission-2026',
  '/news',
  '/events',
  '/gallery',
  '/videos',
  '/achievements',
  '/contact',
  '/search?q=admission',
  '/this-page-does-not-exist',
];

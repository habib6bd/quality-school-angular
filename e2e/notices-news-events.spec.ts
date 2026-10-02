import { expect, test } from './fixtures';
import { brokenImages, collectErrors, horizontalOverflow, VIEWPORTS } from './support';

test.describe('notices', () => {
  test('notice board lists the real admission notice with filters and counts', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/notices');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notices');
    await expect(page.locator('app-notice-card')).toHaveCount(1);
    await expect(page.getByText('Showing 1 of 1 notices')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Filter by category' });
    await expect(nav.getByRole('link')).toHaveCount(6);
    await expect(nav.getByRole('link', { name: /^All/ })).toHaveAttribute('aria-current', 'true');
    expect(errors).toEqual([]);
  });

  test('category filter updates URL and list; an empty category explains itself', async ({
    page,
  }) => {
    await page.goto('/en/notices');
    const nav = page.getByRole('navigation', { name: 'Filter by category' });
    await nav.getByRole('link', { name: /^Exam/ }).click();
    await expect(page).toHaveURL(/\/en\/notices\?category=exam$/);
    await expect(page.locator('app-notice-card')).toHaveCount(0);
    await expect(page.getByText('No notices in this category')).toBeVisible();
    await expect(nav.getByRole('link', { name: /^Exam/ })).toHaveAttribute('aria-current', 'true');

    await page.getByRole('link', { name: 'View all notices' }).click();
    await expect(page).toHaveURL(/\/en\/notices$/);
    await nav.getByRole('link', { name: /^Admission/ }).click();
    await expect(page.locator('app-notice-card')).toHaveCount(1);
  });

  test('filtered and paged URLs are rendered on the server; bad pages are clamped', async ({
    request,
  }) => {
    const filtered = await (await request.get('/en/notices?category=exam')).text();
    expect(filtered).not.toContain('<app-notice-card');
    expect(filtered).toContain('No notices in this category');
    const clamped = await request.get('/en/notices?page=99');
    expect(clamped.status()).toBe(200);
    expect(await clamped.text()).toContain('<app-notice-card');
  });

  test('notice page shows the attachment with safe open and download links', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/notices');
    await page.getByRole('link', { name: /Admission is open for Play to Class Ten/ }).click();
    await expect(page).toHaveURL(/\/en\/notices\/admission-2026$/);
    await expect(page).toHaveTitle(/^Admission is open for Play to Class Ten .* \| Banasree/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admission is open');
    await expect(page.getByText('19 November 2025')).toBeVisible();
    expect(await brokenImages(page)).toEqual([]);

    const open = page.getByRole('link', { name: /Open in a new tab/ });
    await expect(open).toHaveAttribute('href', 'images/bqes/notices/admission-2026.webp');
    await expect(open).toHaveAttribute('target', '_blank');
    await expect(open).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(page.getByRole('link', { name: 'Download' })).toHaveAttribute('download', '');

    const response = await page.request.get('/images/bqes/notices/admission-2026.webp');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');

    await page.getByRole('button', { name: /View larger image/ }).click();
    await expect(page.getByRole('dialog').getByRole('img')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'All notices' }).click();
    await expect(page).toHaveURL(/\/en\/notices$/);
    expect(errors).toEqual([]);
  });

  test('notice page translates and unknown notices are real 404s', async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/bn/notices/admission-2026');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ভর্তি চলছে');
    await page.getByRole('link', { name: 'English' }).first().click();
    await expect(page).toHaveURL(/\/en\/notices\/admission-2026$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admission is open');
    expect((await request.get('/bn/notices/nope')).status()).toBe(404);
    expect((await request.get('/en/notices/nope')).status()).toBe(404);
  });

  test('homepage notice card opens the notice page', async ({ page }) => {
    await page.goto('/en');
    await page
      .getByRole('region', { name: 'Latest notices' })
      .getByRole('link', { name: /Admission is open/ })
      .click();
    await expect(page).toHaveURL(/\/en\/notices\/admission-2026$/);
  });
});

test.describe('news and events', () => {
  for (const lang of ['bn', 'en'] as const) {
    test(`news and events show honest empty states in ${lang}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/${lang}/news`);
      await expect(page.locator('app-news-card')).toHaveCount(0);
      await expect(
        page.getByText(lang === 'en' ? 'No news published yet' : 'এখনো কোনো সংবাদ প্রকাশিত হয়নি'),
      ).toBeVisible();
      await page.goto(`/${lang}/events`);
      await expect(page.locator('app-event-card')).toHaveCount(0);
      await expect(
        page.getByText(lang === 'en' ? 'No upcoming events' : 'কোনো আসন্ন ইভেন্ট নেই', {
          exact: true,
        }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('events switch between upcoming and past, kept in the URL', async ({ page }) => {
    await page.goto('/en/events');
    const nav = page.getByRole('navigation', { name: 'Type of events' });
    await expect(nav.getByRole('link', { name: 'Upcoming' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await nav.getByRole('link', { name: 'Past' }).click();
    await expect(page).toHaveURL(/\/en\/events\?view=past$/);
    await expect(page.getByText('No past events')).toBeVisible();
    await nav.getByRole('link', { name: 'Upcoming' }).click();
    await expect(page).toHaveURL(/\/en\/events$/);
  });

  test('detail routes exist and return 404 for unknown items (no fake content)', async ({
    request,
  }) => {
    for (const path of ['/en/news/anything', '/bn/events/anything']) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });

  test('navigation menu leads to news and events', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByRole('button', { name: 'Campus Life' }).click();
    await nav.getByRole('link', { name: 'News' }).click();
    await expect(page).toHaveURL(/\/en\/news$/);
  });
});

for (const width of VIEWPORTS) {
  test(`notice, news and event pages fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/bn/notices',
      '/en/notices?category=exam',
      '/bn/notices/admission-2026',
      '/en/news',
      '/bn/events?view=past',
    ]) {
      await page.goto(path);
      expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

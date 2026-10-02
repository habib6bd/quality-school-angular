import { expect, test } from './fixtures';
import { brokenImages, collectErrors, horizontalOverflow } from './support';

test.describe('teachers directory', () => {
  test('shows every published person with an avatar, name and designation (en)', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto('/en/teachers');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Teachers');
    await expect(page.locator('app-teacher-card')).toHaveCount(28);
    await expect(page.getByText('Showing 28 of 28')).toBeVisible();
    const first = page.locator('app-teacher-card').first();
    await expect(first).toContainText('Sk. Md. Abdullah Al Mizan');
    await expect(first).toContainText('Principal');
    await expect(first.locator('app-avatar')).toHaveText('S');
    expect(await brokenImages(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('Bangla page shows English names with a Bangla UI', async ({ page }) => {
    await page.goto('/bn/teachers');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('শিক্ষকমণ্ডলী');
    await expect(page.locator('app-teacher-card h3').first()).toHaveAttribute('lang', 'en');
    await expect(page.getByText('২৮ জনের মধ্যে ২৮ জন দেখানো হচ্ছে')).toBeVisible();
  });

  test('designation filter updates the list, the URL and the active chip', async ({ page }) => {
    await page.goto('/en/teachers');
    const nav = page.getByRole('navigation', { name: 'Filter by designation' });
    await nav.getByRole('link', { name: /^Staff/ }).click();
    await expect(page).toHaveURL(/\/en\/teachers\?designation=staff$/);
    await expect(page.locator('app-teacher-card')).toHaveCount(4);
    await expect(nav.getByRole('link', { name: /^Staff/ })).toHaveAttribute('aria-current', 'true');
    await expect(page.getByText('Showing 4 of 28')).toBeVisible();

    await nav.getByRole('link', { name: /^Principal/ }).click();
    await expect(page.locator('app-teacher-card')).toHaveCount(1);
    await nav.getByRole('link', { name: /^Everyone/ }).click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
    await expect(page.locator('app-teacher-card')).toHaveCount(28);
  });

  test('a filtered URL is rendered on the server (no JavaScript needed)', async ({ request }) => {
    const html = await (await request.get('/en/teachers?designation=staff')).text();
    expect(html.match(/<app-teacher-card/g)).toHaveLength(4);
    expect(html).toContain('Abu Sufian Bappy');
    expect(html).not.toContain('Salma Alam Sonia');
  });

  test('name search filters as you type and combines with the designation', async ({ page }) => {
    await page.goto('/en/teachers');
    const search = page.getByRole('searchbox', { name: 'Search by name' });
    await search.fill('habibur');
    await expect(page.locator('app-teacher-card')).toHaveCount(2);
    await expect(page).toHaveURL(/q=habibur/);
    await page.getByRole('link', { name: /^Staff/ }).click();
    await expect(page).toHaveURL(/designation=staff/);
    await expect(page).toHaveURL(/q=habibur/);
    await expect(page.getByText('No one found')).toBeVisible();
  });

  test('an empty result explains itself and clearing filters restores the list', async ({
    page,
  }) => {
    await page.goto('/en/teachers?q=zzzz');
    await expect(page.locator('app-teacher-card')).toHaveCount(0);
    await expect(page.getByText('No one found')).toBeVisible();
    await page.getByRole('link', { name: 'Clear filters' }).click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
    await expect(page.locator('app-teacher-card')).toHaveCount(28);
    await expect(page.getByRole('searchbox', { name: 'Search by name' })).toHaveValue('');
  });

  test('language switch keeps the filter', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/bn/teachers?designation=teacher');
    await expect(page.locator('app-teacher-card')).toHaveCount(23);
    await page.getByRole('link', { name: 'English' }).first().click();
    await expect(page).toHaveURL(/\/en\/teachers\?designation=teacher$/);
    await expect(page.locator('app-teacher-card')).toHaveCount(23);
  });

  test('a card opens the person page, which links back and has its own title', async ({ page }) => {
    await page.goto('/en/teachers');
    await page.getByRole('link', { name: 'Salma Alam Sonia' }).click();
    await expect(page).toHaveURL(/\/en\/teachers\/salma-alam-sonia$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Salma Alam Sonia');
    await expect(page).toHaveTitle('Salma Alam Sonia | Banasree Quality Education School');
    await expect(page.getByText('Teacher', { exact: true }).first()).toBeVisible();
    await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]').first()).toHaveCount(1); // footer only
    await expect(page.locator('main a[href^="tel:"], main a[href^="mailto:"]')).toHaveCount(0);
    await page.getByRole('link', { name: 'All teachers and staff' }).click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
  });

  test('every person page exists and an unknown one is a 404', async ({ request }) => {
    for (const slug of ['md-abdullah-al-mizan', 'abu-sufian-bappy', 'habibur-rahman-2']) {
      expect((await request.get(`/bn/teachers/${slug}`)).status(), slug).toBe(200);
    }
    expect((await request.get('/en/teachers/nobody')).status()).toBe(404);
  });

  test('the homepage staff preview links to the person pages', async ({ page }) => {
    await page.goto('/en');
    await page
      .getByRole('region', { name: 'Teachers' })
      .getByRole('link', { name: 'Sk. Md. Abdullah Al Mizan' })
      .click();
    await expect(page).toHaveURL(/\/en\/teachers\/md-abdullah-al-mizan$/);
  });

  for (const width of [320, 375, 425, 768, 1024, 1440]) {
    test(`directory and a profile fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [
        '/bn/teachers',
        '/en/teachers?designation=teacher',
        '/en/teachers/nasrin-akter',
      ]) {
        await page.goto(path);
        expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('filters and cards are usable with the keyboard', async ({ page }) => {
    await page.goto('/en/teachers');
    const staff = page.getByRole('link', { name: /^Staff/ });
    await staff.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('app-teacher-card')).toHaveCount(4);
    await page.getByRole('link', { name: 'Abu Sufian Bappy' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/teachers\/abu-sufian-bappy$/);
  });
});

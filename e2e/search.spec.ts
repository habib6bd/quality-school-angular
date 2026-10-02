import { expect, test } from './fixtures';
import { collectErrors, horizontalOverflow, VIEWPORTS } from './support';

test.describe('site search', () => {
  test('opens ready to type, with suggestions and no results', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/search');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Search');
    await expect(page.getByRole('searchbox', { name: 'Search the website' })).toBeFocused();
    await expect(page.getByRole('heading', { level: 2, name: 'Start here' })).toBeVisible();
    await expect(page.locator('a[data-result]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('typing finds results, updates the URL and groups them by kind', async ({ page }) => {
    await page.goto('/en/search');
    const box = page.getByRole('searchbox', { name: 'Search the website' });
    await box.fill('admission');
    await expect(page).toHaveURL(/\/en\/search\?q=admission$/);
    await expect(
      page.getByRole('status').filter({ hasText: 'results for “admission”' }),
    ).toBeVisible();
    await expect(page.locator('a[data-result]').first()).toContainText('Admission');
    await expect(page.locator('a[data-result] mark').first()).toBeVisible();

    const kinds = page.getByRole('navigation', { name: 'Type of result' });
    await expect(kinds.getByRole('link', { name: /^Notices 1/ })).toBeVisible();
    await expect(kinds.getByRole('link', { name: /^News 0/ })).toBeVisible();
    await kinds.getByRole('link', { name: /^Notices/ }).click();
    await expect(page).toHaveURL(/kind=notice/);
    await expect(page).toHaveURL(/q=admission/);
    await expect(page.locator('a[data-result]')).toHaveCount(1);
    await page.locator('a[data-result]').click();
    await expect(page).toHaveURL(/\/en\/notices\/admission-2026$/);
  });

  test('finds teachers, class pages and pages in both languages', async ({ page }) => {
    await page.goto('/en/search?q=sonia');
    await expect(page.locator('a[data-result]')).toHaveText('Salma Alam Sonia');
    await page.locator('a[data-result]').click();
    await expect(page).toHaveURL(/\/en\/teachers\/salma-alam-sonia$/);

    await page.goto('/en/search?q=class%20nine');
    await expect(page.locator('a[data-result]').first()).toContainText('Class Nine');

    await page.goto('/bn/search?q=ভর্তি');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('অনুসন্ধান');
    await expect(page.locator('a[data-result]').first()).toBeVisible();
    await expect(page.getByRole('status')).toContainText('টি ফলাফল');

    // Bangla words find English-page results too (and the reverse).
    await page.goto('/en/search?q=ভর্তি');
    await expect(page.locator('a[data-result]').first()).toBeVisible();
    // Bangla and ASCII digits are interchangeable.
    await page.goto('/en/search?q=২০২৬');
    await expect(page.locator('a[data-result]').first()).toBeVisible();
  });

  test('an unmatched query explains itself and offers contact; no HTML is injected', async ({
    page,
  }) => {
    await page.goto('/en/search?q=xyzzy');
    await expect(page.getByText('Nothing found for “xyzzy”')).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/en/contact',
    );

    await page.goto('/en/search?q=' + encodeURIComponent('<img src=x onerror=window.__xss=1>'));
    await expect(page.getByText(/Nothing found for/)).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
    ).toBeUndefined();
    await expect(page.locator('main img[src="x"]')).toHaveCount(0);
  });

  test('results paginate and bad page numbers are clamped', async ({ page }) => {
    await page.goto('/en/search?q=a');
    const count = await page.locator('a[data-result]').count();
    expect(count).toBe(10);
    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await expect(pagination).toBeVisible();
    await pagination.getByRole('button', { name: 'Page 2' }).click();
    await expect(page).toHaveURL(/page=2/);
    expect(await page.locator('a[data-result]').count()).toBeGreaterThan(0);
    await page.goto('/en/search?q=a&page=999');
    expect(await page.locator('a[data-result]').count()).toBeGreaterThan(0);
  });

  test('keyboard: arrows move between the field and the results; Enter opens a result', async ({
    page,
  }) => {
    await page.goto('/en/search');
    const box = page.getByRole('searchbox', { name: 'Search the website' });
    await box.fill('teacher');
    const links = page.locator('a[data-result]');
    await expect(links.first()).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(links.nth(0)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(box).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page).not.toHaveURL(/\/search/);
  });

  test('the clear button empties the search and the URL', async ({ page }) => {
    await page.goto('/en/search?q=admission');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page).toHaveURL(/\/en\/search$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Start here' })).toBeVisible();
  });

  test('the header search icon (desktop) and the menu entry (mobile) lead to search', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en/about');
    await page.getByRole('link', { name: 'Search' }).first().click();
    await expect(page).toHaveURL(/\/en\/search$/);

    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en/about');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Search' }).click();
    await expect(page).toHaveURL(/\/en\/search$/);
  });

  for (const width of VIEWPORTS) {
    test(`search fits at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/bn/search', '/en/search?q=admission', '/bn/search?q=ভর্তি&kind=page']) {
        await page.goto(path);
        expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test.describe('navigation polish', () => {
  test('after navigating to another page, focus moves to the main content', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await expect(page.locator('#main-content')).not.toBeFocused();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Teachers' })
      .click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('filter chips and the language switch do not steal focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en/teachers');
    const staff = page.getByRole('link', { name: /^Staff/ });
    await staff.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/designation=staff/);
    await expect(page.locator('#main-content')).not.toBeFocused();
    await page.getByRole('link', { name: 'বাংলা' }).first().click();
    await expect(page).toHaveURL(/\/bn\/teachers/);
    await expect(page.locator('#main-content')).not.toBeFocused();
  });

  test('list pages offer related pages', async ({ page }) => {
    for (const path of [
      '/en/teachers',
      '/en/notices',
      '/en/news',
      '/en/events',
      '/en/gallery',
      '/en/faq',
      '/en/contact',
    ]) {
      await page.goto(path);
      const related = page
        .getByRole('navigation')
        .filter({ has: page.getByRole('heading', { name: 'Related pages' }) });
      await expect(related.getByRole('link')).toHaveCount(3);
    }
  });
});

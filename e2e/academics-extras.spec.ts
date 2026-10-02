import { expect, test } from './fixtures';
import { collectErrors, horizontalOverflow, VIEWPORTS } from './support';

test.describe('academic calendar', () => {
  test('shows an accessible month grid, an honest placeholder and month navigation in the URL', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto('/en/academics/calendar?month=2026-10');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Academic Calendar');
    await expect(page.getByRole('heading', { level: 2, name: 'October 2026' })).toBeVisible();
    const table = page.getByRole('table', { name: 'October 2026' });
    await expect(table.getByRole('columnheader')).toHaveCount(7);
    await expect(table.locator('tbody tr')).toHaveCount(5);
    await expect(page.locator('main app-pending-note')).toBeVisible();
    await expect(page.getByText('No dates have been published for this month')).toBeVisible();

    await page.getByRole('link', { name: 'Next month' }).click();
    await expect(page).toHaveURL(/month=2026-11$/);
    await expect(page.getByRole('heading', { level: 2, name: 'November 2026' })).toBeVisible();
    await page.getByRole('link', { name: 'Previous month' }).click();
    await page.getByRole('link', { name: 'Previous month' }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'September 2026' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('defaults to the current month and ignores an invalid month parameter', async ({ page }) => {
    await page.goto('/en/academics/calendar?month=banana');
    const expected = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    }).format(new Date());
    await expect(page.getByRole('heading', { level: 2, name: expected })).toBeVisible();
    await expect(page.locator('td[aria-current="date"]')).toHaveCount(1);
  });

  test('Bangla calendar uses Bangla month names and digits', async ({ page }) => {
    await page.goto('/bn/academics/calendar?month=2026-10');
    await expect(page.getByRole('heading', { level: 2, name: 'অক্টোবর ২০২৬' })).toBeVisible();
    await expect(page.locator('tbody td').first()).toHaveText('২৭');
  });

  test('the month is rendered on the server', async ({ request }) => {
    const html = await (await request.get('/en/academics/calendar?month=2027-03')).text();
    expect(html).toContain('March 2027');
  });

  for (const width of [320, 375, 768]) {
    test(`calendar grid fits at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/bn/academics/calendar?month=2026-10');
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
      const box = await page.getByRole('table').boundingBox();
      expect(box!.width).toBeLessThanOrEqual(width);
    });
  }
});

test.describe('results lookup', () => {
  test('is honest that results are not online and validates before searching', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/results');
    await expect(page.locator('main app-pending-note')).toContainText('not live yet');
    await expect(page.getByText('The list of exams will appear here')).toBeVisible();

    await page.getByRole('button', { name: 'Find result' }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Please fix the following errors' });
    await expect(summary).toBeFocused();
    await expect(page.getByLabel('Roll number')).toHaveAttribute('aria-invalid', 'true');

    await page.locator('#results-classSlug').selectOption('five');
    await page.getByLabel('Roll number').fill('abc');
    await page.getByRole('button', { name: 'Find result' }).click();
    await expect(page.locator('#results-roll-error')).toContainText('digits only');

    await page.getByLabel('Roll number').fill('১২');
    await page.getByRole('button', { name: 'Find result' }).click();
    await expect(page.getByText('Online results are not available yet')).toBeVisible();
    await expect(page.getByRole('status').getByRole('link', { name: 'Contact' })).toHaveAttribute(
      'href',
      '/en/contact',
    );
    expect(errors).toEqual([]);
  });

  test('sends nothing, stores nothing and shows no private data', async ({ page }) => {
    const requests: string[] = [];
    const logs: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (r.method() !== 'GET' || (url.hostname !== 'localhost' && !/fonts\./.test(url.hostname)))
        requests.push(`${r.method()} ${r.url()}`);
    });
    page.on('console', (m) => logs.push(m.text()));
    await page.goto('/bn/results');
    const before = requests.length;
    await page.locator('#results-classSlug').selectOption('ten');
    await page.locator('#results-roll').fill('987654');
    await page.getByRole('button', { name: 'ফলাফল খুঁজুন' }).click();
    await expect(page.getByText('অনলাইন ফলাফল এখনো পাওয়া যায় না')).toBeVisible();
    expect(requests.slice(before)).toEqual([]);
    expect(logs.join('\n')).not.toContain('987654');
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/GPA|জিপিএ|marks|নম্বর পেয়েছ/i);
  });
});

test.describe('resources', () => {
  test('shows every resource type as a placeholder, with filters ready', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/resources');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resources & Downloads');
    const section = page.locator('#pending-types').locator('..');
    await expect(section.locator('ul li')).toHaveCount(6);
    await expect(section.locator('app-pending-note')).toBeVisible();
    await expect(page.locator('a[download]')).toHaveCount(0);
    const filters = page.getByRole('search', { name: 'Resource filters' });
    await expect(filters.getByLabel('Class')).toBeEnabled();
    for (const label of ['Subject', 'Year', 'Exam']) {
      await expect(filters.getByLabel(label)).toBeDisabled();
    }
    expect(errors).toEqual([]);
  });

  test('type and class filters live in the URL and explain empty matches', async ({ page }) => {
    await page.goto('/en/resources');
    const nav = page.getByRole('navigation', { name: 'Browse by type' });
    await nav.getByRole('link', { name: 'Syllabus' }).click();
    await expect(page).toHaveURL(/\/en\/resources\?type=syllabus$/);
    await expect(nav.getByRole('link', { name: 'Syllabus' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.getByRole('search').getByLabel('Class').selectOption('five');
    await expect(page).toHaveURL(/type=syllabus/);
    await expect(page).toHaveURL(/classSlug=five/);
    await expect(page.getByRole('search').getByLabel('Class')).toHaveValue('five');
    await nav.getByRole('link', { name: 'All', exact: true }).click();
    await expect(page).not.toHaveURL(/type=/);
  });

  test('Bangla resources page is translated', async ({ page }) => {
    await page.goto('/bn/resources');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('রিসোর্স ও ডাউনলোড');
    await expect(page.getByRole('navigation', { name: 'ধরন অনুযায়ী দেখুন' })).toBeVisible();
  });
});

for (const width of VIEWPORTS) {
  test(`results, resources and calendar fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/bn/results',
      '/en/resources?type=form',
      '/bn/academics/calendar',
      '/en/academics/calendar?month=2026-02',
    ]) {
      await page.goto(path);
      expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

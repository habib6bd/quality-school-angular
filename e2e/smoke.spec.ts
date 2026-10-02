import { expect, test } from '@playwright/test';

test.describe('foundation smoke', () => {
  test('root redirects to Bangla and renders with Tailwind styles', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveURL(/\/bn$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('বনশ্রী কোয়ালিটি এডুকেশন স্কুল');
    // primary-700 token => rgb(0, 107, 60)
    await expect(heading).toHaveCSS('color', 'rgb(0, 107, 60)');
    expect(errors).toEqual([]);
  });

  test('client-side navigation switches to English', async ({ page }) => {
    await page.goto('/bn');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('unknown URL returns 404 with the not-found page', async ({ page }) => {
    const response = await page.goto('/bn/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('404')).toBeVisible();
  });

  for (const width of [320, 768, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/bn');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

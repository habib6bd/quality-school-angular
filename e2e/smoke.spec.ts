import { expect, test } from './fixtures';

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
    // Theme tokens are applied: white hero heading on the page's surface-muted background.
    await expect(heading).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 247, 244)');
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
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('পৃষ্ঠাটি পাওয়া যায়নি');
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

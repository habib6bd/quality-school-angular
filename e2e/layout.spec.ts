import { expect, Page, test } from './fixtures';

async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('layout & shared components', () => {
  test('skip link becomes visible on first Tab and targets main', async ({ page }) => {
    await page.goto('/bn');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'মূল বিষয়বস্তুতে যান' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await expect(skip).toHaveAttribute('href', '#main-content');
  });

  test('desktop dropdown opens with keyboard and closes with Escape', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const about = nav.getByRole('button', { name: 'About' });
    await about.focus();
    await page.keyboard.press('Enter');
    await expect(about).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: 'History' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(about).toHaveAttribute('aria-expanded', 'false');
    await expect(about).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('mobile drawer is a modal dialog: opens, traps background, closes with Escape', async ({
    page,
  }) => {
    const errors = await collectErrors(page);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/bn');
    const menuButton = page.getByRole('button', { name: 'মেনু খুলুন' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const dialog = page.getByRole('dialog', { name: 'মেনু' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'আমাদের সম্পর্কে' }).click();
    await expect(dialog.getByRole('link', { name: 'ইতিহাস' })).toBeVisible();

    // Background is inert: focus never lands on page content behind the dialog. (Native modal
    // dialogs may hand focus to the browser UI after the last control, leaving <body> active.)
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('Tab');
      const onBackground = await page.evaluate(() => {
        const el = document.activeElement;
        return !!el && el !== document.body && !el.closest('dialog');
      });
      expect(onBackground).toBe(false);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(menuButton).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('mobile drawer closes after navigating', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/en');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await dialog.getByRole('link', { name: 'Teachers' }).click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
    await expect(dialog).toBeHidden();
  });

  test('language switcher keeps the current page', async ({ page }) => {
    await page.goto('/bn/teachers?page=2');
    await page
      .getByRole('navigation', { name: 'ভাষা পরিবর্তন করুন' })
      .first()
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL(/\/en\/teachers\?page=2$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('link', { name: 'English' }).first()).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('announcement bar can be dismissed for the session', async ({ page }) => {
    await page.goto('/bn');
    const bar = page.getByRole('complementary', { name: 'ঘোষণা' });
    await expect(bar).toContainText('২০২৬ শিক্ষাবর্ষে ভর্তি চলছে');
    await bar.getByRole('button', { name: 'বার্তাটি লুকান' }).click();
    await expect(bar).toBeHidden();
    await page.reload();
    await expect(page.getByRole('complementary', { name: 'ঘোষণা' })).toBeHidden();
  });

  test('back-to-top appears after scrolling and returns to the top', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 600 });
    await page.goto('/bn');
    await page.evaluate(() => {
      document.body.style.minHeight = '4000px';
      window.scrollTo(0, 2000);
    });
    const button = page.getByRole('button', { name: 'উপরে ফিরে যান' });
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  for (const width of [320, 375, 425, 768, 1024, 1280, 1440]) {
    test(`header and footer fit without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const lang of ['bn', 'en']) {
        await page.goto(`/${lang}`);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${lang} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

import { expect, test } from './fixtures';
import {
  brokenImages,
  collectErrors,
  horizontalOverflow,
  stubExternalHosts,
  VIEWPORTS,
} from './support';

test.describe('photo gallery', () => {
  test('shows the real photos, filters by category and keeps the filter in the URL', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto('/en/gallery');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Photo Gallery');
    await expect(page.locator('app-gallery-grid img')).toHaveCount(7);
    expect(await brokenImages(page)).toEqual([]);

    const nav = page.getByRole('navigation', { name: 'Filter photos by category' });
    await nav.getByRole('link', { name: /^Annual Sports/ }).click();
    await expect(page).toHaveURL(/\/en\/gallery\?category=annual-sports$/);
    await expect(page.locator('app-gallery-grid img')).toHaveCount(2);
    await expect(nav.getByRole('link', { name: /^Annual Sports/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await nav.getByRole('link', { name: /^All photos/ }).click();
    await expect(page.locator('app-gallery-grid img')).toHaveCount(7);
    expect(errors).toEqual([]);
  });

  test('every photo has a description and fixed dimensions (no layout shift)', async ({ page }) => {
    await page.goto('/bn/gallery');
    const info = await page.locator('app-gallery-grid img').evaluateAll((imgs) =>
      imgs.map((img) => ({
        alt: img.getAttribute('alt') ?? '',
        w: img.getAttribute('width'),
        h: img.getAttribute('height'),
      })),
    );
    expect(info).toHaveLength(7);
    for (const item of info) {
      expect(item.alt.length).toBeGreaterThan(8);
      expect(Number(item.w)).toBeGreaterThan(0);
      expect(Number(item.h)).toBeGreaterThan(0);
    }
  });

  test('page load causes no meaningful layout shift', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[])
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/en/gallery');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.1);
  });

  test('mosaic leads with a feature card that follows the category and links to videos', async ({
    page,
  }) => {
    await page.goto('/en/gallery?category=annual-sports');
    const card = page.locator('app-gallery-grid li[data-feature]');
    await expect(card).toContainText('Annual Sports');
    await card.getByRole('link', { name: 'Watch our videos' }).click();
    await expect(page).toHaveURL(/\/en\/videos$/);
  });

  test('mosaic tiles fill whole rows on desktop', async ({ page }) => {
    // Without the scroll reveal, tiles below the fold sit where the grid puts them.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en/gallery');
    const { boxes, grid } = await page.locator('app-gallery-grid ul').evaluate((ul) => ({
      grid: ul.getBoundingClientRect().toJSON() as DOMRect,
      boxes: Array.from(ul.children, (li) => li.getBoundingClientRect().toJSON() as DOMRect),
    }));
    const area = boxes.reduce((sum, b) => sum + b.width * b.height, 0);
    // Tiles plus gaps cover the grid: no empty cells (gaps are under 15% of the area).
    expect(area / (grid.width * grid.height)).toBeGreaterThan(0.85);
    expect(Math.max(...boxes.map((b) => b.bottom))).toBeCloseTo(grid.bottom, 0);
  });

  test('lightbox: opens from a photo, moves with the keyboard, wraps, closes with Escape', async ({
    page,
  }) => {
    await page.goto('/en/gallery');
    const first = page.getByRole('button', { name: /View larger image/ }).first();
    await first.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Image 1 of 7')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('Image 2 of 7')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText('Image 7 of 7')).toBeVisible();
    await expect(dialog.getByRole('img')).toHaveAttribute('alt', /.+/);

    // The page behind the dialog is inert: tabbing never lands on it. (A native modal dialog may
    // hand focus to the browser UI after its last control, which leaves <body> active.)
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const onBackground = await page.evaluate(() => {
        const el = document.activeElement;
        return !!el && el !== document.body && !el.closest('dialog');
      });
      expect(onBackground).toBe(false);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });

  test('lightbox buttons and the close button work with the mouse', async ({ page }) => {
    await page.goto('/en/gallery?category=annual-sports');
    await page
      .getByRole('button', { name: /View larger image/ })
      .nth(1)
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Image 2 of 2')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next' }).click();
    await expect(dialog.getByText('Image 1 of 2')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
  });

  test('Bangla gallery uses Bangla labels', async ({ page }) => {
    await page.goto('/bn/gallery?category=school-events');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('ফটো গ্যালারি');
    await expect(page.locator('app-gallery-grid img')).toHaveCount(5);
    await expect(page.getByRole('navigation', { name: 'বিভাগ অনুযায়ী ছবি দেখুন' })).toBeVisible();
  });
});

test.describe('video gallery', () => {
  test('lists the real video; the player opens in a dialog and closes with focus restored', async ({
    page,
  }) => {
    const requested = await stubExternalHosts(page);
    const errors = collectErrors(page);
    await page.goto('/en/videos');
    const tile = page.getByRole('button', { name: /Study Tour - 2025/ });
    await expect(tile).toBeVisible();
    await tile.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Study Tour - 2025' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('iframe')).toHaveAttribute(
      'src',
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/aPdUbVyfpSU\?/,
    );
    await expect(dialog.locator('iframe')).toHaveAttribute('title', 'Study Tour - 2025');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(tile).toBeFocused();
    expect(requested.some((url) => url.includes('youtube-nocookie.com'))).toBe(true);
    expect(errors).toEqual([]);
  });

  test('the player is not loaded until requested', async ({ page }) => {
    const requested = await stubExternalHosts(page);
    await page.goto('/en/videos');
    await expect(page.getByRole('button', { name: /Study Tour - 2025/ })).toBeVisible();
    expect(requested.some((url) => url.includes('youtube-nocookie.com'))).toBe(false);
  });

  test('links to the video on YouTube and to the school channel, safely', async ({ page }) => {
    await stubExternalHosts(page);
    await page.goto('/en/videos');
    const watch = page.getByRole('link', { name: /Watch on YouTube/ });
    await expect(watch).toHaveAttribute('href', 'https://www.youtube.com/watch?v=aPdUbVyfpSU');
    await expect(watch).toHaveAttribute('target', '_blank');
    await expect(watch).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(page.getByRole('link', { name: /The school’s YouTube channel/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@bqes.',
    );
  });

  test('falls back to a plain tile when the thumbnail cannot load', async ({ page }) => {
    await page.route(/i\.ytimg\.com/, (route) => route.abort());
    await page.goto('/en/videos');
    const tile = page.getByRole('button', { name: /Study Tour - 2025/ });
    await expect(tile).toBeVisible();
    await expect(tile.locator('img')).toHaveCount(0);
  });
});

test.describe('achievements', () => {
  for (const lang of ['bn', 'en'] as const) {
    test(`shows marked placeholders for all three categories (${lang})`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/${lang}/achievements`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('main section[aria-labelledby^="ach-"]')).toHaveCount(3);
      await expect(page.locator('main app-pending-note')).toHaveCount(3);
      expect(errors).toEqual([]);
    });
  }

  test('does not present any invented award, rank or result', async ({ page }) => {
    await page.goto('/en/achievements');
    const text = (await page.locator('main').innerText()).toLowerCase();
    expect(text).not.toMatch(/\b(1st|first place|champion|gold medal|winner|trophy|gpa|rank)\b/);
  });
});

for (const width of VIEWPORTS) {
  test(`gallery, videos and achievements fit at ${width}px`, async ({ page }) => {
    await stubExternalHosts(page);
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/bn/gallery',
      '/en/gallery?category=annual-sports',
      '/bn/videos',
      '/en/achievements',
    ]) {
      await page.goto(path);
      expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

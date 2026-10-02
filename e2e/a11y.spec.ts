import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { stubExternalHosts } from './support';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/** Every route a visitor can reach, without query strings. */
const ROUTES = [
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

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.nodes
        .map((n) => n.target.join(' '))
        .slice(0, 4)
        .join(' | ')}`,
  );
  expect(summary, label).toEqual([]);
}

test.describe('accessibility audit (axe, WCAG 2.2 AA + best practice)', () => {
  for (const lang of ['bn', 'en'] as const) {
    for (const route of ROUTES) {
      test(`${lang}${route || '/'} has no violations`, async ({ page }) => {
        await stubExternalHosts(page);
        await page.goto(`/${lang}${route}`);
        await page.locator('main').waitFor();
        await audit(page, `${lang}${route}`);
      });
    }
  }

  test('home and forms have no violations on a phone-sized screen', async ({ page }) => {
    await stubExternalHosts(page);
    await page.setViewportSize({ width: 320, height: 700 });
    for (const path of ['/bn', '/en/admission/apply', '/bn/contact', '/en/gallery']) {
      await page.goto(path);
      await page.locator('main').waitFor();
      await audit(page, `${path} @320`);
    }
  });

  test('interactive states: mobile menu, lightbox, video dialog, accordion, errors', async ({
    page,
  }) => {
    await stubExternalHosts(page);
    await page.setViewportSize({ width: 375, height: 800 });

    await page.goto('/en');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await audit(page, 'mobile menu open');
    await page.keyboard.press('Escape');

    await page.goto('/en/gallery');
    await page
      .getByRole('button', { name: /View larger image/ })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await audit(page, 'lightbox open');
    await page.keyboard.press('Escape');

    await page.goto('/en/videos');
    await page.getByRole('button', { name: /Study Tour - 2025/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await audit(page, 'video dialog open');
    await page.keyboard.press('Escape');

    await page.goto('/en/faq');
    await page.locator('app-accordion button[aria-expanded]').first().click();
    await audit(page, 'accordion open');

    await page.goto('/en/admission/apply');
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Please fix' })).toBeVisible();
    await audit(page, 'application form with errors');

    await page.goto('/en/contact');
    await page.getByRole('button', { name: 'Send message (prototype)' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Please fix' })).toBeVisible();
    await audit(page, 'contact form with errors');

    await page.goto('/en/results');
    await page.getByRole('button', { name: 'Find result' }).click();
    await audit(page, 'results form with errors');
  });

  test('desktop navigation dropdown open has no violations', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'About' })
      .click();
    await audit(page, 'desktop dropdown open');
  });
  test('heading levels never skip a level and each page has one h1', async ({ page }) => {
    await stubExternalHosts(page);
    for (const route of ['', '/about', '/academics/programs', '/teachers', '/faq', '/contact']) {
      for (const lang of ['bn', 'en']) {
        await page.goto(`/${lang}${route}`);
        await page.locator('main').waitFor();
        const levels = await page
          .locator('main h1, main h2, main h3, main h4, main h5, main h6')
          .evaluateAll((els) => els.map((e) => Number(e.tagName.slice(1))));
        expect(
          levels.filter((l) => l === 1),
          `${lang}${route} h1 count`,
        ).toHaveLength(1);
        levels.forEach((level, i) => {
          if (i > 0) {
            expect(
              level - levels[i - 1],
              `${lang}${route} heading order ${levels}`,
            ).toBeLessThanOrEqual(1);
          }
        });
      }
    }
  });

  test('keyboard focus is visible on links, buttons and fields', async ({ page }) => {
    await stubExternalHosts(page);
    await page.goto('/en/contact');
    await page.locator('main').waitFor();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const ring = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        return { outline, shadow: cs.boxShadow !== 'none', tag: el.tagName };
      });
      expect(ring, `focus target after ${i + 1} tabs`).not.toBeNull();
      expect(ring?.outline || ring?.shadow, `visible focus indicator on ${ring?.tag}`).toBe(true);
    }
  });

  test('prefers-reduced-motion disables animations and transitions', async ({ page }) => {
    await stubExternalHosts(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await page.locator('main').waitFor();
    const offenders = await page.evaluate(() =>
      Array.from(document.querySelectorAll('body *'))
        .filter((el) => {
          const cs = getComputedStyle(el);
          const secs = (v: string) => Math.max(...v.split(',').map((x) => parseFloat(x) || 0));
          return secs(cs.animationDuration) > 0.01 || secs(cs.transitionDuration) > 0.01;
        })
        .map((el) => el.tagName + '.' + String(el.className).slice(0, 40))
        .slice(0, 5),
    );
    expect(offenders).toEqual([]);
  });
});

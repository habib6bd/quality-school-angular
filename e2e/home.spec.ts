import { expect, test } from './fixtures';
import {
  brokenImages,
  collectErrors,
  horizontalOverflow,
  stubExternalHosts,
  VIEWPORTS,
} from './support';

const HEADINGS = {
  bn: [
    'বিদ্যালয় পরিচিতি',
    'কেন বনশ্রী কোয়ালিটি এডুকেশন স্কুল?',
    'চেয়ারম্যান ও প্রধান শিক্ষকের বাণী',
    'শ্রেণি ও কার্যক্রম',
    'শিক্ষকমণ্ডলী',
    'ক্যাম্পাস ও সুযোগ-সুবিধা',
    'সর্বশেষ নোটিশ',
    'আসন্ন ইভেন্ট',
    'অর্জন',
    'ফটো গ্যালারি',
    'ভিডিও গ্যালারি',
    'অভিভাবকদের মতামত',
    'আপনার সন্তানের ভর্তির তথ্য জানুন',
    'সাধারণ জিজ্ঞাসা',
    'যোগাযোগ ও অবস্থান',
  ],
  en: [
    'About the School',
    'Why choose Banasree Quality Education School?',
    'Messages from the Chairman and Headmaster',
    'Classes & Programs',
    'Teachers',
    'Campus and facilities',
    'Latest notices',
    'Upcoming events',
    'Achievements',
    'Photo Gallery',
    'Video Gallery',
    'Guardian reviews',
    'Find out about admission for your child',
    'FAQ',
    'Contact and location',
  ],
} as const;

test.describe('homepage', () => {
  for (const lang of ['bn', 'en'] as const) {
    test(`renders every planned section in ${lang} without console errors`, async ({ page }) => {
      await stubExternalHosts(page);
      const errors = collectErrors(page);
      await page.goto(`/${lang}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      for (const name of HEADINGS[lang]) {
        await expect(page.getByRole('heading', { level: 2, name, exact: true })).toHaveCount(1);
      }
      expect(errors).toEqual([]);
    });

    test(`every internal link on the ${lang} homepage resolves`, async ({ page, request }) => {
      await page.goto(`/${lang}`);
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')!))]);
      expect(hrefs.length).toBeGreaterThan(20);
      for (const href of hrefs) {
        const response = await request.get(href);
        expect(response.status(), href).toBe(200);
      }
    });

    test(`${lang} homepage has no broken images`, async ({ page }) => {
      await stubExternalHosts(page);
      await page.goto(`/${lang}`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      expect(await brokenImages(page)).toEqual([]);
      const missingAlt = await page.locator('img:not([alt])').count();
      expect(missingAlt).toBe(0);
    });
  }

  for (const width of VIEWPORTS) {
    test(`no horizontal overflow at ${width}px (bn and en)`, async ({ page }) => {
      await stubExternalHosts(page);
      await page.setViewportSize({ width, height: 900 });
      for (const lang of ['bn', 'en']) {
        await page.goto(`/${lang}`);
        expect(await horizontalOverflow(page), `${lang} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('shows the real school contact details and map', async ({ page }) => {
    await stubExternalHosts(page);
    await page.goto('/en');
    const contact = page.getByRole('region', { name: 'Contact and location' });
    await expect(contact).toContainText('House K-278, Road 16');
    await expect(contact.getByRole('link', { name: '01678708862' })).toHaveAttribute(
      'href',
      'tel:01678708862',
    );
    await expect(contact.locator('iframe')).toHaveAttribute('title', /Google Maps/);
  });

  test('gallery lightbox opens from a photo, moves with arrow keys and closes with Escape', async ({
    page,
  }) => {
    await stubExternalHosts(page);
    await page.goto('/en');
    const gallery = page.getByRole('region', { name: 'Photo Gallery' });
    const first = gallery.getByRole('button', { name: /View larger image/ }).first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Image 1 of 6')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('Image 2 of 6')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });

  test('video opens in an accessible dialog with the privacy-enhanced embed', async ({ page }) => {
    const requested = await stubExternalHosts(page);
    await page.goto('/en');
    const videos = page.getByRole('region', { name: 'Video Gallery' });
    const card = videos.getByRole('button', { name: /Study Tour - 2025/ });
    await card.scrollIntoViewIfNeeded();
    await card.click();
    const dialog = page.getByRole('dialog', { name: 'Study Tour - 2025' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('iframe')).toHaveAttribute(
      'src',
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/aPdUbVyfpSU/,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(card).toBeFocused();
    expect(requested.some((url) => url.includes('youtube-nocookie.com'))).toBe(true);
  });

  test('video thumbnail falls back to a plain tile when YouTube is unreachable', async ({
    page,
  }) => {
    await page.route(/i\.ytimg\.com/, (route) => route.abort());
    await page.goto('/en');
    const card = page.getByRole('button', { name: /Study Tour - 2025/ });
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('img')).toHaveCount(0);
    await expect(card).toBeVisible();
  });

  test('FAQ preview accordion toggles with the keyboard', async ({ page }) => {
    await page.goto('/en');
    const faq = page.getByRole('region', { name: 'FAQ' });
    const first = faq.getByRole('button').first();
    await first.scrollIntoViewIfNeeded();
    await first.focus();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
  });

  test('honest empty states for unpublished content', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByText('No upcoming events', { exact: true })).toBeVisible();
    await expect(page.getByText('No reviews published yet', { exact: true })).toBeVisible();
    await expect(page.getByText('To be confirmed by the school').first()).toBeVisible();
  });

  test('hero admission call to action leads to the admission page', async ({ page }) => {
    await page.goto('/bn');
    await page.getByRole('link', { name: 'ভর্তির তথ্য দেখুন' }).click();
    await expect(page).toHaveURL(/\/bn\/admission$/);
  });

  test.describe('hero slideshow', () => {
    const shownSlide = (page: import('@playwright/test').Page) =>
      page.locator('[aria-roledescription="slide"]:not([aria-hidden])');

    test('starts on the first photo and moves with the arrows and dots', async ({ page }) => {
      await page.goto('/en');
      const slider = page.getByRole('region', { name: 'School photos' });
      await expect(slider.locator('[aria-roledescription="slide"]')).toHaveCount(6);
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 1 of 6');

      await slider.getByRole('button', { name: 'Pause' }).click();
      await slider.getByRole('button', { name: 'Next' }).click();
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 2 of 6');
      await slider.getByRole('button', { name: 'Show image 5' }).click();
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 5 of 6');
      await expect(shownSlide(page).locator('img')).toHaveJSProperty('complete', true);
      await expect(shownSlide(page)).toHaveCSS('opacity', '1');
      await slider.getByRole('button', { name: 'Previous' }).click();
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 4 of 6');
    });

    test('autoplays, and the pause button stops it', async ({ page }) => {
      await page.goto('/en');
      await page.mouse.move(0, 0);
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 2 of 6', {
        timeout: 10_000,
      });
      await page
        .getByRole('region', { name: 'School photos' })
        .getByRole('button', { name: 'Pause' })
        .click();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(7_000);
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 2 of 6');
    });

    test('does not autoplay with reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/en');
      const slider = page.getByRole('region', { name: 'School photos' });
      await expect(slider.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
      await page.waitForTimeout(7_000);
      await expect(shownSlide(page)).toHaveAttribute('aria-label', 'Image 1 of 6');
    });
  });
});

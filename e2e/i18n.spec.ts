import { expect, test } from './fixtures';

const SAMPLE_PAGES = [
  '',
  '/about/history',
  '/academics/programs',
  '/admission',
  '/teachers',
  '/contact',
];

test.describe('bilingual architecture', () => {
  for (const path of SAMPLE_PAGES) {
    test(`switching language keeps the page: ${path || '/'}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/bn${path}`);
      const h1Bn = await page.getByRole('heading', { level: 1 }).textContent();

      await page.getByRole('link', { name: 'English' }).first().click();
      await expect(page).toHaveURL(new RegExp(`/en${path.replaceAll('/', '\\/')}$`));
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      const h1En = await page.getByRole('heading', { level: 1 }).textContent();
      expect(h1En).not.toBe(h1Bn);

      await page.getByRole('link', { name: 'বাংলা' }).first().click();
      await expect(page).toHaveURL(new RegExp(`/bn${path.replaceAll('/', '\\/')}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1Bn ?? '');
    });
  }

  for (const lang of ['bn', 'en']) {
    test(`every header and footer link resolves (${lang})`, async ({ page, request }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${lang}`);
      const hrefs = await page
        .locator('header a[href^="/"], footer a[href^="/"]')
        .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')!))]);
      expect(hrefs.length).toBeGreaterThan(20);
      for (const href of hrefs) {
        const response = await request.get(href);
        expect(response.status(), href).toBe(200);
      }
    });
  }

  test('English chrome contains no untranslated Bangla text or raw keys', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/about');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'About' })
      .click();
    const text = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      // Language-switcher labels are intentionally in their own language.
      clone.querySelectorAll('[lang="bn"]').forEach((el) => el.remove());
      return clone.innerText;
    });
    expect(text).not.toMatch(/[ঀ-৿]/);
    expect(text).not.toMatch(/\b(common|nav|footer|page|notFound)\.[a-zA-Z]+/);
  });

  test('Bangla chrome contains no raw translation keys', async ({ page }) => {
    await page.goto('/bn/about');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\b(common|nav|footer|page|notFound)\.[a-zA-Z]+/);
  });

  test('document title follows client-side navigation in both languages', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    await expect(page).toHaveTitle('Banasree Quality Education School');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Teachers' })
      .click();
    await expect(page).toHaveTitle('Teachers | Banasree Quality Education School');
    await page.getByRole('link', { name: 'বাংলা' }).first().click();
    await expect(page).toHaveTitle('শিক্ষকমণ্ডলী | বনশ্রী কোয়ালিটি এডুকেশন স্কুল');
  });

  test('Bangla pages use the Bangla font, taller line height and Bangla digits', async ({
    page,
  }) => {
    await page.goto('/bn/about');
    const body = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return {
        font: style.fontFamily,
        lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize),
      };
    });
    expect(body.font).toMatch(/^"?Hind Siliguri/);
    expect(body.lineHeight).toBeGreaterThanOrEqual(1.75);
    await expect(page.locator('footer')).toContainText('© ২০');

    await page.goto('/en/about');
    const fontEn = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(fontEn).toMatch(/^"?Inter/);
  });

  test('unknown pages are translated 404s in the requested language', async ({ page }) => {
    const response = await page.goto('/en/about/unknown');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

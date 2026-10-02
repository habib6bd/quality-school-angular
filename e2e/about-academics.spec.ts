import { expect, test } from './fixtures';
import { brokenImages, collectErrors, horizontalOverflow, stubExternalHosts } from './support';

const PAGES = [
  '/about',
  '/about/history',
  '/about/mission-vision',
  '/about/philosophy',
  '/about/messages',
  '/about/facilities',
  '/academics',
  '/academics/programs',
  '/academics/programs/nine',
] as const;

test.describe('about & academic pages', () => {
  for (const lang of ['bn', 'en'] as const) {
    for (const path of PAGES) {
      test(`${lang}${path}: heading, breadcrumbs, metadata, images, no console errors`, async ({
        page,
      }) => {
        await stubExternalHosts(page);
        const errors = collectErrors(page);
        await page.goto(`/${lang}${path}`);

        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        const breadcrumbs = page.getByRole('navigation', { name: /ব্রেডক্রাম্ব|Breadcrumb/ });
        await expect(breadcrumbs).toBeVisible();
        await expect(breadcrumbs.locator('[aria-current="page"]')).toBeVisible();

        const title = await page.title();
        expect(title).toContain(lang === 'bn' ? 'বনশ্রী কোয়ালিটি এডুকেশন স্কুল' : 'Banasree');
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        expect(description?.length).toBeGreaterThan(30);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);

        expect(await brokenImages(page)).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  }

  test('each page has its own meta description (no copy-pasted metadata)', async ({ page }) => {
    const seen = new Set<string>();
    for (const path of PAGES) {
      await page.goto(`/en${path}`);
      seen.add((await page.locator('meta[name="description"]').getAttribute('content')) ?? '');
    }
    // /academics/programs/nine shares the programs-style description wording but not its text.
    expect(seen.size).toBe(PAGES.length);
  });

  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px on every page (bn and en)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const lang of ['bn', 'en']) {
        for (const path of PAGES) {
          await page.goto(`/${lang}${path}`);
          expect(
            await horizontalOverflow(page),
            `${lang}${path} at ${width}px`,
          ).toBeLessThanOrEqual(0);
        }
      }
    });
  }

  test('messages page shows both leaders in Bangla, and an explained translation in English', async ({
    page,
  }) => {
    await page.goto('/bn/about/messages');
    await expect(page.getByText('আধুনিক বিশ্বের চ্যালেঞ্জকে সামনে রেখে')).toBeVisible();
    await expect(page.getByText('কবির আহমদ')).toBeVisible();
    await page.goto('/en/about/messages');
    await expect(page.getByText('translation prepared for this website').first()).toBeVisible();
    await expect(page.locator('article img')).toHaveCount(2);
  });

  test('mission & vision shows placeholders, not invented statements', async ({ page }) => {
    await page.goto('/en/about/mission-vision');
    await expect(page.locator('main').getByText('To be confirmed by the school')).toHaveCount(2);
  });

  test('programs list leads to class pages that navigate to neighbours and back', async ({
    page,
  }) => {
    await page.goto('/en/academics/programs');
    await page.getByRole('link', { name: 'Class Nine', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/academics\/programs\/nine$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Class Nine');
    await expect(page).toHaveTitle('Class Nine | Banasree Quality Education School');
    await expect(page.getByText('Business Studies', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: /Next class: Class Ten/ }).click();
    await expect(page).toHaveURL(/\/programs\/ten$/);
    await expect(page.getByRole('link', { name: /Next class/ })).toHaveCount(0);
    await page.getByRole('link', { name: /Previous class: Class Nine/ }).click();
    await expect(page).toHaveURL(/\/programs\/nine$/);
    await page.getByRole('link', { name: 'All classes' }).click();
    await expect(page).toHaveURL(/\/en\/academics\/programs$/);
  });

  test('language switcher keeps the class page and translates it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/bn/academics/programs/five');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('পঞ্চম শ্রেণি');
    await page.getByRole('link', { name: 'English' }).first().click();
    await expect(page).toHaveURL(/\/en\/academics\/programs\/five$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Class Five');
    await expect(page).toHaveTitle('Class Five | Banasree Quality Education School');
  });

  test('an unknown class is a real 404 in both languages', async ({ page }) => {
    for (const [lang, heading] of [
      ['bn', 'পৃষ্ঠাটি পাওয়া যায়নি'],
      ['en', 'Page not found'],
    ] as const) {
      const response = await page.goto(`/${lang}/academics/programs/eleven`);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    }
  });

  test('navigation menu leads to the new About pages', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await nav.getByRole('button', { name: 'About' }).click();
    await nav.getByRole('link', { name: 'Educational philosophy' }).click();
    await expect(page).toHaveURL(/\/en\/about\/philosophy$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Educational philosophy');
  });
});

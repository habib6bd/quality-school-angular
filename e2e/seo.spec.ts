import { APIRequestContext } from '@playwright/test';
import { expect, test } from './fixtures';

const SITE = 'https://www.bqesbd.com';

const get = async (request: APIRequest, path: string) => {
  const response = await request.get(path);
  return { status: response.status(), html: await response.text() };
};
type APIRequest = APIRequestContext;

const attr = (html: string, pattern: RegExp) => pattern.exec(html)?.[1];
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1]),
  );

test.describe('server-rendered HTML (what crawlers and no-JS visitors get)', () => {
  const pages: [string, RegExp][] = [
    ['/bn', /বনশ্রী কোয়ালিটি এডুকেশন স্কুল/],
    ['/en', /Banasree Quality Education School/],
    ['/en/about', /Our journey/],
    ['/bn/about/messages', /আধুনিক বিশ্বের চ্যালেঞ্জ/],
    ['/en/academics/programs', /Junior One/],
    ['/en/academics/programs/nine', /Business Studies/],
    ['/en/teachers', /Salma Alam Sonia/],
    ['/en/teachers/md-abdullah-al-mizan', /Principal/],
    ['/en/notices', /Admission is open for Play to Class Ten/],
    ['/en/notices/admission-2026', /19 November 2025/],
    ['/en/gallery', /annual-sports-4\.webp/],
    ['/en/videos', /Study Tour - 2025/],
    ['/en/admission', /To be confirmed by the school/],
    ['/en/faq', /How do I change the website language\?/],
    ['/en/contact', /House K-278, Road 16/],
    ['/en/search?q=admission', /results for “admission”/],
  ];

  for (const [path, content] of pages) {
    test(`${path} contains its real content, one h1 and complete metadata`, async ({ request }) => {
      const { status, html } = await get(request, path);
      expect(status).toBe(200);
      expect(html).toMatch(content);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(html).not.toContain('<app-skeleton');
      expect(attr(html, /<title>([^<]+)<\/title>/)?.length).toBeGreaterThan(10);
      expect(attr(html, /<meta name="description" content="([^"]{30,})"/)).toBeTruthy();
      expect(html).toContain('<meta property="og:title"');
      expect(html).toContain('<meta name="twitter:card"');
      expect(attr(html, /<html lang="(bn|en)"/)).toBe(path.startsWith('/bn') ? 'bn' : 'en');
    });
  }

  test('indexable pages have a canonical URL, hreflang alternates and index robots', async ({
    request,
  }) => {
    const { html } = await get(request, '/en/teachers?designation=staff');
    expect(attr(html, /<link rel="canonical" href="([^"]+)"/)).toBe(`${SITE}/en/teachers`);
    expect(html).toContain(`hreflang="bn" href="${SITE}/bn/teachers"`);
    expect(html).toContain(`hreflang="en" href="${SITE}/en/teachers"`);
    expect(html).toContain(`hreflang="x-default" href="${SITE}/bn/teachers"`);
    expect(attr(html, /<meta property="og:url" content="([^"]+)"/)).toBe(`${SITE}/en/teachers`);
    expect(attr(html, /<meta name="robots" content="([^"]+)"/)).toBe('index,follow');
    expect(attr(html, /<meta property="og:locale" content="([^"]+)"/)).toBe('en_GB');
  });

  test('the Bangla page is canonical to itself and points at English as an alternate', async ({
    request,
  }) => {
    const { html } = await get(request, '/bn/contact');
    expect(attr(html, /<link rel="canonical" href="([^"]+)"/)).toBe(`${SITE}/bn/contact`);
    expect(html).toContain(`hreflang="en" href="${SITE}/en/contact"`);
    expect(attr(html, /<meta property="og:locale" content="([^"]+)"/)).toBe('bn_BD');
  });

  test('search results and 404 pages are noindex and have no canonical', async ({ request }) => {
    for (const path of ['/en/search?q=admission', '/en/nope', '/bn/academics/programs/nope']) {
      const { html } = await get(request, path);
      expect(attr(html, /<meta name="robots" content="([^"]+)"/), path).toBe('noindex,follow');
      expect(html, path).not.toContain('rel="canonical"');
      expect(html, path).not.toContain('rel="alternate"');
    }
  });

  test('the homepage carries School structured data with only known facts', async ({ request }) => {
    const { html } = await get(request, '/en');
    const blocks = jsonLd(html);
    const school = blocks.find((b) => b['@type'] === 'School');
    expect(school).toMatchObject({
      name: 'Banasree Quality Education School',
      foundingDate: '2010',
      url: `${SITE}/en`,
      telephone: ['+8801678708862', '+8801711732486'],
    });
    expect(school).not.toHaveProperty('email');
    expect(blocks.some((b) => b['@type'] === 'BreadcrumbList')).toBe(false);
    // No Article or Event data exists because none is published.
    expect(blocks.some((b) => ['NewsArticle', 'Article', 'Event'].includes(b['@type']))).toBe(
      false,
    );
  });

  test('inner pages carry a BreadcrumbList that matches the visible breadcrumbs', async ({
    request,
  }) => {
    const { html } = await get(request, '/en/academics/programs/nine');
    const crumbs = jsonLd(html).find((b) => b['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual([
      'Home',
      'Academic Overview',
      'Classes & Programs',
      'Class Nine',
    ]);
    expect(crumbs.itemListElement.at(-1).item).toBe(`${SITE}/en/academics/programs/nine`);
    expect(crumbs.itemListElement[0].item).toBe(`${SITE}/en`);
  });

  test('all JSON-LD on every key page is valid JSON with a schema.org context', async ({
    request,
  }) => {
    for (const path of [
      '/bn',
      '/en/about',
      '/bn/teachers/jalal-hossain',
      '/en/notices/admission-2026',
    ]) {
      const { html } = await get(request, path);
      const blocks = jsonLd(html);
      expect(blocks.length, path).toBeGreaterThan(0);
      for (const block of blocks) expect(block['@context'], path).toBe('https://schema.org');
    }
  });

  test('robots.txt and sitemap.xml are served', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`);

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()['content-type']).toContain('xml');
    const xml = await sitemap.text();
    expect(xml).toContain(`<loc>${SITE}/en/about</loc>`);
    expect(xml).toContain(`<loc>${SITE}/bn/teachers/salma-alam-sonia</loc>`);
    expect(xml).toContain(`<loc>${SITE}/en/notices/admission-2026</loc>`);
    expect(xml).not.toContain('/search');
  });

  test('every URL in the sitemap resolves with 200', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(urls.length).toBeGreaterThan(100);
    const statuses = await Promise.all(
      urls.map(async (path) => [path, (await request.get(path)).status()] as const),
    );
    expect(statuses.filter(([, status]) => status !== 200)).toEqual([]);
  });
});

test.describe('metadata follows client-side navigation', () => {
  test('canonical, title, description and JSON-LD update when navigating', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en');
    const canonical = () => page.locator('link[rel="canonical"]').getAttribute('href');
    expect(await canonical()).toBe(`${SITE}/en`);
    await expect(page.locator('script[data-seo-ld="school"]')).toHaveCount(1);

    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Teachers' })
      .click();
    await expect(page).toHaveURL(/\/en\/teachers$/);
    await expect.poll(canonical).toBe(`${SITE}/en/teachers`);
    await expect(page.locator('script[data-seo-ld="school"]')).toHaveCount(0);
    await expect(page.locator('script[data-seo-ld="breadcrumb"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain(
      'teachers',
    );

    await page.getByRole('link', { name: 'বাংলা' }).first().click();
    await expect.poll(canonical).toBe(`${SITE}/bn/teachers`);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'bn_BD');
  });

  test('search pages become noindex on the client too', async ({ page }) => {
    await page.goto('/en/search?q=admission');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});

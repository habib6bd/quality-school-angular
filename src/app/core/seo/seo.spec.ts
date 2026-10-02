import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { environment } from '../../../environments/environment';
import { PAGES } from '../config/pages';
import { CLASSES } from '../data/classes.data';
import { NOTICES } from '../data/notices.data';
import { SCHOOL_INFO } from '../data/school-info.data';
import { TEACHERS } from '../data/teachers.data';
import { SeoService } from './seo.service';
import {
  breadcrumbJsonLd,
  eventJsonLd,
  internationalPhone,
  newsArticleJsonLd,
  schoolJsonLd,
  serializeJsonLd,
} from './structured-data';
import { absoluteUrl, alternatesFor, assetUrl, pathWithoutLang } from './urls';

const SITE = 'https://www.bqesbd.com';

describe('URL helpers', () => {
  it('drops the language prefix, query, fragment and trailing slash', () => {
    expect(pathWithoutLang('/bn')).toBe('/');
    expect(pathWithoutLang('/en/')).toBe('/');
    expect(pathWithoutLang('/bn/about/history')).toBe('/about/history');
    expect(pathWithoutLang('/en/teachers?designation=staff#x')).toBe('/teachers');
    expect(pathWithoutLang('/english')).toBe('/english'); // not a language prefix
  });

  it('builds absolute URLs in a language', () => {
    expect(absoluteUrl('bn', '/', SITE)).toBe(`${SITE}/bn`);
    expect(absoluteUrl('en', '/about', `${SITE}/`)).toBe(`${SITE}/en/about`);
    expect(assetUrl('images/bqes/logo.png', SITE)).toBe(`${SITE}/images/bqes/logo.png`);
  });

  it('lists bn, en and x-default (Bangla) alternates', () => {
    expect(alternatesFor('/about', SITE)).toEqual([
      { hreflang: 'bn', href: `${SITE}/bn/about` },
      { hreflang: 'en', href: `${SITE}/en/about` },
      { hreflang: 'x-default', href: `${SITE}/bn/about` },
    ]);
  });
});

describe('structured data', () => {
  it('describes the school with only facts the site holds', () => {
    const data = schoolJsonLd(SCHOOL_INFO, 'en', SITE) as Record<string, unknown>;
    expect(data['@type']).toBe('School');
    expect(data['name']).toBe('Banasree Quality Education School');
    expect(data['foundingDate']).toBe('2010');
    expect(data['url']).toBe(`${SITE}/en`);
    expect(data['logo']).toBe(`${SITE}/images/bqes/logo.webp`);
    expect(data['telephone']).toEqual(['+8801678708862', '+8801711732486']);
    expect((data['address'] as Record<string, string>)['streetAddress']).toContain(
      'South Banasree',
    );
    expect(data['sameAs']).toEqual(SCHOOL_INFO.social.map((s) => s.url));
    // Not published, so absent rather than invented.
    expect(data).not.toHaveProperty('email');
    expect(data).not.toHaveProperty('numberOfStudents');
    expect(data).not.toHaveProperty('openingHours');
  });

  it('uses Bangla names and omits optional blocks when the data is missing', () => {
    const bare = { ...SCHOOL_INFO, address: null, phones: [], social: [] };
    const data = schoolJsonLd(bare, 'bn', SITE);
    expect(data['name']).toBe('বনশ্রী কোয়ালিটি এডুকেশন স্কুল');
    expect(data).not.toHaveProperty('address');
    expect(data).not.toHaveProperty('telephone');
    expect(data).not.toHaveProperty('sameAs');
  });

  it('formats Bangladeshi numbers internationally', () => {
    expect(internationalPhone('01711732486')).toBe('+8801711732486');
    expect(internationalPhone('+880 1711-732486')).toBe('+8801711732486');
  });

  it('builds a BreadcrumbList with absolute URLs and the current page last', () => {
    const data = breadcrumbJsonLd(
      [
        { label: 'Home', link: ['/', 'en'] },
        { label: 'About', link: ['/', 'en', 'about'] },
        { label: 'History' },
      ],
      `${SITE}/en/about/history`,
      SITE,
    );
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data['itemListElement']).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/en` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE}/en/about` },
      { '@type': 'ListItem', position: 3, name: 'History', item: `${SITE}/en/about/history` },
    ]);
  });

  it('builds Article and Event data for real items only (shape check with sample items)', () => {
    const article = newsArticleJsonLd(
      {
        slug: 's',
        title: { bn: 'শিরো', en: 'Headline' },
        summary: { bn: 'সারা', en: 'Summary' },
        body: { bn: ['ক'], en: ['a'] },
        publishedAt: '2026-02-01',
        image: { src: 'images/x.webp', width: 1, height: 1, alt: { bn: 'ক' } },
      },
      'en',
      `${SITE}/en/news/s`,
      SITE,
    );
    expect(article).toMatchObject({
      '@type': 'NewsArticle',
      headline: 'Headline',
      datePublished: '2026-02-01',
      image: `${SITE}/images/x.webp`,
    });
    const event = eventJsonLd(
      {
        slug: 'e',
        title: { bn: 'ইভেন্ট', en: 'Camp' },
        summary: { bn: 'ক', en: 'Summary' },
        body: { bn: ['ক'] },
        startDate: '2026-12-20',
        endDate: '2026-12-22',
        location: { bn: 'মাঠ', en: 'Field' },
      },
      'en',
      `${SITE}/en/events/e`,
    );
    expect(event).toMatchObject({
      '@type': 'Event',
      name: 'Camp',
      startDate: '2026-12-20',
      endDate: '2026-12-22',
      location: { '@type': 'Place', name: 'Field' },
    });
  });

  it('serializes so that content can never close the script tag', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>');
  });
});

/** Unit tests build with the development environment, so the service uses `environment.siteUrl`. */
describe('SeoService head tags', () => {
  const head = () => TestBed.inject(DOCUMENT).head;
  const meta = (selector: string) => TestBed.inject(Meta).getTag(selector)?.getAttribute('content');
  const links = (selector: string) =>
    Array.from(head().querySelectorAll(selector)).map((l) => [
      l.getAttribute('hreflang'),
      l.getAttribute('href'),
    ]);

  it('sets canonical, hreflang alternates and og:url without query or language-specific parts', () => {
    TestBed.inject(SeoService).setPage(
      { title: 'Teachers' },
      'en',
      '/en/teachers?designation=staff',
    );
    expect(head().querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${environment.siteUrl}/en/teachers`,
    );
    expect(links('link[rel="alternate"][hreflang]')).toEqual([
      ['bn', `${environment.siteUrl}/bn/teachers`],
      ['en', `${environment.siteUrl}/en/teachers`],
      ['x-default', `${environment.siteUrl}/bn/teachers`],
    ]);
    expect(meta('property="og:url"')).toBe(`${environment.siteUrl}/en/teachers`);
    expect(meta('property="og:locale:alternate"')).toBe('bn_BD');
    expect(meta('name="robots"')).toBe('index,follow');
  });

  it('keeps exactly one canonical and one set of alternates across navigations', () => {
    const seo = TestBed.inject(SeoService);
    seo.setPage({}, 'bn', '/bn');
    seo.setPage({ title: 'X' }, 'en', '/en/about');
    expect(head().querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(head().querySelectorAll('link[rel="alternate"][hreflang]')).toHaveLength(3);
    expect(head().querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${environment.siteUrl}/en/about`,
    );
  });

  it('marks noindex pages and gives them no canonical or alternates', () => {
    const seo = TestBed.inject(SeoService);
    seo.setPage({ title: 'A' }, 'en', '/en/about');
    seo.setPage({ title: 'Search', noindex: true }, 'en', '/en/search?q=x');
    expect(meta('name="robots"')).toBe('noindex,follow');
    expect(head().querySelector('link[rel="canonical"]')).toBeNull();
    expect(head().querySelectorAll('link[rel="alternate"][hreflang]')).toHaveLength(0);
    expect(TestBed.inject(Meta).getTag('property="og:url"')).toBeNull();
  });

  it('preloads only the fonts of the page language, without duplicates', () => {
    const seo = TestBed.inject(SeoService);
    const preloads = () =>
      Array.from(head().querySelectorAll('link[rel="preload"][as="font"]')).map((l) => [
        l.getAttribute('href'),
        l.getAttribute('crossorigin'),
      ]);
    seo.setPage({}, 'bn', '/bn');
    expect(preloads()).toEqual([
      ['/fonts/hind-siliguri-bengali-400.woff2', ''],
      ['/fonts/hind-siliguri-bengali-600.woff2', ''],
    ]);
    seo.setPage({}, 'en', '/en');
    expect(preloads()).toEqual([['/fonts/inter-latin-variable.woff2', '']]);
  });

  it('adds, replaces and resets JSON-LD blocks', () => {
    const seo = TestBed.inject(SeoService);
    seo.resetStructuredData(); // the document is shared between tests
    seo.addStructuredData('school', { '@type': 'School' });
    seo.addStructuredData('breadcrumb', { '@type': 'BreadcrumbList' });
    seo.addStructuredData('school', { '@type': 'EducationalOrganization' });
    const types = () =>
      Array.from(head().querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => JSON.parse(s.textContent ?? '{}')['@type'],
      );
    expect(types()).toEqual(['BreadcrumbList', 'EducationalOrganization']);
    seo.resetStructuredData();
    expect(types()).toEqual([]);
  });

  it('only emits a breadcrumb for pages with a real trail', () => {
    const seo = TestBed.inject(SeoService);
    seo.resetStructuredData();
    seo.setBreadcrumbs([{ label: 'Home' }]);
    expect(head().querySelectorAll('script[data-seo-ld]')).toHaveLength(0);
    seo.setBreadcrumbs([{ label: 'Home', link: ['/', 'en'] }, { label: 'About' }], 'en');
    expect(head().querySelectorAll('script[data-seo-ld="breadcrumb"]')).toHaveLength(1);
  });
});

describe('robots.txt and sitemap.xml', () => {
  const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

  it('robots.txt allows crawling, hides search results and points at the sitemap', () => {
    const robots = read('public/robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Disallow: /bn/search');
    expect(robots).toContain('Disallow: /en/search');
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });

  it('the committed sitemap lists every indexable page in both languages, plus detail pages', () => {
    expect(existsSync(join(process.cwd(), 'public/sitemap.xml'))).toBe(true);
    const xml = read('public/sitemap.xml');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const page of PAGES.filter((p) => !p.noindex)) {
      for (const lang of ['bn', 'en']) {
        expect(locs, `${lang}/${page.path}`).toContain(
          absoluteUrl(lang as 'bn' | 'en', page.path ? `/${page.path}` : '/', SITE),
        );
      }
    }
    expect(locs.some((l) => l.includes('/search'))).toBe(false);
    for (const item of CLASSES)
      expect(locs).toContain(`${SITE}/en/academics/programs/${item.slug}`);
    for (const item of TEACHERS) expect(locs).toContain(`${SITE}/bn/teachers/${item.slug}`);
    for (const item of NOTICES) expect(locs).toContain(`${SITE}/en/notices/${item.slug}`);
    expect(new Set(locs).size).toBe(locs.length);
    expect(xml).toContain('<lastmod>2025-11-19</lastmod>');
    expect((xml.match(/hreflang="x-default"/g) ?? []).length).toBe(locs.length);
  });
});

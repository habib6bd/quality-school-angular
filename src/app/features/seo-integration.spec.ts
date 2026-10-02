import { DOCUMENT, RESPONSE_INIT, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Lang } from '../core/i18n/lang';
import { LanguageService } from '../core/i18n/language.service';
import { SchoolEvent } from '../core/models/event.model';
import { NewsArticle } from '../core/models/news.model';
import { EventService } from '../core/services/event.service';
import { NewsService } from '../core/services/news.service';
import { ClassDetailPage } from './academics/class-detail';
import { EventDetailPage } from './events/event-detail';
import { Home } from './home/home';
import { NewsDetailPage } from './news/news-detail';

async function render(
  component: Type<unknown>,
  lang: Lang,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
): Promise<void> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: RESPONSE_INIT, useValue: { status: 200 } },
      ...(providers as never[]),
    ],
  });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(component);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

const ld = () =>
  Array.from(TestBed.inject(DOCUMENT).head.querySelectorAll('script[data-seo-ld]')).map((s) => ({
    key: s.getAttribute('data-seo-ld'),
    data: JSON.parse(s.textContent ?? '{}'),
  }));

describe('structured data on pages', () => {
  // The document is shared between tests; in the app the title strategy resets this on every navigation.
  beforeEach(() =>
    document.head
      .querySelectorAll('script[data-seo-ld], link[rel="canonical"], meta[name="robots"]')
      .forEach((node) => node.remove()),
  );

  it('the homepage describes the school', async () => {
    await render(Home, 'en');
    const school = ld().find((b) => b.key === 'school')?.data;
    expect(school['@type']).toBe('School');
    expect(school.name).toBe('Banasree Quality Education School');
    expect(school.telephone).toContain('+8801678708862');
  });

  it('a class page gets a four-step breadcrumb trail and no article or event data', async () => {
    await render(ClassDetailPage, 'en', { slug: 'nine' });
    const crumbs = ld().find((b) => b.key === 'breadcrumb')?.data;
    expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual([
      'Home',
      'Academic Overview',
      'Classes & Programs',
      'Class Nine',
    ]);
    expect(ld().map((b) => b.key)).toEqual(['breadcrumb']);
  });

  it('a real article and a real event each get their own data', async () => {
    const article: NewsArticle = {
      slug: 'a',
      title: { bn: 'শিরো', en: 'Headline' },
      summary: { bn: 'ক', en: 'Summary' },
      body: { bn: ['ক'], en: ['a'] },
      publishedAt: '2026-02-01',
    };
    await render(NewsDetailPage, 'en', { slug: 'a' }, [
      { provide: NewsService, useValue: { bySlug: () => of(article) } },
    ]);
    expect(ld().find((b) => b.key === 'article')?.data).toMatchObject({
      '@type': 'NewsArticle',
      headline: 'Headline',
    });
    TestBed.resetTestingModule();

    const event: SchoolEvent = {
      slug: 'e',
      title: { bn: 'ইভে', en: 'Camp' },
      summary: { bn: 'ক', en: 'S' },
      body: { bn: ['ক'], en: ['b'] },
      startDate: '2026-12-20',
    };
    await render(EventDetailPage, 'en', { slug: 'e' }, [
      { provide: EventService, useValue: { bySlug: () => of(event) } },
    ]);
    expect(ld().find((b) => b.key === 'event')?.data).toMatchObject({
      '@type': 'Event',
      name: 'Camp',
    });
  });

  it('an unknown article gets no structured data and is kept out of search engines', async () => {
    await render(NewsDetailPage, 'en', { slug: 'missing' }, [
      { provide: NewsService, useValue: { bySlug: () => of(undefined) } },
    ]);
    expect(ld().some((b) => b.key === 'article')).toBe(false);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.getAttribute('content')).toBe(
      'noindex,follow',
    );
    expect(TestBed.inject(DOCUMENT).head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});

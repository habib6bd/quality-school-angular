import { RESPONSE_INIT, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Lang } from '../core/i18n/lang';
import { LanguageService } from '../core/i18n/language.service';
import { SchoolEvent } from '../core/models/event.model';
import { NewsArticle } from '../core/models/news.model';
import { Notice, NoticeCategory } from '../core/models/notice.model';
import { EVENT_LIST } from '../core/repositories/content-repositories';
import { NewsService } from '../core/services/news.service';
import { NoticeService } from '../core/services/notice.service';
import { EventDetailPage } from './events/event-detail';
import { EventsPage } from './events/events';
import { NewsDetailPage } from './news/news-detail';
import { NewsPage } from './news/news';
import { NoticeDetailPage } from './notices/notice-detail';
import { NoticesPage } from './notices/notices';

async function render(
  component: Type<unknown>,
  lang: Lang,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...(providers as never[])] });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(component);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const notice = (n: number, category: NoticeCategory, over: Partial<Notice> = {}): Notice => ({
  slug: `notice-${n}`,
  title: { bn: `নোটিশ ${n}`, en: `Notice ${n}` },
  summary: { bn: `সারাংশ ${n}`, en: `Summary ${n}` },
  category,
  publishedAt: `2026-01-${String(n).padStart(2, '0')}`,
  attachments: [],
  ...over,
});

const stubNotices = (items: Notice[]) => [
  {
    provide: NoticeService,
    useValue: {
      list: () => of(items),
      latest: () => of(items),
      bySlug: (slug: string) => of(items.find((i) => i.slug === slug)),
    },
  },
];

const chips = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('nav[aria-label] a')).map((a) =>
    a.textContent?.replace(/\s+/g, ' ').trim(),
  );

describe('NoticesPage', () => {
  it('shows the real admission notice with category chips and counts', async () => {
    const el = await render(NoticesPage, 'en');
    expect(el.querySelectorAll('app-notice-card')).toHaveLength(1);
    expect(el.querySelector('app-notice-card a')?.getAttribute('href')).toBe(
      '/en/notices/admission-2026',
    );
    expect(chips(el).filter((c) => c?.startsWith('Filter'))).toEqual([]);
    const filterChips = Array.from(
      el.querySelectorAll('nav[aria-label="Filter by category"] a'),
    ).map((a) => a.textContent?.replace(/\s+/g, ' ').trim());
    expect(filterChips).toEqual([
      'All 1',
      'Admission 1',
      'Academic 0',
      'Exam 0',
      'Holiday 0',
      'General 0',
    ]);
    expect(el.textContent).toContain('Showing 1 of 1 notices');
  });

  it('filters by category from the URL and explains an empty category', async () => {
    const admission = await render(NoticesPage, 'en', { category: 'admission' });
    expect(admission.querySelectorAll('app-notice-card')).toHaveLength(1);
    expect(
      admission.querySelector('a[aria-current="true"]')?.textContent?.replace(/\s+/g, ' ').trim(),
    ).toBe('Admission 1');
    TestBed.resetTestingModule();
    const exam = await render(NoticesPage, 'en', { category: 'exam' });
    expect(exam.querySelectorAll('app-notice-card')).toHaveLength(0);
    expect(exam.textContent).toContain('No notices in this category');
    expect(exam.querySelector('app-empty-state a')?.getAttribute('href')).toBe('/en/notices');
  });

  it('ignores an unknown category', async () => {
    const el = await render(NoticesPage, 'en', { category: 'nonsense' });
    expect(el.querySelectorAll('app-notice-card')).toHaveLength(1);
  });

  it('paginates long lists and clamps a bad page', async () => {
    const many = Array.from({ length: 14 }, (_, i) => notice(i + 1, i % 2 ? 'exam' : 'general'));
    const second = await render(NoticesPage, 'en', { page: '2' }, stubNotices(many));
    expect(second.querySelectorAll('app-notice-card')).toHaveLength(6);
    expect(
      second
        .querySelector('nav[aria-label="Pagination"] [aria-current="page"]')
        ?.textContent?.trim(),
    ).toBe('2');
    expect(second.textContent).toContain('Showing 6 of 14 notices');
    TestBed.resetTestingModule();

    const clamped = await render(NoticesPage, 'en', { page: '99' }, stubNotices(many));
    expect(clamped.querySelectorAll('app-notice-card')).toHaveLength(2);
    expect(
      clamped
        .querySelector('nav[aria-label="Pagination"] [aria-current="page"]')
        ?.textContent?.trim(),
    ).toBe('3');
  });

  it('combines the category filter with pagination counts', async () => {
    const many = Array.from({ length: 14 }, (_, i) => notice(i + 1, i < 7 ? 'exam' : 'general'));
    const el = await render(NoticesPage, 'en', { category: 'exam' }, stubNotices(many));
    expect(el.querySelectorAll('app-notice-card')).toHaveLength(6);
    expect(el.textContent).toContain('Showing 6 of 7 notices');
    expect(el.querySelector('nav[aria-label="Pagination"]')).not.toBeNull();
  });

  it('shows an empty state when there are no notices at all', async () => {
    const el = await render(NoticesPage, 'bn', {}, stubNotices([]));
    expect(el.textContent).toContain('কোনো নোটিশ নেই');
  });
});

describe('NoticeDetailPage', () => {
  it('shows the notice, its image and safe open/download links', async () => {
    const el = await render(NoticeDetailPage, 'en', { slug: 'admission-2026' });
    expect(el.querySelector('h1')?.textContent).toContain(
      'Admission is open for Play to Class Ten',
    );
    expect(el.querySelector('time')?.getAttribute('datetime')).toBe('2025-11-19');
    expect(el.textContent).toContain('Admission');
    const open = el.querySelector<HTMLAnchorElement>('a[target="_blank"]')!;
    expect(open.getAttribute('href')).toBe('images/bqes/notices/admission-2026.webp');
    expect(open.getAttribute('rel')).toBe('noopener noreferrer');
    expect(el.querySelector('a[download]')?.getAttribute('href')).toBe(
      'images/bqes/notices/admission-2026.webp',
    );
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('Admission notice 2026');
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Admission is open');
    expect(el.querySelector('a[href="/en/notices"]')).not.toBeNull();
  });

  it('refuses to link unsafe attachments and says so', async () => {
    const unsafe = notice(1, 'general', {
      slug: 'unsafe',
      attachments: [
        { kind: 'pdf', src: 'https://evil.example.com/a.pdf', label: { bn: 'ক', en: 'Evil' } },
        { kind: 'pdf', src: '../secret.pdf', label: { bn: 'খ', en: 'Traversal' } },
        { kind: 'pdf', src: 'files/routine.pdf', label: { bn: 'গ', en: 'Routine' } },
      ],
    });
    const el = await render(NoticeDetailPage, 'en', { slug: 'unsafe' }, stubNotices([unsafe]));
    const hrefs = Array.from(el.querySelectorAll('a[download]')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['files/routine.pdf']);
    expect(el.innerHTML).not.toContain('evil.example.com');
    expect(el.innerHTML).not.toContain('secret.pdf');
    expect(el.querySelector('[role="note"]')?.textContent).toContain('not shown for safety');
  });

  it('shows no attachment section when the notice has none', async () => {
    const plain = notice(1, 'general', { slug: 'plain' });
    const el = await render(NoticeDetailPage, 'en', { slug: 'plain' }, stubNotices([plain]));
    expect(el.querySelector('#attachments-title')).toBeNull();
  });

  it('reports a 404 for an unknown notice', async () => {
    const init: ResponseInit = { status: 200 };
    const el = await render(NoticeDetailPage, 'en', { slug: 'nope' }, [
      { provide: RESPONSE_INIT, useValue: init },
    ]);
    expect(el.querySelector('h1')?.textContent).toContain('Page not found');
    expect(init.status).toBe(404);
  });
});

const article = (n: number): NewsArticle => ({
  slug: `news-${n}`,
  title: { bn: `সংবাদ ${n}`, en: `News ${n}` },
  summary: { bn: 'সারাংশ', en: 'Summary' },
  body: {
    bn: ['প্রথম অনুচ্ছেদ', 'দ্বিতীয় অনুচ্ছেদ'],
    en: ['First paragraph', 'Second paragraph'],
  },
  publishedAt: `2026-02-${String(n).padStart(2, '0')}`,
});

const stubNews = (items: NewsArticle[]) => [
  {
    provide: NewsService,
    useValue: {
      list: () => of(items),
      bySlug: (slug: string) => of(items.find((i) => i.slug === slug)),
    },
  },
];

describe('News pages', () => {
  it('shows an honest empty state while no news is published', async () => {
    const el = await render(NewsPage, 'en');
    expect(el.querySelectorAll('app-news-card')).toHaveLength(0);
    expect(el.textContent).toContain('No news published yet');
  });

  it('lists published articles with pagination', async () => {
    const items = Array.from({ length: 11 }, (_, i) => article(i + 1));
    const el = await render(NewsPage, 'en', { page: '2' }, stubNews(items));
    expect(el.querySelectorAll('app-news-card')).toHaveLength(2);
    TestBed.resetTestingModule();
    const first = await render(NewsPage, 'en', {}, stubNews(items));
    expect(first.querySelectorAll('app-news-card')).toHaveLength(9);
    expect(first.querySelector('app-news-card h3')?.textContent).toContain('News 1');
    expect(first.querySelector('app-news-card a')?.getAttribute('href')).toBe('/en/news/news-1');
  });

  it('shows an article page in the active language and 404s for unknown slugs', async () => {
    const el = await render(NewsDetailPage, 'bn', { slug: 'news-1' }, stubNews([article(1)]));
    expect(el.querySelector('h1')?.textContent).toContain('সংবাদ ১'.replace('১', '1'));
    expect(el.querySelectorAll('.prose-content p')).toHaveLength(2);
    TestBed.resetTestingModule();
    const init: ResponseInit = { status: 200 };
    const missing = await render(NewsDetailPage, 'en', { slug: 'x' }, [
      ...stubNews([article(1)]),
      { provide: RESPONSE_INIT, useValue: init },
    ]);
    expect(missing.querySelector('h1')?.textContent).toContain('Page not found');
    expect(init.status).toBe(404);
  });
});

const event = (slug: string, start: string, end?: string): SchoolEvent => ({
  slug,
  title: { bn: `ইভেন্ট ${slug}`, en: `Event ${slug}` },
  summary: { bn: 'সারাংশ', en: 'Summary' },
  body: { bn: ['বিবরণ'], en: ['Details'] },
  startDate: start,
  endDate: end,
  location: { bn: 'স্কুল মাঠ', en: 'School field' },
});

const FUTURE = '2999-05-01';
const PAST = '2001-05-01';

describe('Events pages', () => {
  const repo = (items: readonly SchoolEvent[]) => ({
    provide: EVENT_LIST.token,
    useValue: { list: () => of(items) },
  });

  it('shows honest empty states for upcoming and past events', async () => {
    const upcoming = await render(EventsPage, 'en');
    expect(upcoming.textContent).toContain('No upcoming events');
    TestBed.resetTestingModule();
    const past = await render(EventsPage, 'en', { view: 'past' });
    expect(past.textContent).toContain('No past events');
    expect(past.querySelector('a[aria-current="true"]')?.textContent).toContain('Past');
  });

  it('splits events into upcoming (soonest first) and past (latest first)', async () => {
    const providers = [
      repo([event('old', PAST), event('soon', '2998-01-01'), event('later', FUTURE)]),
    ];
    const upcoming = await render(EventsPage, 'en', {}, providers);
    expect(
      Array.from(upcoming.querySelectorAll('app-event-card h3')).map((h) => h.textContent?.trim()),
    ).toEqual(['Event soon', 'Event later']);
    TestBed.resetTestingModule();
    const past = await render(EventsPage, 'en', { view: 'past' }, providers);
    expect(past.querySelectorAll('app-event-card')).toHaveLength(1);
    expect(past.querySelector('app-event-card a')?.getAttribute('href')).toBe('/en/events/old');
  });

  it('keeps an event that is still running in the upcoming list', async () => {
    const el = await render(EventsPage, 'en', {}, [repo([event('running', PAST, FUTURE)])]);
    expect(el.querySelectorAll('app-event-card')).toHaveLength(1);
  });

  it('shows the event page with dates and place, and 404s for unknown slugs', async () => {
    const providers = [repo([event('camp', '2026-12-20', '2026-12-22')])];
    const el = await render(EventDetailPage, 'en', { slug: 'camp' }, providers);
    expect(el.querySelector('h1')?.textContent).toContain('Event camp');
    expect(el.textContent).toContain('20 December 2026');
    expect(el.textContent).toContain('22 December 2026');
    expect(el.textContent).toContain('School field');
    TestBed.resetTestingModule();
    const init: ResponseInit = { status: 200 };
    const missing = await render(EventDetailPage, 'bn', { slug: 'nope' }, [
      ...providers,
      { provide: RESPONSE_INIT, useValue: init },
    ]);
    expect(missing.querySelector('h1')?.textContent).toContain('পৃষ্ঠাটি পাওয়া যায়নি');
    expect(init.status).toBe(404);
  });
});

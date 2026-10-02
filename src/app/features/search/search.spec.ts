import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { SearchEntry } from '../../core/search/search';
import { SearchIndexService } from '../../core/services/search-index.service';
import { isSearchKind, SearchPage } from './search';

async function render(
  lang: Lang,
  inputs: Record<string, unknown> = {},
  entries?: SearchEntry[],
): Promise<{ el: HTMLElement; detect: () => Promise<void> }> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      ...(entries
        ? [{ provide: SearchIndexService, useValue: { entries: () => of(entries) } }]
        : []),
    ],
  });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(SearchPage);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  const detect = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await detect();
  return { el: fixture.nativeElement as HTMLElement, detect };
}

const titles = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('a[data-result]')).map((a) =>
    a.textContent?.replace(/\s+/g, ' ').trim(),
  );

const many = (n: number): SearchEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `e${i}`,
    kind: i % 2 ? 'notice' : 'page',
    title: { bn: `নোটিশ ${i}`, en: `Match ${i}` },
    text: { bn: 'বিবরণ', en: 'details' },
    path: `notices/e${i}`,
  }));

describe('SearchPage', () => {
  it('without a query suggests where to start and shows no results', async () => {
    const { el } = await render('en');
    expect(el.querySelector('#search-suggestions')).not.toBeNull();
    expect(el.querySelectorAll('#search-suggestions ~ ul a')).toHaveLength(5);
    expect(el.querySelector('a[data-result]')).toBeNull();
    expect(el.querySelector('input[type="search"]')?.getAttribute('placeholder')).toBe(
      'Search the site…',
    );
  });

  it('finds real pages, teachers and notices with kind labels and real links', async () => {
    const { el } = await render('en', { q: 'admission' });
    expect(titles(el).length).toBeGreaterThan(2);
    const hrefs = Array.from(el.querySelectorAll('a[data-result]')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toContain('/en/admission');
    expect(hrefs).toContain('/en/notices/admission-2026');
    expect(el.textContent).toContain('Notices');
    expect(el.querySelector('[role="status"]')?.textContent).toContain('results for “admission”');
  });

  it('highlights the matching words and never injects HTML', async () => {
    const { el } = await render('en', { q: 'sonia' });
    expect(el.querySelector('a[data-result] mark')?.textContent).toBe('Sonia');
    TestBed.resetTestingModule();
    const html = await render('en', { q: '<img src=x onerror=alert(1)>' });
    expect(html.el.querySelector('img[src="x"]')).toBeNull();
    expect(html.el.textContent).toContain('Nothing found');
  });

  it('does not put gaps inside words around a highlighted part', async () => {
    const { el } = await render('en', { q: 'soni' });
    const link = el.querySelector('a[data-result]')!;
    expect(link.textContent).toBe('Salma Alam Sonia');
    expect(link.querySelector('mark')?.textContent).toBe('Soni');
  });

  it('shows chip counts per kind and filters by kind from the URL', async () => {
    const all = await render('en', { q: 'teacher' });
    const chips = Array.from(all.el.querySelectorAll('nav[aria-label="Type of result"] a')).map(
      (a) => a.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(chips[0]).toMatch(/^All \d+$/);
    expect(chips).toContain('News 0');
    TestBed.resetTestingModule();
    const teachers = await render('en', { q: 'teacher', kind: 'teacher' });
    expect(teachers.el.querySelector('a[aria-current="true"]')?.textContent).toContain('Teachers');
    expect(
      Array.from(teachers.el.querySelectorAll('li.card .bg-secondary-50')).every((b) =>
        b.textContent?.includes('Teachers'),
      ),
    ).toBe(true);
  });

  it('explains an empty result and offers contact', async () => {
    const { el } = await render('en', { q: 'xyzzy' });
    expect(el.querySelector('app-empty-state')?.textContent).toContain('Nothing found for “xyzzy”');
    expect(el.querySelector('app-empty-state a')?.getAttribute('href')).toBe('/en/contact');
  });

  it('paginates and clamps an out-of-range page', async () => {
    const entries = many(25);
    const first = await render('en', { q: 'match' }, entries);
    expect(titles(first.el)).toHaveLength(10);
    expect(first.el.querySelector('nav[aria-label="Pagination"]')).not.toBeNull();
    TestBed.resetTestingModule();
    const last = await render('en', { q: 'match', page: '3' }, entries);
    expect(titles(last.el)).toHaveLength(5);
    TestBed.resetTestingModule();
    const clamped = await render('en', { q: 'match', page: '99' }, entries);
    expect(titles(clamped.el)).toHaveLength(5);
  });

  it('searches in Bangla on the Bangla page, with Bangla labels and digits', async () => {
    const { el } = await render('bn', { q: 'ভর্তি' });
    expect(titles(el).length).toBeGreaterThan(0);
    expect(el.querySelector('[role="status"]')?.textContent).toMatch(/টি ফলাফল/);
    expect(el.querySelector('[role="status"]')?.textContent).toMatch(/[০-৯]/);
  });

  it('moves between the field and results with the arrow keys', async () => {
    const { el } = await render('en', { q: 'admission' });
    document.body.appendChild(el);
    const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    const links = Array.from(el.querySelectorAll<HTMLElement>('a[data-result]'));
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
    links[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(input);
    el.remove();
  });

  it('validates the kind from the URL', () => {
    expect(isSearchKind('teacher')).toBe(true);
    expect(isSearchKind('everything')).toBe(false);
  });
});

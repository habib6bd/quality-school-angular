import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SearchIndexService } from '../services/search-index.service';
import {
  highlightSegments,
  normalizeForSearch,
  searchEntries,
  SearchEntry,
  snippet,
  tokenize,
} from './search';

const entry = (id: string, kind: SearchEntry['kind'], title: string, text = ''): SearchEntry => ({
  id,
  kind,
  title: { bn: title, en: title },
  text: { bn: text, en: text },
  path: id,
});

describe('search text helpers', () => {
  it('normalizes case and Bangla digits', () => {
    expect(normalizeForSearch('Class ২০২৬ ABC')).toBe('class 2026 abc');
  });

  it('tokenizes into unique normalized words', () => {
    expect(tokenize('  Admission  admission ২০২৬ ')).toEqual(['admission', '2026']);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('searchEntries', () => {
  const entries = [
    entry('a', 'page', 'Admission', 'How to apply'),
    entry('b', 'notice', 'Notice', 'Admission is open for 2026'),
    entry('c', 'teacher', 'Salma Alam Sonia', 'Teacher'),
    entry('d', 'page', 'Class Nine', 'Science and business groups'),
  ];

  it('returns nothing for an empty query', () => {
    expect(searchEntries(entries, '   ', 'en')).toEqual([]);
  });

  it('requires every word and matches title or text', () => {
    expect(searchEntries(entries, 'admission', 'en').map((h) => h.entry.id)).toEqual(['a', 'b']);
    expect(searchEntries(entries, 'class science', 'en').map((h) => h.entry.id)).toEqual(['d']);
    expect(searchEntries(entries, 'class zzz', 'en')).toEqual([]);
  });

  it('ranks title matches above text matches, then groups by kind', () => {
    const [first, second] = searchEntries(entries, 'admission', 'en');
    expect(first.entry.id).toBe('a');
    expect(first.score).toBeGreaterThan(second.score);
  });

  it('is case-insensitive and treats Bangla and ASCII digits alike', () => {
    expect(searchEntries(entries, 'SALMA', 'en').map((h) => h.entry.id)).toEqual(['c']);
    expect(searchEntries(entries, '২০২৬', 'en').map((h) => h.entry.id)).toEqual(['b']);
  });

  it('matches in either language regardless of the page language', () => {
    const bilingual: SearchEntry = {
      id: 'x',
      kind: 'page',
      title: { bn: 'যোগাযোগ', en: 'Contact' },
      text: { bn: 'ঠিকানা', en: 'Address' },
      path: 'contact',
    };
    expect(searchEntries([bilingual], 'contact', 'bn')).toHaveLength(1);
    expect(searchEntries([bilingual], 'যোগাযোগ', 'en')).toHaveLength(1);
  });

  it('gives a phrase in the title an extra boost', () => {
    const hits = searchEntries(
      [entry('p', 'page', 'Alam Salma'), entry('q', 'page', 'Salma Alam Sonia')],
      'salma alam',
      'en',
    );
    expect(hits[0].entry.id).toBe('q');
  });
});

describe('highlightSegments', () => {
  it('splits text into plain and matching parts, merging overlaps', () => {
    expect(highlightSegments('Admission is open', ['admission', 'open'])).toEqual([
      { text: 'Admission', match: true },
      { text: ' is ', match: false },
      { text: 'open', match: true },
    ]);
    expect(highlightSegments('aaa', ['aa', 'aaa'])).toEqual([{ text: 'aaa', match: true }]);
  });

  it('never returns HTML and leaves text without matches untouched', () => {
    expect(highlightSegments('<b>x</b>', ['zzz'])).toEqual([{ text: '<b>x</b>', match: false }]);
    expect(highlightSegments('<b>x</b>', ['x'])[1]).toEqual({ text: 'x', match: true });
  });

  it('highlights Bangla digit matches', () => {
    expect(highlightSegments('২০২৬ শিক্ষাবর্ষ', ['2026'])[0]).toEqual({
      text: '২০২৬',
      match: true,
    });
  });
});

describe('snippet', () => {
  it('keeps short text and trims long text around the first match with ellipses', () => {
    expect(snippet('short text', ['text'])).toBe('short text');
    const long = `${'a '.repeat(100)}needle ${'b '.repeat(100)}`;
    const cut = snippet(long, ['needle'], 80);
    expect(cut).toContain('needle');
    expect(cut.startsWith('…')).toBe(true);
    expect(cut.endsWith('…')).toBe(true);
    expect(cut.length).toBeLessThan(100);
  });
});

describe('SearchIndexService', () => {
  it('indexes pages, classes, teachers and notices — and nothing invented', async () => {
    const entries = await firstValueFrom(TestBed.inject(SearchIndexService).entries());
    const byKind = (kind: string) => entries.filter((e) => e.kind === kind);
    expect(byKind('page').length).toBeGreaterThan(25); // registry pages + 13 class pages
    expect(entries.some((e) => e.path === 'academics/programs/nine')).toBe(true);
    expect(byKind('teacher')).toHaveLength(28);
    expect(byKind('notice')).toHaveLength(1);
    // Nothing is published for these yet.
    expect(byKind('news')).toHaveLength(0);
    expect(byKind('event')).toHaveLength(0);
    expect(byKind('resource')).toHaveLength(0);
  });

  it('leaves out the home and search pages and has unique ids', async () => {
    const entries = await firstValueFrom(TestBed.inject(SearchIndexService).entries());
    expect(entries.some((e) => e.path === '' || e.path === 'search')).toBe(false);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
  });

  it('finds things by Bangla or English, with real links', async () => {
    const entries = await firstValueFrom(TestBed.inject(SearchIndexService).entries());
    expect(searchEntries(entries, 'ভর্তি', 'bn').some((h) => h.entry.path === 'admission')).toBe(
      true,
    );
    expect(
      searchEntries(entries, 'admission', 'en').some(
        (h) => h.entry.path === 'notices/admission-2026',
      ),
    ).toBe(true);
    expect(searchEntries(entries, 'sonia', 'en')[0].entry.path).toBe('teachers/salma-alam-sonia');
  });

  it('builds the index once', async () => {
    const service = TestBed.inject(SearchIndexService);
    expect(await firstValueFrom(service.entries())).toBe(await firstValueFrom(service.entries()));
  });
});

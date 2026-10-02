import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { LanguageService } from '../i18n/language.service';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  const content = (selector: string) =>
    TestBed.inject(Meta).getTag(selector)?.getAttribute('content');

  it('composes "page | school" and mirrors it into Open Graph and Twitter tags', () => {
    TestBed.inject(SeoService).setPage({ title: 'History', description: 'About history' }, 'en');
    expect(TestBed.inject(Title).getTitle()).toBe('History | Banasree Quality Education School');
    expect(content('name="description"')).toBe('About history');
    expect(content('property="og:title"')).toBe('History | Banasree Quality Education School');
    expect(content('property="og:description"')).toBe('About history');
    expect(content('property="og:locale"')).toBe('en_GB');
    expect(content('property="og:type"')).toBe('website');
    expect(content('name="twitter:card"')).toBe('summary');
    expect(content('name="twitter:title"')).toBe('History | Banasree Quality Education School');
  });

  it('uses only the school name on the home page and a site-wide description by default', () => {
    TestBed.inject(SeoService).setPage({}, 'bn');
    expect(TestBed.inject(Title).getTitle()).toBe('বনশ্রী কোয়ালিটি এডুকেশন স্কুল');
    expect(content('name="description"')).toContain('২০১০ সালে বনশ্রী');
    expect(content('property="og:locale"')).toBe('bn_BD');
  });

  it('uses the active language when none is given and an absolute logo image by default', () => {
    TestBed.inject(LanguageService).setLang('en');
    TestBed.inject(SeoService).setPage({ title: 'Teachers' });
    expect(TestBed.inject(Title).getTitle()).toBe('Teachers | Banasree Quality Education School');
    expect(content('property="og:image"')).toMatch(/^https?:\/\/.+\/images\/bqes\/logo\.png$/);
  });

  it('replaces tags instead of duplicating them when the page changes', () => {
    const seo = TestBed.inject(SeoService);
    seo.setPage({ title: 'A' }, 'en');
    seo.setPage({ title: 'B' }, 'en');
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(content('property="og:title"')).toContain('B |');
  });
});

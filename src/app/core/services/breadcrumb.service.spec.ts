import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../i18n/language.service';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  it('builds localized crumbs with links on every item except the current page', () => {
    TestBed.inject(LanguageService).setLang('en');
    const crumbs = TestBed.inject(BreadcrumbService).forPage('about/history');
    expect(crumbs).toEqual([
      { label: 'Home', link: ['/', 'en'] },
      { label: 'About the School', link: ['/', 'en', 'about'] },
      { label: 'History' },
    ]);
  });

  it('appends a detail item after a linked parent page', () => {
    const crumbs = TestBed.inject(BreadcrumbService).forPage('notices', 'ভর্তি বিজ্ঞপ্তি');
    expect(crumbs.map((c) => c.label)).toEqual(['হোম', 'নোটিশ', 'ভর্তি বিজ্ঞপ্তি']);
    expect(crumbs[1].link).toEqual(['/', 'bn', 'notices']);
    expect(crumbs[2].link).toBeUndefined();
  });
});

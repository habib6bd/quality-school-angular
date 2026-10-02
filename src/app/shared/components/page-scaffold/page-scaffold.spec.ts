import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../../core/i18n/language.service';
import { PendingNote } from '../pending-note/pending-note';
import { RelatedLinks } from '../related-links/related-links';
import { PageScaffold } from './page-scaffold';

describe('PageScaffold', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  function render(inputs: Record<string, string>) {
    const fixture = TestBed.createComponent(PageScaffold);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the registered page title, intro and breadcrumbs', () => {
    TestBed.inject(LanguageService).setLang('en');
    const el = render({ page: 'about/history', intro: 'Intro text' });
    expect(el.querySelector('h1')?.textContent).toContain('History');
    expect(el.textContent).toContain('Intro text');
    const crumbs = Array.from(el.querySelectorAll('nav li')).map((li) => li.textContent?.trim());
    expect(crumbs).toEqual(['Home', 'About the School', 'History']);
  });

  it('turns a detail title into the heading, last breadcrumb and document title', () => {
    TestBed.inject(LanguageService).setLang('en');
    const el = render({
      page: 'academics/programs',
      detailTitle: 'Class Nine',
      detailDescription: 'About Class Nine',
    });
    TestBed.createComponent(PageScaffold); // a second instance must not break the first
    expect(el.querySelector('h1')?.textContent).toContain('Class Nine');
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Class Nine');
    expect(TestBed.inject(Title).getTitle()).toBe('Class Nine | Banasree Quality Education School');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe('About Class Nine');
  });
});

describe('RelatedLinks', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('links registered pages in the active language and skips unknown paths', () => {
    TestBed.inject(LanguageService).setLang('en');
    const fixture = TestBed.createComponent(RelatedLinks);
    fixture.componentRef.setInput('paths', ['about/history', 'does/not/exist', 'faq']);
    fixture.detectChanges();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map(
      (a) => a.getAttribute('href'),
    );
    expect(links).toEqual(['/en/about/history', '/en/faq']);
  });
});

describe('PendingNote', () => {
  it('labels the message as awaiting confirmation by the school', () => {
    const fixture = TestBed.createComponent(PendingNote);
    fixture.componentRef.setInput('message', 'Mission text coming');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mission text coming');
    expect(text).toContain('বিদ্যালয় কর্তৃক নিশ্চিত করা হবে');
  });
});

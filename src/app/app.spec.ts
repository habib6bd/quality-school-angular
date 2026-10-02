import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { PAGES } from './core/config/pages';
import { SUPPORTED_LANGS } from './core/i18n/lang';
import { TranslatedTitleStrategy } from './core/i18n/translated-title.strategy';

describe('App routing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
      ],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('marks the document as ready once the app is rendered and stable', async () => {
    document.documentElement.removeAttribute('data-app-ready');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.documentElement.getAttribute('data-app-ready')).toBe('true');
  });

  it('moves focus to the main landmark after navigating to another page, but not for filters or language changes', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/bn/about');
    const main = () => document.getElementById('main-content');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.activeElement).not.toBe(main()); // first page: focus left alone

    await harness.navigateByUrl('/bn/teachers');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.activeElement).toBe(main());

    (document.activeElement as HTMLElement).blur();
    await harness.navigateByUrl('/bn/teachers?designation=staff');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.activeElement).not.toBe(main()); // same page, different filter

    await harness.navigateByUrl('/en/teachers?designation=staff');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.activeElement).not.toBe(main()); // same page, other language

    await harness.navigateByUrl('/en/contact');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.activeElement).toBe(main());
  });

  it('redirects the root URL to the default Bangla tree', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/bn');
    expect(document.documentElement.lang).toBe('bn');
  });

  for (const lang of SUPPORTED_LANGS) {
    it(`resolves every registered page in ${lang} without falling through to 404`, async () => {
      const harness = await RouterTestingHarness.create();
      for (const page of PAGES) {
        const url = page.path ? `/${lang}/${page.path}` : `/${lang}`;
        await harness.navigateByUrl(url);
        const text = harness.routeNativeElement?.textContent ?? '';
        expect(text, url).not.toContain(
          lang === 'bn' ? 'পৃষ্ঠাটি পাওয়া যায়নি' : 'Page not found',
        );
        expect(document.documentElement.lang, url).toBe(lang);
      }
    });
  }

  it('sets translated document titles', async () => {
    const harness = await RouterTestingHarness.create();
    const title = TestBed.inject(Title);
    await harness.navigateByUrl('/en/about/history');
    expect(title.getTitle()).toBe('History | Banasree Quality Education School');
    await harness.navigateByUrl('/bn/about/history');
    expect(title.getTitle()).toBe('ইতিহাস | বনশ্রী কোয়ালিটি এডুকেশন স্কুল');
    await harness.navigateByUrl('/en');
    expect(title.getTitle()).toBe('Banasree Quality Education School');
  });

  it('renders a translated not-found page for unknown URLs', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/en/does-not-exist');
    expect(harness.routeNativeElement?.textContent).toContain('Page not found');
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Page not found | Banasree Quality Education School',
    );
  });
});

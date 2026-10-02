import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LanguageService } from '../../../core/i18n/language.service';
import { LanguageSwitcher, swapLangInUrl } from './language-switcher';

describe('swapLangInUrl', () => {
  it('keeps the path, query and fragment', () => {
    expect(swapLangInUrl('/bn/about/history?x=1#top', 'en')).toBe('/en/about/history?x=1#top');
    expect(swapLangInUrl('/en', 'bn')).toBe('/bn');
    expect(swapLangInUrl('/en?q=a', 'bn')).toBe('/bn?q=a');
  });

  it('does not treat look-alike segments as a language', () => {
    expect(swapLangInUrl('/bnx/page', 'en')).toBe('/en');
  });

  it('falls back to the language root for unprefixed URLs', () => {
    expect(swapLangInUrl('/unknown', 'en')).toBe('/en');
  });
});

@Component({
  selector: 'app-host',
  imports: [LanguageSwitcher],
  template: '<app-language-switcher />',
})
class Host {}

describe('LanguageSwitcher', () => {
  it('links to the equivalent page in each language and marks the active one', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Host }])],
    });
    TestBed.inject(LanguageService).setLang('bn');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/bn/teachers?page=2');

    const links = Array.from(harness.routeNativeElement!.querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/bn/teachers?page=2',
      '/en/teachers?page=2',
    ]);
    expect(links[0].getAttribute('aria-current')).toBe('true');
    expect(links[1].getAttribute('aria-current')).toBeNull();
    expect(links[1].getAttribute('lang')).toBe('en');
  });
});

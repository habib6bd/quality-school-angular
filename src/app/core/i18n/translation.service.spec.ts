import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { pickLocalized } from './localized';
import { TRANSLATIONS, TranslationService } from './translation.service';
import { bn } from './translations/bn';

describe('TranslationService', () => {
  function setup(
    en: object = { common: { close: 'Close', imageOf: 'Image {current} of {total}' } },
  ) {
    TestBed.configureTestingModule({
      providers: [{ provide: TRANSLATIONS, useValue: { bn, en } }],
    });
    return {
      i18n: TestBed.inject(TranslationService),
      language: TestBed.inject(LanguageService),
    };
  }

  it('returns Bangla by default', () => {
    const { i18n } = setup();
    expect(i18n.t('common.close')).toBe('বন্ধ করুন');
  });

  it('follows the active language', () => {
    const { i18n, language } = setup();
    language.setLang('en');
    expect(i18n.t('common.close')).toBe('Close');
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to Bangla when an English string is missing', () => {
    const { i18n, language } = setup();
    language.setLang('en');
    expect(i18n.t('nav.teachers')).toBe('শিক্ষকমণ্ডলী');
  });

  it('interpolates parameters', () => {
    const { i18n, language } = setup();
    language.setLang('en');
    expect(i18n.t('common.imageOf', { current: 2, total: 7 })).toBe('Image 2 of 7');
  });

  it('can translate for a language other than the active one', () => {
    const { i18n } = setup();
    expect(i18n.translate('en', 'common.close')).toBe('Close');
  });
});

describe('pickLocalized', () => {
  it('picks the requested language and falls back to Bangla', () => {
    expect(pickLocalized({ bn: 'হ্যাঁ', en: 'Yes' }, 'en')).toBe('Yes');
    expect(pickLocalized({ bn: 'হ্যাঁ' }, 'en')).toBe('হ্যাঁ');
    expect(pickLocalized({ bn: 'হ্যাঁ', en: 'Yes' }, 'bn')).toBe('হ্যাঁ');
  });
});

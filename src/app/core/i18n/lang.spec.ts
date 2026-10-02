import { DEFAULT_LANG, isLang } from './lang';

describe('lang helpers', () => {
  it('accepts supported languages only', () => {
    expect(isLang('bn')).toBe(true);
    expect(isLang('en')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it('defaults to Bangla', () => {
    expect(DEFAULT_LANG).toBe('bn');
  });
});

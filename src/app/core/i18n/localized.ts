import { Lang } from './lang';

/**
 * Text supplied by the school in one or both languages.
 * Bangla is required; English falls back to Bangla when missing.
 */
export interface Localized<T = string> {
  bn: T;
  en?: T;
}

export function pickLocalized<T>(value: Localized<T>, lang: Lang): T {
  return (lang === 'en' ? value.en : undefined) ?? value.bn;
}

/** The language the text is actually written in: Bangla when English is missing and falls back. */
export function localizedLang(value: Localized<unknown>, lang: Lang): Lang {
  return lang === 'en' && value.en === undefined ? 'bn' : lang;
}

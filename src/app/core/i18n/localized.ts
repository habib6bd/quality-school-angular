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

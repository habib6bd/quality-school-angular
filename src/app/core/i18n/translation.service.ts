import { computed, inject, Injectable, InjectionToken } from '@angular/core';
import { DEFAULT_LANG, Lang } from './lang';
import { LanguageService } from './language.service';
import { bn } from './translations/bn';
import { en } from './translations/en';
import { LeafKeys, PartialDict, TranslationDict } from './translations/types';

export type TranslationKey = LeafKeys<typeof bn>;
export type TranslationParams = Record<string, string | number>;

export type Dictionaries = Record<Lang, PartialDict<typeof bn>>;

/** UI dictionaries per language; overridable in tests. */
export const TRANSLATIONS = new InjectionToken<Dictionaries>('TRANSLATIONS', {
  providedIn: 'root',
  factory: () => ({ bn, en }),
});

function lookup(dict: PartialDict<typeof bn> | undefined, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as TranslationDict)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Looks up UI strings for the active language.
 * Fallback order: active language → default language (Bangla) → the key itself.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = inject(LanguageService);
  private readonly dictionaries = inject(TRANSLATIONS);

  readonly lang = this.language.lang;
  private readonly dict = computed(() => this.dictionaries[this.lang()]);

  t(key: TranslationKey, params?: TranslationParams): string {
    return this.translate(this.lang(), key, params);
  }

  translate(lang: Lang, key: TranslationKey, params?: TranslationParams): string {
    const dict = lang === this.lang() ? this.dict() : this.dictionaries[lang];
    const text = lookup(dict, key) ?? lookup(this.dictionaries[DEFAULT_LANG], key) ?? key;
    return interpolate(text, params);
  }
}

import { environment } from '../../../environments/environment';
import { Lang, SUPPORTED_LANGS } from '../i18n/lang';

/** `/bn/about?x=1#y` → `/about`; the language prefix, query and fragment are dropped. */
export function pathWithoutLang(url: string): string {
  const path = url.split(/[?#]/)[0].replace(/^\/(bn|en)(?=\/|$)/, '');
  return path === '' ? '/' : path.replace(/\/+$/, '') || '/';
}

/** Absolute public URL of a page (given without language prefix) in a language. */
export function absoluteUrl(lang: Lang, pathNoLang: string, siteUrl = environment.siteUrl): string {
  const base = siteUrl.replace(/\/+$/, '');
  return pathNoLang === '/' ? `${base}/${lang}` : `${base}/${lang}${pathNoLang}`;
}

/** Absolute URL of a site-relative file such as an image. */
export function assetUrl(src: string, siteUrl = environment.siteUrl): string {
  return new URL(src, `${siteUrl.replace(/\/+$/, '')}/`).href;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/** `hreflang` alternates for a page: one per language plus `x-default` (the default language). */
export function alternatesFor(pathNoLang: string, siteUrl = environment.siteUrl): Alternate[] {
  const list = SUPPORTED_LANGS.map((lang) => ({
    hreflang: lang as string,
    href: absoluteUrl(lang, pathNoLang, siteUrl),
  }));
  return [
    ...list,
    { hreflang: 'x-default', href: absoluteUrl(SUPPORTED_LANGS[0], pathNoLang, siteUrl) },
  ];
}

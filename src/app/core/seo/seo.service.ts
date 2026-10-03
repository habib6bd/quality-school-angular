import { DOCUMENT, inject, Injectable, Injector } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Lang } from '../i18n/lang';
import { LanguageService } from '../i18n/language.service';
import { TranslationService } from '../i18n/translation.service';
import { BreadcrumbItem } from '../models/breadcrumb.model';
import { breadcrumbJsonLd, serializeJsonLd } from './structured-data';
import { absoluteUrl, alternatesFor, assetUrl, pathWithoutLang } from './urls';

export interface PageMeta {
  /** Page-specific part of the title; omitted on the home page (the school name alone). */
  title?: string;
  /** Falls back to the site-wide description. */
  description?: string;
  /** Site-relative image path used for link previews; falls back to the logo. */
  image?: string;
  type?: 'website' | 'article';
  /**
   * Keep the page out of search results (search results, not-found). Such pages get no canonical
   * or hreflang links, because they should not be treated as a page to index in any language.
   */
  noindex?: boolean;
}

const OG_LOCALES: Record<Lang, string> = { bn: 'bn_BD', en: 'en_GB' };
const DEFAULT_IMAGE = 'images/bqes/logo.png';
const MARK = 'data-seo';

/** The fonts the first paint of each language needs (self-hosted, see public/fonts/README.txt). */
const FONT_PRELOADS: Record<Lang, readonly string[]> = {
  bn: ['/fonts/noto-serif-bengali-bengali-variable.woff2'],
  en: ['/fonts/noto-serif-bengali-latin-variable.woff2'],
};

/**
 * Everything a search engine or link preview reads from `<head>`: title, description, canonical,
 * `hreflang` alternates, Open Graph, Twitter card, robots and JSON-LD. Route-level pages are
 * handled by `TranslatedTitleStrategy`; detail pages call `setPage` once their content has loaded.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService);

  /**
   * The router is resolved lazily: `TitleStrategy` (which uses this service) is itself a
   * dependency of the router, so injecting it eagerly would be circular.
   */
  private get router(): Router {
    return this.injector.get(Router);
  }

  /**
   * @param url the page's URL; defaults to the router's current URL. The language prefix, query
   * string and fragment are dropped for the canonical and alternate links, so filtered or paged
   * views all point at the plain page.
   */
  setPage(page: PageMeta, lang: Lang = this.language.lang(), url: string = this.router.url): void {
    const school = this.i18n.translate(lang, 'common.schoolName');
    const fullTitle = page.title ? `${page.title} | ${school}` : school;
    const description = page.description || this.i18n.translate(lang, 'seo.defaultDescription');
    const image = assetUrl(page.image ?? DEFAULT_IMAGE);
    const path = pathWithoutLang(url);
    const canonical = page.noindex ? null : absoluteUrl(lang, path);

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content: page.noindex ? 'noindex,follow' : 'index,follow',
    });
    this.meta.updateTag({ property: 'og:site_name', content: school });
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALES[lang] });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    const otherLocale = OG_LOCALES[lang === 'bn' ? 'en' : 'bn'];
    this.setMetaIf(
      !!canonical,
      { property: 'og:url', content: canonical ?? '' },
      'property="og:url"',
    );
    this.setMetaIf(
      !!canonical,
      { property: 'og:locale:alternate', content: otherLocale },
      'property="og:locale:alternate"',
    );
    this.setFontPreloads(lang);
    this.setCanonical(canonical);
    this.setAlternates(page.noindex ? [] : alternatesFor(path));
  }

  /** Absolute public URL of the page being shown, in the given language. */
  currentUrl(lang: Lang = this.language.lang()): string {
    return absoluteUrl(lang, pathWithoutLang(this.router.url));
  }

  /** Forgets the previous page's JSON-LD; call at the start of every navigation. */
  resetStructuredData(): void {
    this.document.head.querySelectorAll(`script[${MARK}-ld]`).forEach((node) => node.remove());
  }

  /** Adds (or replaces) one JSON-LD block. `key` names the block, e.g. `breadcrumb`. */
  addStructuredData(key: string, data: Record<string, unknown>): void {
    this.document.head.querySelector(`script[${MARK}-ld="${key}"]`)?.remove();
    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute(`${MARK}-ld`, key);
    script.textContent = serializeJsonLd(data);
    this.document.head.appendChild(script);
  }

  /** `BreadcrumbList` for the current page from the breadcrumb items shown on it. */
  setBreadcrumbs(items: readonly BreadcrumbItem[], lang: Lang = this.language.lang()): void {
    if (items.length < 2) return;
    const current = this.currentUrl(lang);
    this.addStructuredData('breadcrumb', breadcrumbJsonLd(items, current, environment.siteUrl));
  }

  private setMetaIf(
    condition: boolean,
    tag: { property: string; content: string },
    selector: string,
  ): void {
    if (condition) this.meta.updateTag(tag);
    else this.meta.removeTag(selector);
  }

  /** Starts downloading the page language's fonts early, so text is not first drawn in a fallback. */
  private setFontPreloads(lang: Lang): void {
    const head = this.document.head;
    head.querySelectorAll(`link[rel="preload"][${MARK}]`).forEach((node) => node.remove());
    for (const href of FONT_PRELOADS[lang]) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'preload');
      link.setAttribute('as', 'font');
      link.setAttribute('type', 'font/woff2');
      link.setAttribute('href', href);
      link.setAttribute('crossorigin', '');
      link.setAttribute(MARK, '');
      head.appendChild(link);
    }
  }

  private setCanonical(href: string | null): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!href) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setAlternates(alternates: readonly { hreflang: string; href: string }[]): void {
    const head = this.document.head;
    head.querySelectorAll(`link[rel="alternate"][${MARK}]`).forEach((node) => node.remove());
    for (const { hreflang, href } of alternates) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      link.setAttribute(MARK, '');
      head.appendChild(link);
    }
  }
}

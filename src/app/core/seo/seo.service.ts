import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { Lang } from '../i18n/lang';
import { LanguageService } from '../i18n/language.service';
import { TranslationService } from '../i18n/translation.service';

export interface PageMeta {
  /** Page-specific part of the title; omitted on the home page (the school name alone). */
  title?: string;
  /** Falls back to the site-wide description. */
  description?: string;
  /** Site-relative image path used for link previews; falls back to the logo. */
  image?: string;
  type?: 'website' | 'article';
}

const OG_LOCALES: Record<Lang, string> = { bn: 'bn_BD', en: 'en_GB' };
const DEFAULT_IMAGE = 'images/bqes/logo.png';

/**
 * Sets `<title>`, the description and the Open Graph / Twitter card tags. Route-level pages are
 * handled by `TranslatedTitleStrategy`; detail pages call `setPage` once their content has loaded.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService);

  setPage(page: PageMeta, lang: Lang = this.language.lang()): void {
    const school = this.i18n.translate(lang, 'common.schoolName');
    const fullTitle = page.title ? `${page.title} | ${school}` : school;
    const description = page.description || this.i18n.translate(lang, 'seo.defaultDescription');
    const image = new URL(page.image ?? DEFAULT_IMAGE, `${environment.siteUrl}/`).href;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
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
  }
}

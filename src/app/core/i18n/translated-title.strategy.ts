import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from '../seo/seo.service';
import { DEFAULT_LANG, isLang, Lang } from './lang';
import { TranslationKey, TranslationService } from './translation.service';

/** Route data keys read by the title strategy. */
export interface TitledRouteData {
  lang?: Lang;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  noindex?: boolean;
}

/**
 * Sets `<title>` from the deepest route's `titleKey`, in the language of the route tree.
 * Detail pages whose title depends on loaded content override it via `SeoService.setPage`.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let lang: Lang = DEFAULT_LANG;
    let titleKey: TranslationKey | undefined;
    let descriptionKey: TranslationKey | undefined;
    let noindex = false;
    let route: ActivatedRouteSnapshot | null = snapshot.root;
    while (route) {
      const data = route.data as TitledRouteData;
      if (isLang(data.lang)) lang = data.lang;
      if (data.titleKey) titleKey = data.titleKey;
      if (data.descriptionKey) descriptionKey = data.descriptionKey;
      if (data.noindex) noindex = true;
      route = route.firstChild;
    }

    const page =
      titleKey && titleKey !== 'nav.home' ? this.i18n.translate(lang, titleKey) : undefined;
    const description = descriptionKey ? this.i18n.translate(lang, descriptionKey) : undefined;
    this.seo.resetStructuredData();
    this.seo.setPage({ title: page, description, noindex }, lang, snapshot.url);
  }
}

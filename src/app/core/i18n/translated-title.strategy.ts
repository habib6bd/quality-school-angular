import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { DEFAULT_LANG, isLang, Lang } from './lang';
import { TranslationKey, TranslationService } from './translation.service';

/** Route data keys read by the title strategy. */
export interface TitledRouteData {
  lang?: Lang;
  titleKey?: TranslationKey;
}

/**
 * Sets `<title>` from the deepest route's `titleKey`, in the language of the route tree.
 * Detail pages whose title depends on loaded content override it via the SEO service.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(TranslationService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let lang: Lang = DEFAULT_LANG;
    let titleKey: TranslationKey | undefined;
    let route: ActivatedRouteSnapshot | null = snapshot.root;
    while (route) {
      const data = route.data as TitledRouteData;
      if (isLang(data.lang)) lang = data.lang;
      if (data.titleKey) titleKey = data.titleKey;
      route = route.firstChild;
    }

    const school = this.i18n.translate(lang, 'common.schoolName');
    const page = titleKey && titleKey !== 'nav.home' ? this.i18n.translate(lang, titleKey) : null;
    this.title.setTitle(page ? `${page} | ${school}` : school);
  }
}

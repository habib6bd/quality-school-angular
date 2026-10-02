import { inject, Injectable } from '@angular/core';
import { navCommands } from '../config/navigation';
import { pageTrail } from '../config/pages';
import { LanguageService } from '../i18n/language.service';
import { TranslationService } from '../i18n/translation.service';
import { BreadcrumbItem } from '../models/breadcrumb.model';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService);

  /**
   * Breadcrumbs for a registered page, optionally followed by a detail item
   * (e.g. a notice title) that is not itself in the page registry.
   */
  forPage(path: string, current?: string): BreadcrumbItem[] {
    const lang = this.language.lang();
    const items: BreadcrumbItem[] = pageTrail(path).map((page) => ({
      label: page.path === '' ? this.i18n.t('common.home') : this.i18n.t(page.titleKey),
      link: navCommands(lang, page.path),
    }));
    if (current) items.push({ label: current });
    else if (items.length) delete items[items.length - 1].link;
    return items;
  }
}

import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { Lang } from '../../core/i18n/lang';
import { Localized, localizedLang, pickLocalized } from '../../core/i18n/localized';

/** `{{ notice.title | localize }}` — picks the active language, falling back to Bangla. */
@Pipe({ name: 'localize', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform<T>(value: Localized<T>): T {
    return pickLocalized(value, this.language.lang());
  }
}

/**
 * `<p [lang]="notice.title | localizedLang">` — the language the localized text is really in,
 * so Bangla text shown as an English-page fallback is announced and hyphenated correctly.
 */
@Pipe({ name: 'localizedLang', pure: false })
export class LocalizedLangPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: Localized<unknown>): Lang {
    return localizedLang(value, this.language.lang());
  }
}

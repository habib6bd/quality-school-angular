import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { Localized, pickLocalized } from '../../core/i18n/localized';

/** `{{ notice.title | localize }}` — picks the active language, falling back to Bangla. */
@Pipe({ name: 'localize', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform<T>(value: Localized<T>): T {
    return pickLocalized(value, this.language.lang());
  }
}

import { inject, Pipe, PipeTransform } from '@angular/core';
import {
  TranslationKey,
  TranslationParams,
  TranslationService,
} from '../../core/i18n/translation.service';

/** `{{ 'common.close' | t }}` — impure so it follows the active-language signal. */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}

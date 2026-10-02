import { inject, Pipe, PipeTransform } from '@angular/core';
import { DateStyle, formatDate, formatDigits, formatNumber } from '../../core/i18n/format';
import { LanguageService } from '../../core/i18n/language.service';

/** `{{ 2026 | localeNumber: false }}` → `২০২৬` on Bangla pages. */
@Pipe({ name: 'localeNumber', pure: false })
export class LocaleNumberPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: number, grouping = true): string {
    return formatNumber(value, this.language.lang(), grouping);
  }
}

/** `{{ notice.date | localeDate }}` → `১৯ নভেম্বর ২০২৫` / `19 November 2025`. */
@Pipe({ name: 'localeDate', pure: false })
export class LocaleDatePipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(iso: string, style: DateStyle = 'long'): string {
    return formatDate(iso, this.language.lang(), style);
  }
}

/** `{{ '01678708862' | localeDigits }}` → `০১৬৭৮৭০৮৮৬২` on Bangla pages; text is otherwise unchanged. */
@Pipe({ name: 'localeDigits', pure: false })
export class LocaleDigitsPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(value: string): string {
    return formatDigits(value, this.language.lang());
  }
}

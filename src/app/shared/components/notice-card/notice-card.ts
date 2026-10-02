import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationKey } from '../../../core/i18n/translation.service';
import { Notice, NoticeCategory } from '../../../core/models/notice.model';
import { LocaleDatePipe } from '../../pipes/locale-format.pipes';
import { LocalizedLangPipe, LocalizePipe } from '../../pipes/localize.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Badge } from '../badge/badge';
import { Icon } from '../icon/icon';

export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, TranslationKey> = {
  admission: 'notices.category.admission',
  academic: 'notices.category.academic',
  exam: 'notices.category.exam',
  holiday: 'notices.category.holiday',
  general: 'notices.category.general',
};

@Component({
  selector: 'app-notice-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  imports: [
    RouterLink,
    Badge,
    Icon,
    LocaleDatePipe,
    LocalizePipe,
    LocalizedLangPipe,
    TranslatePipe,
  ],
  template: `
    <article class="card card-interactive flex h-full flex-col p-5">
      <div class="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <app-badge tone="secondary">{{ categoryLabel() | t }}</app-badge>
        <time [attr.datetime]="notice().publishedAt" class="inline-flex items-center gap-1">
          <app-icon name="calendar" [size]="14" />
          {{ notice().publishedAt | localeDate: 'medium' }}
        </time>
      </div>
      <h3 class="mt-3 text-lg leading-snug" [lang]="notice().title | localizedLang">
        <a [routerLink]="link()" class="after:absolute after:inset-0 hover:text-primary-700">{{
          notice().title | localize
        }}</a>
      </h3>
      <p class="mt-2 text-sm text-ink-muted" [lang]="notice().summary | localizedLang">
        {{ notice().summary | localize }}
      </p>
      <span
        class="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-700"
        aria-hidden="true"
      >
        {{ 'common.readMore' | t }} <app-icon name="arrowRight" [size]="16" />
      </span>
    </article>
  `,
})
export class NoticeCard {
  readonly notice = input.required<Notice>();
  /** Router commands of the notice detail (or list) page. */
  readonly link = input.required<readonly string[]>();

  protected readonly categoryLabel = computed(() => NOTICE_CATEGORY_LABELS[this.notice().category]);
}

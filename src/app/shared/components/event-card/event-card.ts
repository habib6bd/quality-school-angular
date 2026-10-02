import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SchoolEvent } from '../../../core/models/event.model';
import { LocaleDatePipe } from '../../pipes/locale-format.pipes';
import { LocalizedLangPipe, LocalizePipe } from '../../pipes/localize.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-event-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  imports: [RouterLink, Icon, LocaleDatePipe, LocalizePipe, LocalizedLangPipe, TranslatePipe],
  template: `
    <article class="card card-interactive flex h-full flex-col p-5">
      <p class="inline-flex flex-wrap items-center gap-x-2 text-sm font-medium text-primary-800">
        <app-icon name="calendar" [size]="16" />
        <time [attr.datetime]="event().startDate">{{ event().startDate | localeDate }}</time>
        @if (event().endDate; as end) {
          <span aria-hidden="true">–</span>
          <time [attr.datetime]="end">{{ end | localeDate }}</time>
        }
      </p>
      <h3 class="mt-2 text-lg leading-snug" [lang]="event().title | localizedLang">
        <a [routerLink]="link()" class="after:absolute after:inset-0 hover:text-primary-700">{{
          event().title | localize
        }}</a>
      </h3>
      @if (event().location; as location) {
        <p class="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
          <app-icon name="mapPin" [size]="14" /> {{ location | localize }}
        </p>
      }
      <p class="mt-2 text-sm text-ink-muted" [lang]="event().summary | localizedLang">
        {{ event().summary | localize }}
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
export class EventCard {
  readonly event = input.required<SchoolEvent>();
  readonly link = input.required<readonly string[]>();
}

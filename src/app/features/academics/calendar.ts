import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CalendarEvent } from '../../core/models/calendar.model';
import { CalendarService } from '../../core/services/calendar.service';
import { todayIso } from '../../core/util/today';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { MonthCalendar, parseMonth } from '../../shared/components/month-calendar/month-calendar';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/**
 * Academic calendar. The school has not published its calendar, so the month grid is empty and
 * a placeholder says so; entries from `CalendarService` appear in the grid and the month list.
 * The visible month is in the URL (`?month=2026-10`).
 */
@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, MonthCalendar, PageScaffold, PendingNote, RelatedLinks, TranslatePipe],
  template: `
    <app-page-scaffold page="academics/calendar" [intro]="'calendar.intro' | t">
      <app-pending-note class="mb-8 block" [message]="'calendar.pending' | t" />
      <app-async-state [status]="events.status()" skeleton="text" (retry)="events.reload()">
        <app-month-calendar [month]="visibleMonth()" [events]="events.value()" [today]="today" />
      </app-async-state>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class CalendarPage {
  private readonly service = inject(CalendarService);

  /** Query parameter `month` (`YYYY-MM`), bound by `withComponentInputBinding`. */
  readonly month = input<string>();

  protected readonly today = todayIso();
  protected readonly related = ['academics', 'admission', 'notices'] as const;
  protected readonly events = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly CalendarEvent[],
  });
  /** The month in the URL, or the current month when it is missing or invalid. */
  protected readonly visibleMonth = computed(
    () => parseMonth(this.month()) ?? parseMonth(this.today.slice(0, 7))!,
  );
}

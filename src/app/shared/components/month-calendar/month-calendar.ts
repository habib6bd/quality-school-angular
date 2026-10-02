import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatNumber, LOCALES } from '../../../core/i18n/format';
import { LanguageService } from '../../../core/i18n/language.service';
import { pickLocalized } from '../../../core/i18n/localized';
import { CalendarEvent } from '../../../core/models/calendar.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

export interface MonthRef {
  year: number;
  /** 1–12. */
  month: number;
}

/** Parses `YYYY-MM`; anything else returns `null`. */
export function parseMonth(value: unknown): MonthRef | null {
  const match = typeof value === 'string' ? /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value) : null;
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

export function monthKey({ year, month }: MonthRef): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export interface DayCell {
  /** `YYYY-MM-DD`. */
  iso: string;
  day: number;
  inMonth: boolean;
}

/** Weeks (Sunday first) covering the month, padded with the neighbouring months' days. */
export function monthWeeks({ year, month }: MonthRef): DayCell[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  const weeks: DayCell[][] = [];
  const cursor = new Date(start);
  do {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        iso: cursor.toISOString().slice(0, 10),
        day: cursor.getUTCDate(),
        inMonth: cursor.getUTCMonth() === month - 1,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  } while (cursor.getUTCMonth() === month - 1);
  return weeks;
}

/** Whether `iso` falls within an event's start–end range. */
export function occursOn(event: CalendarEvent, iso: string): boolean {
  return event.startDate <= iso && iso <= (event.endDate ?? event.startDate);
}

/**
 * Month grid. On small screens the grid stays compact (numbers only) and the events of the
 * month are also listed below it, so no information depends on cell size.
 */
@Component({
  selector: 'app-month-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    <div class="flex items-center justify-between gap-3">
      <a
        [routerLink]="[]"
        [queryParams]="{ month: previousKey() }"
        class="grid size-11 place-items-center rounded-full border border-stone-300 bg-white hover:bg-primary-50"
        [attr.aria-label]="'calendar.previousMonth' | t"
      >
        <app-icon name="chevronLeft" [size]="20" />
      </a>
      <h2 class="text-center text-xl sm:text-2xl" aria-live="polite">{{ title() }}</h2>
      <a
        [routerLink]="[]"
        [queryParams]="{ month: nextKey() }"
        class="grid size-11 place-items-center rounded-full border border-stone-300 bg-white hover:bg-primary-50"
        [attr.aria-label]="'calendar.nextMonth' | t"
      >
        <app-icon name="chevronRight" [size]="20" />
      </a>
    </div>

    <div class="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <table class="w-full table-fixed border-collapse text-center">
        <caption class="sr-only">
          {{
            title()
          }}
        </caption>
        <thead class="bg-stone-100 text-xs font-semibold text-ink-muted sm:text-sm">
          <tr>
            @for (name of weekdays(); track $index) {
              <th scope="col" class="py-2">
                <abbr [title]="name.long" class="no-underline">{{ name.short }}</abbr>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (week of weeks(); track week[0].iso) {
            <tr class="border-t border-stone-200">
              @for (cell of week; track cell.iso) {
                <td
                  class="h-12 align-top text-sm sm:h-24 sm:p-2 sm:text-base"
                  [class]="cell.inMonth ? '' : 'bg-stone-50 text-stone-400'"
                  [attr.aria-current]="cell.iso === today() ? 'date' : null"
                >
                  <span
                    class="mx-auto mt-1 grid size-7 place-items-center rounded-full sm:mx-0 sm:mt-0"
                    [class]="
                      cell.iso === today() ? 'bg-primary-700 font-bold text-white' : 'font-medium'
                    "
                    >{{ digits(cell.day) }}</span
                  >
                  @if (cell.inMonth && hasEvent(cell.iso)) {
                    <span
                      class="mx-auto mt-1 block size-1.5 rounded-full bg-accent-600 sm:mx-0"
                      aria-hidden="true"
                    ></span>
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>

    <section class="mt-6" aria-labelledby="month-events">
      <h3 id="month-events" class="text-lg">{{ 'calendar.eventsThisMonth' | t }}</h3>
      @if (monthEvents().length) {
        <ul class="mt-3 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          @for (event of monthEvents(); track event.id) {
            <li class="px-4 py-3">
              <p class="font-semibold">{{ titleOf(event) }}</p>
              <p class="text-sm text-ink-muted">{{ range(event) }}</p>
            </li>
          }
        </ul>
      } @else {
        <p class="mt-2 text-ink-muted">{{ 'calendar.noEvents' | t }}</p>
      }
    </section>
  `,
})
export class MonthCalendar {
  private readonly language = inject(LanguageService);

  readonly month = input.required<MonthRef>();
  readonly events = input<readonly CalendarEvent[]>([]);
  /** ISO date of "today", highlighted when visible. */
  readonly today = input<string>('');

  protected readonly weeks = computed(() => monthWeeks(this.month()));
  protected readonly previousKey = computed(() => monthKey(shiftMonth(this.month(), -1)));
  protected readonly nextKey = computed(() => monthKey(shiftMonth(this.month(), 1)));
  protected readonly title = computed(() => {
    const { year, month } = this.month();
    return new Intl.DateTimeFormat(LOCALES[this.language.lang()], {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  });
  protected readonly weekdays = computed(() => {
    const locale = LOCALES[this.language.lang()];
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
    // 2023-01-01 was a Sunday.
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.UTC(2023, 0, 1 + i));
      return { short: short.format(date), long: long.format(date) };
    });
  });
  protected readonly monthEvents = computed(() => {
    const prefix = monthKey(this.month());
    return this.events()
      .filter((e) => e.startDate.startsWith(prefix) || (e.endDate ?? '').startsWith(prefix))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  });

  protected digits(day: number): string {
    return formatNumber(day, this.language.lang());
  }

  protected hasEvent(iso: string): boolean {
    return this.events().some((event) => occursOn(event, iso));
  }

  protected titleOf(event: CalendarEvent): string {
    return pickLocalized(event.title, this.language.lang());
  }

  protected range(event: CalendarEvent): string {
    const format = new Intl.DateTimeFormat(LOCALES[this.language.lang()], {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
    const at = (iso: string) => format.format(new Date(`${iso}T00:00:00Z`));
    return event.endDate && event.endDate !== event.startDate
      ? `${at(event.startDate)} – ${at(event.endDate)}`
      : at(event.startDate);
  }
}

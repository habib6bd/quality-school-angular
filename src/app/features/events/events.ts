import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { SchoolEvent } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';
import { paginate } from '../../core/util/paginate';
import { todayIso } from '../../core/util/today';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { EventCard } from '../../shared/components/event-card/event-card';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { Pagination } from '../../shared/components/pagination/pagination';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export const EVENTS_PAGE_SIZE = 9;
export type EventView = 'upcoming' | 'past';

/** Events list with an upcoming / past switch. The school has published no events yet. */
@Component({
  selector: 'app-events-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AsyncState,
    EventCard,
    PageScaffold,
    Pagination,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="events" [intro]="'events.intro' | t">
      <nav [attr.aria-label]="'events.viewLabel' | t">
        <ul class="flex flex-wrap gap-2">
          @for (option of views; track option.value) {
            @let active = option.value === activeView();
            <li>
              <a
                [routerLink]="'events' | pagePath"
                [queryParams]="{
                  view: option.value === 'upcoming' ? null : option.value,
                  page: null,
                }"
                class="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors"
                [class]="
                  active
                    ? 'border-primary-700 bg-primary-700 text-white'
                    : 'border-stone-300 bg-white text-secondary-950 hover:bg-primary-50'
                "
                [attr.aria-current]="active ? 'true' : null"
                >{{ option.label | t }}</a
              >
            </li>
          }
        </ul>
      </nav>

      <app-async-state
        class="mt-6 block"
        [status]="events.status()"
        [empty]="events.value().length === 0"
        [emptyTitle]="
          (activeView() === 'upcoming' ? 'events.emptyTitle' : 'events.emptyPastTitle') | t
        "
        [emptyMessage]="
          (activeView() === 'upcoming' ? 'events.emptyMessage' : 'events.emptyPastMessage') | t
        "
        emptyIcon="calendar"
        (retry)="events.reload()"
      >
        <ul class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (event of paged().items; track event.slug) {
            <li><app-event-card [event]="event" [link]="'events' | pagePath: event.slug" /></li>
          }
        </ul>
        <div class="mt-8">
          <app-pagination
            [page]="paged().page"
            [totalPages]="paged().totalPages"
            (pageChange)="goToPage($event)"
          />
        </div>
      </app-async-state>
    </app-page-scaffold>
  `,
})
export class EventsPage {
  private readonly service = inject(EventService);
  private readonly router = inject(Router);

  /** Query parameters, bound by `withComponentInputBinding`. */
  readonly view = input<string>();
  readonly page = input<string>();

  protected readonly views = [
    { value: 'upcoming', label: 'events.upcoming' },
    { value: 'past', label: 'events.past' },
  ] as const;
  protected readonly activeView = computed<EventView>(() =>
    this.view() === 'past' ? 'past' : 'upcoming',
  );
  protected readonly events = rxResource({
    params: () => this.activeView(),
    stream: ({ params }) => {
      const today = todayIso();
      return params === 'past' ? this.service.past(today) : this.service.upcoming(today);
    },
    defaultValue: [] as readonly SchoolEvent[],
  });
  protected readonly paged = computed(() =>
    paginate(this.events.value(), this.page(), EVENTS_PAGE_SIZE),
  );

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }
}

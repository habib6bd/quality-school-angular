import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SchoolEvent } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';
import { todayIso } from '../../../core/util/today';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { Icon } from '../../../shared/components/icon/icon';
import { LocaleDatePipe } from '../../../shared/pipes/locale-format.pipes';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-events',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncState,
    ContentSection,
    Icon,
    LocaleDatePipe,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-content-section tone="white" [title]="'home.eventsTitle' | t" [link]="'events' | pagePath">
      <app-async-state
        [status]="events.status()"
        [empty]="events.value().length === 0"
        [emptyTitle]="'events.emptyTitle' | t"
        [emptyMessage]="'events.emptyMessage' | t"
        emptyIcon="calendar"
        (retry)="events.reload()"
      >
        <ul class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (event of events.value(); track event.slug) {
            <li class="card p-5">
              <p class="inline-flex items-center gap-2 text-sm font-medium text-primary-800">
                <app-icon name="calendar" [size]="16" />
                <time [attr.datetime]="event.startDate">{{ event.startDate | localeDate }}</time>
              </p>
              <h3 class="mt-2 text-lg">{{ event.title | localize }}</h3>
              <p class="mt-1 text-sm text-ink-muted">{{ event.summary | localize }}</p>
            </li>
          }
        </ul>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeEvents {
  private readonly service = inject(EventService);

  protected readonly events = rxResource({
    stream: () => this.service.upcoming(todayIso(), 3),
    defaultValue: [] as readonly SchoolEvent[],
  });
}

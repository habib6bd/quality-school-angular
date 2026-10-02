import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Facility } from '../../core/models/facility.model';
import { FacilityService } from '../../core/services/facility.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-facilities-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    AsyncState,
    Icon,
    PageScaffold,
    PendingNote,
    RelatedLinks,
    LocalizePipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="about/facilities" [intro]="'facilitiesPage.intro' | t">
      <div class="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
        <app-async-state
          [status]="facilities.status()"
          [empty]="facilities.value().length === 0"
          skeleton="list"
          [skeletonCount]="6"
          (retry)="facilities.reload()"
        >
          <ul class="grid gap-4 sm:grid-cols-2">
            @for (item of facilities.value(); track item.id) {
              <li class="card flex gap-4 p-5">
                <span
                  class="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"
                >
                  <app-icon [name]="item.icon" [size]="24" />
                </span>
                <div>
                  <h2 class="text-lg">{{ item.title | localize }}</h2>
                  <p class="mt-1 text-sm text-ink-muted">{{ item.description | localize }}</p>
                </div>
              </li>
            }
          </ul>
        </app-async-state>
        <figure>
          <img
            ngSrc="images/bqes/banners/banner-1.webp"
            width="594"
            height="335"
            [alt]="'facilitiesPage.imageAlt' | t"
            class="w-full rounded-2xl object-cover shadow-[var(--shadow-card)]"
          />
        </figure>
      </div>
      <app-pending-note class="mt-10 block" [message]="'facilitiesPage.note' | t" />
      <app-related-links class="mt-12 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class FacilitiesPage {
  private readonly service = inject(FacilityService);

  protected readonly facilities = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Facility[],
  });
  protected readonly related = ['about', 'academics', 'gallery'] as const;
}

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Facility } from '../../../core/models/facility.model';
import { FacilityService } from '../../../core/services/facility.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { Icon } from '../../../shared/components/icon/icon';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-facilities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    AsyncState,
    ContentSection,
    Icon,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-content-section
      tone="white"
      [title]="'home.facilitiesTitle' | t"
      [description]="'home.facilitiesDescription' | t"
      [link]="'about/facilities' | pagePath"
    >
      <div class="grid items-start gap-8 lg:grid-cols-[1fr_1.2fr]">
        <figure>
          <img
            ngSrc="images/bqes/banners/banner-1.webp"
            width="594"
            height="335"
            [alt]="'home.facilitiesImageAlt' | t"
            class="w-full rounded-2xl object-cover shadow-[var(--shadow-card)]"
          />
        </figure>
        <app-async-state
          [status]="facilities.status()"
          [empty]="facilities.value().length === 0"
          skeleton="list"
          (retry)="facilities.reload()"
        >
          <ul class="grid gap-3 sm:grid-cols-2">
            @for (item of facilities.value(); track item.id) {
              <li class="flex items-start gap-3 rounded-xl bg-surface-muted p-4">
                <app-icon [name]="item.icon" [size]="22" class="mt-0.5 text-primary-700" />
                <span class="font-medium text-secondary-950">{{ item.title | localize }}</span>
              </li>
            }
          </ul>
        </app-async-state>
      </div>
    </app-content-section>
  `,
})
export class HomeFacilities {
  private readonly service = inject(FacilityService);

  protected readonly facilities = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Facility[],
  });
}

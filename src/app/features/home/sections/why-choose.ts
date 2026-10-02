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
  selector: 'app-home-why-choose',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, Icon, LocalizePipe, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section
      tone="white"
      [title]="'home.whyTitle' | t"
      [description]="'home.whyDescription' | t"
      [link]="'about/facilities' | pagePath"
      [linkLabel]="'nav.facilities' | t"
    >
      <app-async-state
        [status]="highlights.status()"
        [empty]="highlights.value().length === 0"
        (retry)="highlights.reload()"
      >
        <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (item of highlights.value(); track item.id) {
            <li class="card flex gap-4 p-5">
              <span
                class="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"
              >
                <app-icon [name]="item.icon" [size]="24" />
              </span>
              <div>
                <h3 class="text-lg">{{ item.title | localize }}</h3>
                <p class="mt-1 text-sm text-ink-muted">{{ item.description | localize }}</p>
              </div>
            </li>
          }
          <li class="card flex gap-4 p-5">
            <span
              class="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary-100 text-secondary-800"
            >
              <app-icon name="globe" [size]="24" />
            </span>
            <div>
              <h3 class="text-lg">{{ 'home.whyMediumTitle' | t }}</h3>
              <p class="mt-1 text-sm text-ink-muted">{{ 'home.whyMediumText' | t }}</p>
            </div>
          </li>
          <li class="card flex gap-4 p-5">
            <span
              class="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary-100 text-secondary-800"
            >
              <app-icon name="book" [size]="24" />
            </span>
            <div>
              <h3 class="text-lg">{{ 'home.whyGroupsTitle' | t }}</h3>
              <p class="mt-1 text-sm text-ink-muted">{{ 'home.whyGroupsText' | t }}</p>
            </div>
          </li>
        </ul>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeWhyChoose {
  private readonly facilities = inject(FacilityService);

  protected readonly highlights = rxResource({
    stream: () => this.facilities.highlights(),
    defaultValue: [] as readonly Facility[],
  });
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SchoolClass } from '../../core/models/school-class.model';
import { SchoolClassService } from '../../core/services/school-class.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-programs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AsyncState,
    Icon,
    PageScaffold,
    RelatedLinks,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="academics/programs" [intro]="'programsPage.intro' | t">
      <div class="grid gap-5 md:grid-cols-2">
        <section aria-labelledby="medium-title" class="card p-6">
          <h2 id="medium-title" class="text-lg">{{ 'programsPage.mediumTitle' | t }}</h2>
          <p class="mt-1 text-ink-muted">{{ 'programsPage.mediumText' | t }}</p>
        </section>
        <section aria-labelledby="groups-title" class="card p-6">
          <h2 id="groups-title" class="text-lg">{{ 'programsPage.groupsTitle' | t }}</h2>
          <p class="mt-1 text-ink-muted">{{ 'programsPage.groupsText' | t }}</p>
        </section>
      </div>

      <section aria-labelledby="classes-title" class="mt-12">
        <h2 id="classes-title" class="text-2xl sm:text-3xl">{{ 'programsPage.allClasses' | t }}</h2>
        <app-async-state
          class="mt-6 block"
          [status]="classes.status()"
          [empty]="classes.value().length === 0"
          skeleton="list"
          [skeletonCount]="6"
          (retry)="classes.reload()"
        >
          <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (item of classes.value(); track item.slug) {
              <li class="relative card card-interactive p-5">
                <h3 class="text-lg">
                  <a
                    [routerLink]="'academics/programs' | pagePath: item.slug"
                    class="after:absolute after:inset-0 hover:text-primary-700"
                    >{{ item.name | localize }}</a
                  >
                </h3>
                @if (item.groups.length) {
                  <p class="mt-1 text-sm text-ink-muted">
                    @for (group of item.groups; track group; let last = $last) {
                      {{
                        (group === 'science' ? 'programs.group.science' : 'programs.group.business')
                          | t
                      }}{{ last ? '' : ' · ' }}
                    }
                  </p>
                }
                <span
                  class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700"
                  aria-hidden="true"
                >
                  {{ 'programsPage.viewClass' | t }} <app-icon name="arrowRight" [size]="16" />
                </span>
              </li>
            }
          </ul>
        </app-async-state>
      </section>

      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class ProgramsPage {
  private readonly service = inject(SchoolClassService);

  protected readonly classes = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly SchoolClass[],
  });
  protected readonly related = ['academics', 'admission', 'academics/calendar'] as const;
}

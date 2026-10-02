import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SchoolClass } from '../../../core/models/school-class.model';
import { SchoolClassService } from '../../../core/services/school-class.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-programs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, LocalizePipe, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section
      tone="white"
      [eyebrow]="'nav.academics' | t"
      [title]="'nav.programs' | t"
      [description]="'home.programsDescription' | t"
      [link]="'academics/programs' | pagePath"
    >
      <app-async-state
        [status]="classes.status()"
        [empty]="classes.value().length === 0"
        skeleton="list"
        [skeletonCount]="4"
        (retry)="classes.reload()"
      >
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          @for (item of classes.value(); track item.slug) {
            <li class="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
              <p class="font-display font-semibold text-primary-900">{{ item.name | localize }}</p>
              @if (item.groups.length) {
                <p class="mt-0.5 text-xs text-primary-800">
                  @for (group of item.groups; track group; let last = $last) {
                    {{
                      (group === 'science' ? 'programs.group.science' : 'programs.group.business')
                        | t
                    }}{{ last ? '' : ' · ' }}
                  }
                </p>
              }
            </li>
          }
        </ul>
        <p class="mt-5 text-sm text-ink-muted">{{ 'home.programsNote' | t }}</p>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomePrograms {
  private readonly service = inject(SchoolClassService);

  protected readonly classes = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly SchoolClass[],
  });
}

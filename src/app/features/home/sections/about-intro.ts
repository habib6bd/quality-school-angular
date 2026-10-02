import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SchoolInfoService } from '../../../core/services/school-info.service';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { ButtonDirective } from '../../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../../shared/pipes/locale-format.pipes';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContentSection,
    RouterLink,
    ButtonDirective,
    LocaleNumberPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-content-section [eyebrow]="'nav.about' | t" [title]="'nav.aboutSchool' | t">
      <div class="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div class="prose-content max-w-none text-base sm:text-lg">
          <p>{{ 'home.aboutP1' | t }}</p>
          <p>{{ 'home.aboutP2' | t }}</p>
          <p>{{ 'home.aboutP3' | t }}</p>
          <a appButton class="mt-6" [routerLink]="'about' | pagePath">{{ 'home.aboutMore' | t }}</a>
        </div>
        @if (stats(); as stats) {
          <div>
            <dl class="grid grid-cols-3 gap-3 text-center">
              @for (stat of stats; track stat.label) {
                <div class="card flex flex-col p-4">
                  <dt class="order-2 text-sm font-medium text-ink-muted">{{ stat.label | t }}</dt>
                  <dd class="font-display text-3xl font-bold text-primary-700">
                    {{ stat.value | localeNumber }}
                  </dd>
                </div>
              }
            </dl>
            <p class="mt-3 text-sm text-ink-muted">{{ 'home.statsNote' | t }}</p>
          </div>
        }
      </div>
    </app-content-section>
  `,
})
export class HomeAbout {
  private readonly info = inject(SchoolInfoService).info;

  /** Student, teacher and campus counts as published on the school's existing website. */
  protected readonly stats = computed(() => {
    const stats = this.info().stats;
    return stats
      ? ([
          { label: 'home.statStudents', value: stats.students },
          { label: 'home.statTeachers', value: stats.teachers },
          { label: 'home.statCampus', value: stats.campuses },
        ] as const)
      : null;
  });
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../core/i18n/translation.service';
import { SeoService } from '../../core/seo/seo.service';
import { ResponseStatusService } from '../../core/services/response-status.service';
import { TeacherService } from '../../core/services/teacher.service';
import { Avatar } from '../../shared/components/avatar/avatar';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { DESIGNATION_LABELS } from '../../shared/components/teacher-card/teacher-card';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { NotFound } from '../not-found/not-found';

/** Profile page for one staff member: only the published name and designation. */
@Component({
  selector: 'app-teacher-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Avatar,
    ButtonDirective,
    Icon,
    NotFound,
    PageScaffold,
    PendingNote,
    Skeleton,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    @if (detail.value(); as teacher) {
      <app-page-scaffold
        page="teachers"
        [detailTitle]="teacher.name"
        [detailDescription]="description()"
        [intro]="description()"
      >
        <article class="grid max-w-3xl gap-8 sm:grid-cols-[auto_1fr] sm:items-start">
          <app-avatar [name]="teacher.name" size="xl" />
          <div>
            <h2 class="text-2xl" lang="en">{{ teacher.name }}</h2>
            <dl class="mt-3">
              <dt class="text-sm font-semibold text-ink-muted">
                {{ 'teachers.designationLabel' | t }}
              </dt>
              <dd class="text-lg font-semibold text-primary-800">{{ designation() | t }}</dd>
            </dl>
            <p class="mt-5 text-ink-muted">{{ 'teachers.contactNote' | t }}</p>
            <a
              appButton
              variant="outline"
              size="sm"
              class="mt-4"
              [routerLink]="'contact' | pagePath"
            >
              {{ 'nav.contact' | t }}
            </a>
          </div>
        </article>
        <app-pending-note class="mt-10 block max-w-3xl" [message]="'teachers.profilePending' | t" />
        <p class="mt-10">
          <a
            [routerLink]="'teachers' | pagePath"
            class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
          >
            <app-icon name="chevronLeft" [size]="18" /> {{ 'teachers.backToList' | t }}
          </a>
        </p>
      </app-page-scaffold>
    } @else if (detail.status() === 'resolved') {
      <app-not-found />
    } @else {
      <div class="container-page section"><app-skeleton variant="text" [count]="3" /></div>
    }
  `,
})
export class TeacherDetailPage {
  private readonly service = inject(TeacherService);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly status = inject(ResponseStatusService);

  /** Route parameter, bound by `withComponentInputBinding`. */
  readonly slug = input.required<string>();

  protected readonly detail = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.service.bySlug(params),
  });
  protected readonly designation = computed(() => {
    const teacher = this.detail.value();
    return DESIGNATION_LABELS[teacher?.designation ?? 'teacher'];
  });
  protected readonly description = computed(() => {
    const teacher = this.detail.value();
    return teacher
      ? this.i18n.t('teachers.detailIntro', {
          name: teacher.name,
          designation: this.i18n.t(this.designation()),
        })
      : '';
  });

  constructor() {
    effect(() => {
      if (this.detail.status() !== 'resolved' || this.detail.value()) return;
      this.status.notFound();
      this.seo.setPage({ title: this.i18n.t('notFound.title') });
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationService } from '../../core/i18n/translation.service';
import { SeoService } from '../../core/seo/seo.service';
import { ResponseStatusService } from '../../core/services/response-status.service';
import { SchoolClassService } from '../../core/services/school-class.service';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { NotFound } from '../not-found/not-found';

/** Class information page (`academics/programs/:slug`): only the basics the school has published. */
@Component({
  selector: 'app-class-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonDirective,
    Icon,
    NotFound,
    PageScaffold,
    PendingNote,
    RelatedLinks,
    Skeleton,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    @if (detail.value(); as data) {
      <app-page-scaffold
        page="academics/programs"
        [detailTitle]="name()"
        [detailDescription]="intro()"
        [intro]="intro()"
      >
        <dl class="grid max-w-3xl gap-4 sm:grid-cols-2">
          <div class="card p-5">
            <dt class="text-sm font-semibold text-ink-muted">{{ 'classPage.order' | t }}</dt>
            <dd class="mt-1 text-lg font-semibold">
              {{ 'classPage.orderValue' | t: { order: data.item.order } }}
            </dd>
          </div>
          <div class="card p-5">
            <dt class="text-sm font-semibold text-ink-muted">{{ 'classPage.medium' | t }}</dt>
            <dd class="mt-1 text-lg font-semibold">{{ 'programsPage.mediumText' | t }}</dd>
          </div>
        </dl>

        <section aria-labelledby="class-groups" class="mt-10 max-w-3xl">
          <h2 id="class-groups" class="text-xl sm:text-2xl">{{ 'classPage.groups' | t }}</h2>
          @if (data.item.groups.length) {
            <ul class="mt-4 flex flex-wrap gap-3">
              @for (group of data.item.groups; track group) {
                <li class="rounded-full bg-primary-100 px-4 py-2 font-semibold text-primary-900">
                  {{
                    (group === 'science' ? 'programs.group.science' : 'programs.group.business') | t
                  }}
                </li>
              }
            </ul>
          } @else {
            <p class="mt-3 text-ink-muted">{{ 'classPage.noGroups' | t }}</p>
          }
        </section>

        <section aria-labelledby="class-pending" class="mt-10 max-w-3xl">
          <h2 id="class-pending" class="text-xl sm:text-2xl">{{ 'classPage.pendingTitle' | t }}</h2>
          <app-pending-note class="mt-4 block" [message]="'classPage.pending' | t" />
        </section>

        <nav
          class="mt-12 flex flex-wrap items-center justify-between gap-4"
          [attr.aria-label]="'classPage.allClasses' | t"
        >
          @if (data.previous; as previous) {
            <a
              appButton
              variant="outline"
              [routerLink]="'academics/programs' | pagePath: previous.slug"
            >
              <app-icon name="chevronLeft" [size]="18" />
              <span class="sr-only">{{ 'classPage.previous' | t }}: </span
              >{{ previous.name | localize }}
            </a>
          } @else {
            <span></span>
          }
          <a appButton variant="ghost" [routerLink]="'academics/programs' | pagePath">{{
            'classPage.allClasses' | t
          }}</a>
          @if (data.next; as next) {
            <a
              appButton
              variant="outline"
              [routerLink]="'academics/programs' | pagePath: next.slug"
            >
              <span class="sr-only">{{ 'classPage.next' | t }}: </span>{{ next.name | localize }}
              <app-icon name="chevronRight" [size]="18" />
            </a>
          }
        </nav>

        <div class="mt-10">
          <a appButton [routerLink]="'admission' | pagePath">
            {{ 'classPage.admission' | t }} <app-icon name="arrowRight" [size]="18" />
          </a>
        </div>
        <app-related-links class="mt-12 block" [paths]="related" />
      </app-page-scaffold>
    } @else if (detail.status() === 'resolved') {
      <app-not-found />
    } @else {
      <div class="container-page section"><app-skeleton variant="text" [count]="4" /></div>
    }
  `,
})
export class ClassDetailPage {
  private readonly service = inject(SchoolClassService);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly status = inject(ResponseStatusService);

  /** Route parameter, bound by `withComponentInputBinding`. */
  readonly slug = input.required<string>();

  protected readonly detail = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.service.bySlug(params),
  });
  protected readonly name = computed(() => {
    const data = this.detail.value();
    return data ? pickLocalized(data.item.name, this.language.lang()) : '';
  });
  protected readonly intro = computed(() => this.i18n.t('classPage.intro', { name: this.name() }));
  protected readonly related = ['academics/programs', 'admission', 'academics'] as const;

  constructor() {
    effect(() => {
      if (this.detail.status() !== 'resolved' || this.detail.value()) return;
      this.status.notFound();
      this.seo.setPage({ title: this.i18n.t('notFound.title'), noindex: true });
    });
  }
}

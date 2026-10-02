import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationService } from '../../core/i18n/translation.service';
import { SeoService } from '../../core/seo/seo.service';
import { eventJsonLd } from '../../core/seo/structured-data';
import { EventService } from '../../core/services/event.service';
import { ResponseStatusService } from '../../core/services/response-status.service';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { LocaleDatePipe } from '../../shared/pipes/locale-format.pipes';
import { LocalizedLangPipe, LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { NotFound } from '../not-found/not-found';

@Component({
  selector: 'app-event-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    Icon,
    NotFound,
    PageScaffold,
    Skeleton,
    LocaleDatePipe,
    LocalizePipe,
    LocalizedLangPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    @if (detail.value(); as event) {
      <app-page-scaffold page="events" [detailTitle]="title()" [detailDescription]="summary()">
        <article class="max-w-3xl">
          <dl class="grid gap-4 sm:grid-cols-2">
            <div class="card p-5">
              <dt class="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted">
                <app-icon name="calendar" [size]="16" /> {{ 'events.when' | t }}
              </dt>
              <dd class="mt-1 font-semibold">
                <time [attr.datetime]="event.startDate">{{ event.startDate | localeDate }}</time>
                @if (event.endDate; as end) {
                  – <time [attr.datetime]="end">{{ end | localeDate }}</time>
                }
              </dd>
            </div>
            @if (event.location; as location) {
              <div class="card p-5">
                <dt class="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted">
                  <app-icon name="mapPin" [size]="16" /> {{ 'events.where' | t }}
                </dt>
                <dd class="mt-1 font-semibold" [lang]="location | localizedLang">
                  {{ location | localize }}
                </dd>
              </div>
            }
          </dl>
          @if (event.image; as image) {
            <img
              [ngSrc]="image.src"
              [width]="image.width"
              [height]="image.height"
              [alt]="image.alt | localize"
              class="mt-6 h-auto w-full rounded-2xl"
              priority
            />
          }
          <div
            class="prose-content mt-6 max-w-none text-base sm:text-lg"
            [lang]="event.body | localizedLang"
          >
            @for (paragraph of body(); track $index) {
              <p>{{ paragraph }}</p>
            }
          </div>
          <p class="mt-10">
            <a
              [routerLink]="'events' | pagePath"
              class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
            >
              <app-icon name="chevronLeft" [size]="18" /> {{ 'events.backToList' | t }}
            </a>
          </p>
        </article>
      </app-page-scaffold>
    } @else if (detail.status() === 'resolved') {
      <app-not-found />
    } @else {
      <div class="container-page section"><app-skeleton variant="text" [count]="3" /></div>
    }
  `,
})
export class EventDetailPage {
  private readonly service = inject(EventService);
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
  protected readonly title = computed(() => {
    const event = this.detail.value();
    return event ? pickLocalized(event.title, this.language.lang()) : '';
  });
  protected readonly summary = computed(() => {
    const event = this.detail.value();
    return event ? pickLocalized(event.summary, this.language.lang()) : '';
  });
  protected readonly body = computed(() => {
    const event = this.detail.value();
    return event ? pickLocalized(event.body, this.language.lang()) : [];
  });

  constructor() {
    // Structured data only for a real, loaded event.
    effect(() => {
      const event = this.detail.value();
      if (event) {
        const lang = this.language.lang();
        this.seo.addStructuredData('event', eventJsonLd(event, lang, this.seo.currentUrl(lang)));
      }
    });
    effect(() => {
      if (this.detail.status() !== 'resolved' || this.detail.value()) return;
      this.status.notFound();
      this.seo.setPage({ title: this.i18n.t('notFound.title'), noindex: true });
    });
  }
}

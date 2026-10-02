import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationService } from '../../core/i18n/translation.service';
import { SeoService } from '../../core/seo/seo.service';
import { newsArticleJsonLd } from '../../core/seo/structured-data';
import { NewsService } from '../../core/services/news.service';
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
  selector: 'app-news-detail-page',
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
    @if (detail.value(); as article) {
      <app-page-scaffold page="news" [detailTitle]="title()" [detailDescription]="summary()">
        <article class="max-w-3xl">
          <p class="inline-flex items-center gap-1 text-sm text-ink-muted">
            <app-icon name="calendar" [size]="14" />
            <span class="sr-only">{{ 'news.published' | t }}: </span>
            <time [attr.datetime]="article.publishedAt">{{
              article.publishedAt | localeDate
            }}</time>
          </p>
          @if (article.image; as image) {
            <img
              [ngSrc]="image.src"
              [width]="image.width"
              [height]="image.height"
              [alt]="image.alt | localize"
              class="mt-5 h-auto w-full rounded-2xl"
              priority
            />
          }
          <div
            class="prose-content mt-6 max-w-none text-base sm:text-lg"
            [lang]="article.body | localizedLang"
          >
            @for (paragraph of body(); track $index) {
              <p>{{ paragraph }}</p>
            }
          </div>
          <p class="mt-10">
            <a
              [routerLink]="'news' | pagePath"
              class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
            >
              <app-icon name="chevronLeft" [size]="18" /> {{ 'news.backToList' | t }}
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
export class NewsDetailPage {
  private readonly service = inject(NewsService);
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
    const article = this.detail.value();
    return article ? pickLocalized(article.title, this.language.lang()) : '';
  });
  protected readonly summary = computed(() => {
    const article = this.detail.value();
    return article ? pickLocalized(article.summary, this.language.lang()) : '';
  });
  protected readonly body = computed(() => {
    const article = this.detail.value();
    return article ? pickLocalized(article.body, this.language.lang()) : [];
  });

  constructor() {
    // Structured data only for a real, loaded article.
    effect(() => {
      const article = this.detail.value();
      if (article) {
        const lang = this.language.lang();
        this.seo.addStructuredData(
          'article',
          newsArticleJsonLd(article, lang, this.seo.currentUrl(lang)),
        );
      }
    });
    effect(() => {
      if (this.detail.status() !== 'resolved' || this.detail.value()) return;
      this.status.notFound();
      this.seo.setPage({ title: this.i18n.t('notFound.title'), noindex: true });
    });
  }
}

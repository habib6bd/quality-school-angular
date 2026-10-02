import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NewsArticle } from '../../core/models/news.model';
import { NewsService } from '../../core/services/news.service';
import { paginate } from '../../core/util/paginate';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { NewsCard } from '../../shared/components/news-card/news-card';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { Pagination } from '../../shared/components/pagination/pagination';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export const NEWS_PAGE_SIZE = 9;

/** News list. The school has not published any news yet, so the page shows an honest empty state. */
@Component({
  selector: 'app-news-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncState,
    NewsCard,
    PageScaffold,
    RelatedLinks,
    Pagination,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="news" [intro]="'news.intro' | t">
      <h2 class="sr-only">{{ 'news.listHeading' | t }}</h2>
      <app-async-state
        [status]="articles.status()"
        [empty]="articles.value().length === 0"
        [emptyTitle]="'news.emptyTitle' | t"
        [emptyMessage]="'news.emptyMessage' | t"
        emptyIcon="file"
        (retry)="articles.reload()"
      >
        <ul class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (article of paged().items; track article.slug) {
            <li><app-news-card [article]="article" [link]="'news' | pagePath: article.slug" /></li>
          }
        </ul>
        <div class="mt-8">
          <app-pagination
            [page]="paged().page"
            [totalPages]="paged().totalPages"
            (pageChange)="goToPage($event)"
          />
        </div>
      </app-async-state>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class NewsPage {
  protected readonly related = ['notices', 'events', 'gallery'] as const;
  private readonly service = inject(NewsService);
  private readonly router = inject(Router);

  /** Query parameter, bound by `withComponentInputBinding`. */
  readonly page = input<string>();

  protected readonly articles = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly NewsArticle[],
  });
  protected readonly paged = computed(() =>
    paginate(this.articles.value(), this.page(), NEWS_PAGE_SIZE),
  );

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }
}

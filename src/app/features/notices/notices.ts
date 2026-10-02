import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslationKey } from '../../core/i18n/translation.service';
import { Notice, NoticeCategory } from '../../core/models/notice.model';
import { NoticeService } from '../../core/services/notice.service';
import { paginate } from '../../core/util/paginate';
import { AsyncState } from '../../shared/components/async-state/async-state';
import {
  NOTICE_CATEGORY_LABELS,
  NoticeCard,
} from '../../shared/components/notice-card/notice-card';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { Pagination } from '../../shared/components/pagination/pagination';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export const NOTICES_PAGE_SIZE = 6;
const CATEGORIES = Object.keys(NOTICE_CATEGORY_LABELS) as NoticeCategory[];
export type CategoryFilter = NoticeCategory | 'all';

export function isNoticeCategory(value: unknown): value is NoticeCategory {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value);
}

interface Chip {
  value: CategoryFilter;
  label: TranslationKey;
}

const CHIPS: readonly Chip[] = [
  { value: 'all', label: 'notices.all' },
  ...CATEGORIES.map((value) => ({ value, label: NOTICE_CATEGORY_LABELS[value] })),
];

/** Notice board. Category and page live in the URL (`?category=exam&page=2`). */
@Component({
  selector: 'app-notices-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AsyncState,
    ButtonDirective,
    NoticeCard,
    PageScaffold,
    RelatedLinks,
    Pagination,
    LocaleNumberPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="notices" [intro]="'notices.intro' | t">
      <nav [attr.aria-label]="'notices.filterLabel' | t">
        <ul class="flex flex-wrap gap-2">
          @for (chip of chips; track chip.value) {
            @let active = chip.value === activeCategory();
            <li>
              <a
                [routerLink]="'notices' | pagePath"
                [queryParams]="{ category: chip.value === 'all' ? null : chip.value, page: null }"
                class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors"
                [class]="
                  active
                    ? 'border-primary-700 bg-primary-700 text-white'
                    : 'border-stone-300 bg-white text-secondary-950 hover:bg-primary-50'
                "
                [attr.aria-current]="active ? 'true' : null"
              >
                {{ chip.label | t }}
                <span
                  class="rounded-full px-2 text-xs"
                  [class]="active ? 'bg-white/20' : 'bg-stone-100'"
                  >{{ count(chip.value) | localeNumber }}</span
                >
              </a>
            </li>
          }
        </ul>
      </nav>

      <p class="mt-5 text-sm text-ink-muted" role="status" aria-live="polite">
        {{ 'notices.showing' | t: { shown: paged().items.length, total: filtered().length } }}
      </p>

      <app-async-state
        class="mt-4 block"
        [status]="notices.status()"
        [empty]="filtered().length === 0"
        [emptyTitle]="
          (activeCategory() === 'all' ? 'notices.emptyTitle' : 'notices.emptyFilterTitle') | t
        "
        [emptyMessage]="
          (activeCategory() === 'all' ? 'notices.emptyMessage' : 'notices.emptyFilterMessage') | t
        "
        emptyIcon="bell"
        (retry)="notices.reload()"
      >
        <ul class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (notice of paged().items; track notice.slug) {
            <li>
              <app-notice-card [notice]="notice" [link]="'notices' | pagePath: notice.slug" />
            </li>
          }
        </ul>
        <a empty appButton variant="outline" [routerLink]="'notices' | pagePath">{{
          'notices.clearFilters' | t
        }}</a>
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
export class NoticesPage {
  protected readonly related = ['admission', 'academics/calendar', 'results'] as const;
  private readonly service = inject(NoticeService);
  private readonly router = inject(Router);

  /** Query parameters, bound by `withComponentInputBinding`. */
  readonly category = input<string>();
  readonly page = input<string>();

  protected readonly chips = CHIPS;
  protected readonly notices = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Notice[],
  });
  protected readonly activeCategory = computed<CategoryFilter>(() => {
    const value = this.category();
    return isNoticeCategory(value) ? value : 'all';
  });
  protected readonly filtered = computed(() => {
    const category = this.activeCategory();
    return category === 'all'
      ? this.notices.value()
      : this.notices.value().filter((n) => n.category === category);
  });
  protected readonly paged = computed(() =>
    paginate(this.filtered(), this.page(), NOTICES_PAGE_SIZE),
  );

  protected count(value: CategoryFilter): number {
    return value === 'all'
      ? this.notices.value().length
      : this.notices.value().filter((n) => n.category === value).length;
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }
}

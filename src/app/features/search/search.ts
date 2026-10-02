import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  Injector,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationKey } from '../../core/i18n/translation.service';
import {
  highlightSegments,
  SEARCH_KINDS,
  searchEntries,
  SearchEntry,
  SearchHit,
  SearchKind,
  Segment,
  snippet,
  tokenize,
} from '../../core/search/search';
import { SearchIndexService } from '../../core/services/search-index.service';
import { paginate } from '../../core/util/paginate';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Badge } from '../../shared/components/badge/badge';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { Pagination } from '../../shared/components/pagination/pagination';
import { SearchBox } from '../../shared/components/search-box/search-box';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export const SEARCH_PAGE_SIZE = 10;
export type KindFilter = SearchKind | 'all';

export const KIND_LABELS: Record<SearchKind, TranslationKey> = {
  page: 'search.kind.page',
  teacher: 'search.kind.teacher',
  notice: 'search.kind.notice',
  news: 'search.kind.news',
  event: 'search.kind.event',
  resource: 'search.kind.resource',
};

export function isSearchKind(value: unknown): value is SearchKind {
  return typeof value === 'string' && (SEARCH_KINDS as readonly string[]).includes(value);
}

interface ResultRow {
  entry: SearchEntry;
  title: Segment[];
  snippet: Segment[];
}

const SUGGESTIONS = ['admission', 'notices', 'teachers', 'academics/programs', 'contact'] as const;

/**
 * Site search over the client-side index. The query, result group and page live in the URL
 * (`/search?q=&kind=&page=`). Keyboard: ArrowDown from the field enters the results, ArrowUp/
 * ArrowDown move between them, ArrowUp from the first result returns to the field.
 */
@Component({
  selector: 'app-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKeydown($event)' },
  imports: [
    RouterLink,
    AsyncState,
    Badge,
    ButtonDirective,
    EmptyState,
    PageScaffold,
    Pagination,
    SearchBox,
    LocaleNumberPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="search" [intro]="'search.intro' | t">
      <app-search-box
        #box
        [label]="'search.label' | t"
        [placeholder]="'common.searchPlaceholder' | t"
        [value]="query()"
        (valueChange)="onSearch($event)"
      />

      @if (tokens().length === 0) {
        <section class="mt-10" aria-labelledby="search-suggestions">
          <h2 id="search-suggestions" class="text-xl sm:text-2xl">
            {{ 'search.suggestionsTitle' | t }}
          </h2>
          <p class="mt-1 text-ink-muted">{{ 'search.hint' | t }}</p>
          <ul class="mt-5 flex flex-wrap gap-2">
            @for (path of suggestions; track path) {
              <li>
                <a
                  [routerLink]="path | pagePath"
                  class="inline-flex min-h-11 items-center rounded-full border border-primary-200 bg-white px-4 text-sm font-semibold text-primary-800 hover:bg-primary-50"
                  >{{ suggestionLabel(path) | t }}</a
                >
              </li>
            }
          </ul>
        </section>
      } @else {
        <nav class="mt-6" [attr.aria-label]="'search.kindLabel' | t">
          <ul class="flex flex-wrap gap-2">
            @for (chip of chips(); track chip.value) {
              @let active = chip.value === activeKind();
              <li>
                <a
                  [routerLink]="'search' | pagePath"
                  [queryParams]="{ kind: chip.value === 'all' ? null : chip.value, page: null }"
                  queryParamsHandling="merge"
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
                    >{{ chip.count | localeNumber }}</span
                  >
                </a>
              </li>
            }
          </ul>
        </nav>

        <p class="mt-5 text-sm text-ink-muted" role="status" aria-live="polite">
          {{ 'search.resultCount' | t: { count: kindHits().length, query: query().trim() } }}
        </p>

        <app-async-state
          class="mt-4 block"
          [status]="index.status()"
          [empty]="false"
          skeleton="list"
          [skeletonCount]="4"
          (retry)="index.reload()"
        >
          @if (kindHits().length) {
            <ul #results class="space-y-3">
              @for (row of rows(); track row.entry.id) {
                <li class="card relative p-5">
                  <app-badge tone="secondary">{{ kindLabel(row.entry.kind) | t }}</app-badge>
                  <h3 class="mt-2 text-lg leading-snug">
                    <a
                      data-result
                      [routerLink]="row.entry.path | pagePath"
                      class="after:absolute after:inset-0 hover:text-primary-700"
                    >
                      @for (part of row.title; track $index) {
                        @if (part.match) {
                          <mark
                            class="rounded bg-accent-200 px-0.5 text-inherit"
                            [textContent]="part.text"
                          ></mark>
                        } @else {
                          <span [textContent]="part.text"></span>
                        }
                      }
                    </a>
                  </h3>
                  <p class="mt-1 text-sm text-ink-muted">
                    @for (part of row.snippet; track $index) {
                      @if (part.match) {
                        <mark
                          class="rounded bg-accent-200 px-0.5 text-inherit"
                          [textContent]="part.text"
                        ></mark>
                      } @else {
                        <span [textContent]="part.text"></span>
                      }
                    }
                  </p>
                </li>
              }
            </ul>
            <div class="mt-8">
              <app-pagination
                [page]="paged().page"
                [totalPages]="paged().totalPages"
                (pageChange)="goToPage($event)"
              />
            </div>
          } @else {
            <app-empty-state
              icon="search"
              [title]="'search.noResultsTitle' | t: { query: query().trim() }"
              [message]="'search.noResultsText' | t"
            >
              <a appButton variant="outline" size="sm" [routerLink]="'contact' | pagePath">{{
                'nav.contact' | t
              }}</a>
            </app-empty-state>
          }
        </app-async-state>
      }
    </app-page-scaffold>
  `,
})
export class SearchPage {
  private readonly indexService = inject(SearchIndexService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly box = viewChild(SearchBox);
  private readonly results = viewChild<ElementRef<HTMLElement>>('results');

  /** Query parameters, bound by `withComponentInputBinding`. */
  readonly q = input<string>();
  readonly kind = input<string>();
  readonly page = input<string>();

  protected readonly suggestions = SUGGESTIONS;
  protected readonly index = rxResource({
    stream: () => this.indexService.entries(),
    defaultValue: [] as readonly SearchEntry[],
  });
  protected readonly query = linkedSignal(() => this.q() ?? '');
  protected readonly tokens = computed(() => tokenize(this.query()));
  protected readonly activeKind = computed<KindFilter>(() => {
    const value = this.kind();
    return isSearchKind(value) ? value : 'all';
  });
  /** Every match for the query, over all kinds (used for the chip counts). */
  private readonly allHits = computed<SearchHit[]>(() =>
    searchEntries(this.index.value(), this.query(), this.language.lang()),
  );
  protected readonly kindHits = computed(() => {
    const kind = this.activeKind();
    return kind === 'all' ? this.allHits() : this.allHits().filter((h) => h.entry.kind === kind);
  });
  protected readonly chips = computed(() => [
    {
      value: 'all' as KindFilter,
      label: 'search.all' as TranslationKey,
      count: this.allHits().length,
    },
    ...SEARCH_KINDS.map((value) => ({
      value: value as KindFilter,
      label: KIND_LABELS[value],
      count: this.allHits().filter((h) => h.entry.kind === value).length,
    })),
  ]);
  protected readonly paged = computed(() =>
    paginate(this.kindHits(), this.page(), SEARCH_PAGE_SIZE),
  );
  protected readonly rows = computed<ResultRow[]>(() => {
    const lang = this.language.lang();
    const tokens = this.tokens();
    return this.paged().items.map(({ entry }) => ({
      entry,
      title: highlightSegments(pickLocalized(entry.title, lang), tokens),
      snippet: highlightSegments(snippet(pickLocalized(entry.text, lang), tokens), tokens),
    }));
  });

  constructor() {
    // Someone who opened search without a query wants to type: put the cursor in the field.
    afterNextRender(() => {
      if (!this.q()) this.box()?.focus();
    });
  }

  protected kindLabel(kind: SearchKind): TranslationKey {
    return KIND_LABELS[kind];
  }

  protected suggestionLabel(path: string): TranslationKey {
    const labels: Record<string, TranslationKey> = {
      admission: 'nav.admissionInfo',
      notices: 'nav.notices',
      teachers: 'nav.teachers',
      'academics/programs': 'nav.programs',
      contact: 'nav.contact',
    };
    return labels[path] ?? 'nav.search';
  }

  protected onSearch(text: string): void {
    this.query.set(text);
    void this.router.navigate([], {
      queryParams: { q: text.trim() || null, page: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }

  /** Arrow-key navigation between the field and the results (events bubble up to the host). */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = this.links();
    const active = document.activeElement as HTMLElement | null;
    const at = active ? links.indexOf(active) : -1;
    if (at < 0) {
      // From the text field, ArrowDown enters the results.
      if (event.key === 'ArrowDown' && active?.matches('input[type="search"]') && links.length) {
        event.preventDefault();
        links[0].focus();
      }
      return;
    }
    event.preventDefault();
    if (event.key === 'ArrowDown') links[Math.min(at + 1, links.length - 1)].focus();
    else if (at === 0) this.box()?.focus();
    else links[at - 1].focus();
  }

  private links(): HTMLElement[] {
    return Array.from(
      this.results()?.nativeElement.querySelectorAll<HTMLElement>('a[data-result]') ?? [],
    );
  }
}

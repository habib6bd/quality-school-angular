import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationKey } from '../../core/i18n/translation.service';
import { FaqCategory, FaqItem } from '../../core/models/faq.model';
import { FaqService } from '../../core/services/faq.service';
import { Accordion, AccordionItem } from '../../shared/components/accordion/accordion';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { SearchBox } from '../../shared/components/search-box/search-box';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export type FaqFilter = FaqCategory | 'all';

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, TranslationKey> = {
  website: 'faq.category.website',
  admission: 'faq.category.admission',
  academics: 'faq.category.academics',
  contact: 'faq.category.contact',
};
const CATEGORIES = Object.keys(FAQ_CATEGORY_LABELS) as FaqCategory[];

export function isFaqCategory(value: unknown): value is FaqCategory {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value);
}

/** Category plus text search over the question and answer in the language being read. */
export function filterFaqs(
  items: readonly FaqItem[],
  category: FaqFilter,
  query: string,
  lang: Lang,
): readonly FaqItem[] {
  const needle = query.trim().toLocaleLowerCase();
  return items.filter((faq) => {
    if (category !== 'all' && faq.category !== category) return false;
    if (!needle) return true;
    const text = `${pickLocalized(faq.question, lang)} ${pickLocalized(faq.answer, lang)}`;
    return text.toLocaleLowerCase().includes(needle);
  });
}

/**
 * FAQ with category chips, search and an accordion. Filters live in the URL (`?category=&q=`).
 * Answers are limited to site usage and facts the school has published.
 */
@Component({
  selector: 'app-faq-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Accordion,
    AsyncState,
    ButtonDirective,
    PageScaffold,
    RelatedLinks,
    SearchBox,
    LocaleNumberPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="faq" [intro]="'faq.intro' | t">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <nav [attr.aria-label]="'faq.filterLabel' | t">
          <ul class="flex flex-wrap gap-2">
            @for (chip of chips; track chip.value) {
              @let active = chip.value === activeCategory();
              <li>
                <a
                  [routerLink]="'faq' | pagePath"
                  [queryParams]="{ category: chip.value === 'all' ? null : chip.value }"
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
                    >{{ count(chip.value) | localeNumber }}</span
                  >
                </a>
              </li>
            }
          </ul>
        </nav>
        <div class="lg:w-96">
          <app-search-box
            [label]="'faq.searchLabel' | t"
            [placeholder]="'faq.searchPlaceholder' | t"
            [value]="query()"
            (valueChange)="onSearch($event)"
          />
        </div>
      </div>

      <p class="mt-5 text-sm text-ink-muted" role="status" aria-live="polite">
        {{ 'faq.showing' | t: { shown: visible().length, total: faqs.value().length } }}
      </p>

      <app-async-state
        class="mt-4 block max-w-3xl"
        [status]="faqs.status()"
        [empty]="visible().length === 0"
        [emptyTitle]="'faq.emptyTitle' | t"
        [emptyMessage]="'faq.emptyMessage' | t"
        emptyIcon="search"
        skeleton="list"
        [skeletonCount]="5"
        (retry)="faqs.reload()"
      >
        <app-accordion [items]="items()" />
        <a empty appButton variant="outline" [routerLink]="'faq' | pagePath">{{
          'faq.clear' | t
        }}</a>
      </app-async-state>

      <section class="mt-12 max-w-3xl rounded-2xl bg-primary-50 p-6" aria-labelledby="faq-more">
        <h2 id="faq-more" class="text-lg">{{ 'faq.moreTitle' | t }}</h2>
        <p class="mt-1 text-ink-muted">{{ 'faq.moreText' | t }}</p>
        <a appButton class="mt-4" [routerLink]="'contact' | pagePath">{{ 'nav.contact' | t }}</a>
      </section>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class FaqPage {
  protected readonly related = ['admission', 'contact', 'about'] as const;
  private readonly service = inject(FaqService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  /** Query parameters, bound by `withComponentInputBinding`. */
  readonly category = input<string>();
  readonly q = input<string>();

  protected readonly chips: readonly { value: FaqFilter; label: TranslationKey }[] = [
    { value: 'all', label: 'faq.all' },
    ...CATEGORIES.map((value) => ({ value, label: FAQ_CATEGORY_LABELS[value] })),
  ];
  protected readonly faqs = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly FaqItem[],
  });
  protected readonly activeCategory = computed<FaqFilter>(() => {
    const value = this.category();
    return isFaqCategory(value) ? value : 'all';
  });
  protected readonly query = linkedSignal(() => this.q() ?? '');
  protected readonly visible = computed(() =>
    filterFaqs(this.faqs.value(), this.activeCategory(), this.query(), this.language.lang()),
  );
  protected readonly items = computed<AccordionItem[]>(() =>
    this.visible().map((faq) => ({
      id: faq.id,
      title: pickLocalized(faq.question, this.language.lang()),
      content: pickLocalized(faq.answer, this.language.lang()),
    })),
  );

  /** How many questions each chip would show for the current search text. */
  protected count(value: FaqFilter): number {
    return filterFaqs(this.faqs.value(), value, this.query(), this.language.lang()).length;
  }

  protected onSearch(text: string): void {
    this.query.set(text);
    void this.router.navigate([], {
      queryParams: { q: text.trim() || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

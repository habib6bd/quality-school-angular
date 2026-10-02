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
import { TranslationKey } from '../../core/i18n/translation.service';
import { Designation, Teacher } from '../../core/models/teacher.model';
import { DESIGNATION_ORDER, TeacherService } from '../../core/services/teacher.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { SearchBox } from '../../shared/components/search-box/search-box';
import { DESIGNATION_LABELS, TeacherCard } from '../../shared/components/teacher-card/teacher-card';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export type DesignationFilter = Designation | 'all';

export function isDesignation(value: unknown): value is Designation {
  return typeof value === 'string' && (DESIGNATION_ORDER as readonly string[]).includes(value);
}

/** Case-insensitive name search combined with an optional designation filter. */
export function filterTeachers(
  all: readonly Teacher[],
  designation: DesignationFilter,
  query: string,
): readonly Teacher[] {
  const needle = query.trim().toLocaleLowerCase();
  return all.filter(
    (t) =>
      (designation === 'all' || t.designation === designation) &&
      (!needle || t.name.toLocaleLowerCase().includes(needle)),
  );
}

interface FilterChip {
  value: DesignationFilter;
  label: TranslationKey;
}

const CHIPS: readonly FilterChip[] = [
  { value: 'all', label: 'teachers.all' },
  ...DESIGNATION_ORDER.map((value) => ({ value, label: DESIGNATION_LABELS[value] })),
];

/**
 * Staff directory. The filters live in the URL (`?designation=teacher&q=sonia`) so a filtered
 * list can be shared, is rendered on the server and survives a language switch.
 */
@Component({
  selector: 'app-teachers-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AsyncState,
    ButtonDirective,
    PageScaffold,
    SearchBox,
    TeacherCard,
    LocaleNumberPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="teachers" [intro]="'teachers.intro' | t">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <nav [attr.aria-label]="'teachers.filterLabel' | t">
          <ul class="flex flex-wrap gap-2">
            @for (chip of chips; track chip.value) {
              @let active = chip.value === filter();
              <li>
                <a
                  [routerLink]="'teachers' | pagePath"
                  [queryParams]="{ designation: chip.value === 'all' ? null : chip.value }"
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
        <div class="lg:w-80">
          <app-search-box
            [label]="'teachers.searchLabel' | t"
            [placeholder]="'teachers.searchPlaceholder' | t"
            [value]="query()"
            (valueChange)="onSearch($event)"
          />
        </div>
      </div>

      <p class="mt-5 text-sm text-ink-muted" role="status" aria-live="polite">
        {{ 'teachers.showing' | t: { shown: visible().length, total: teachers.value().length } }}
      </p>

      <app-async-state
        class="mt-4 block"
        [status]="teachers.status()"
        [empty]="visible().length === 0"
        [emptyTitle]="'teachers.emptyTitle' | t"
        [emptyMessage]="'teachers.emptyMessage' | t"
        emptyIcon="users"
        [skeletonCount]="8"
        (retry)="teachers.reload()"
      >
        <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (teacher of visible(); track teacher.slug) {
            <li>
              <app-teacher-card [teacher]="teacher" [link]="'teachers' | pagePath: teacher.slug" />
            </li>
          }
        </ul>
        <a empty appButton variant="outline" [routerLink]="'teachers' | pagePath">{{
          'teachers.clearFilters' | t
        }}</a>
      </app-async-state>

      <p class="mt-8 text-sm text-ink-muted">{{ 'teachers.namesNote' | t }}</p>
    </app-page-scaffold>
  `,
})
export class TeachersPage {
  private readonly service = inject(TeacherService);
  private readonly router = inject(Router);

  /** Query parameters, bound by `withComponentInputBinding`. */
  readonly designation = input<string>();
  readonly q = input<string>();

  protected readonly chips = CHIPS;
  protected readonly teachers = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Teacher[],
  });
  protected readonly filter = computed<DesignationFilter>(() => {
    const value = this.designation();
    return isDesignation(value) ? value : 'all';
  });
  /** Typed text; follows the URL whenever it changes (e.g. "clear filters"). */
  protected readonly query = linkedSignal(() => this.q() ?? '');
  protected readonly visible = computed(() =>
    filterTeachers(this.teachers.value(), this.filter(), this.query()),
  );

  /** How many people each chip would show for the current search text. */
  protected count(value: DesignationFilter): number {
    return filterTeachers(this.teachers.value(), value, this.query()).length;
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

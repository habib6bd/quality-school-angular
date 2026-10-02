import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslationKey } from '../../core/i18n/translation.service';
import { ResourceItem, ResourceType } from '../../core/models/resource.model';
import { SchoolClass } from '../../core/models/school-class.model';
import { ResourceService } from '../../core/services/resource.service';
import { SchoolClassService } from '../../core/services/school-class.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocalizedLangPipe, LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { safeAttachmentPath } from '../../shared/util/safe-url';

export type TypeFilter = ResourceType | 'all';

interface TypeInfo {
  value: ResourceType;
  label: TranslationKey;
  icon: IconName;
}

export const RESOURCE_TYPES: readonly TypeInfo[] = [
  { value: 'class-routine', label: 'resources.type.classRoutine', icon: 'calendar' },
  { value: 'exam-routine', label: 'resources.type.examRoutine', icon: 'clock' },
  { value: 'syllabus', label: 'resources.type.syllabus', icon: 'book' },
  { value: 'study-material', label: 'resources.type.studyMaterial', icon: 'graduation' },
  { value: 'form', label: 'resources.type.form', icon: 'file' },
  { value: 'policy', label: 'resources.type.policy', icon: 'shield' },
];

export interface ResourceFilters {
  type: TypeFilter;
  classSlug: string;
  subject: string;
  year: string;
  exam: string;
}

/** Applies every filter; an empty string means "any". Subject and exam compare the Bangla text. */
export function filterResources(
  items: readonly ResourceItem[],
  filters: ResourceFilters,
): readonly ResourceItem[] {
  return items.filter(
    (item) =>
      (filters.type === 'all' || item.type === filters.type) &&
      (!filters.classSlug || item.classSlug === filters.classSlug) &&
      (!filters.subject || item.subject?.bn === filters.subject) &&
      (!filters.year || String(item.year) === filters.year) &&
      (!filters.exam || item.exam?.bn === filters.exam),
  );
}

const isType = (value: unknown): value is ResourceType =>
  RESOURCE_TYPES.some((t) => t.value === value);

/**
 * Routines, syllabus, study material, forms and policies. Nothing has been supplied by the
 * school yet, so the page shows every resource type as a marked placeholder; filters (type,
 * class, subject, year, exam — all in the URL) work as soon as items exist.
 */
@Component({
  selector: 'app-resources-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AsyncState,
    ButtonDirective,
    Icon,
    PageScaffold,
    PendingNote,
    LocalizePipe,
    LocalizedLangPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="resources" [intro]="'resources.intro' | t">
      <nav [attr.aria-label]="'resources.typeLabel' | t">
        <ul class="flex flex-wrap gap-2">
          <li>
            <a
              [routerLink]="'resources' | pagePath"
              [queryParams]="params({ type: null })"
              class="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold"
              [class]="chipClass(activeType() === 'all')"
              [attr.aria-current]="activeType() === 'all' ? 'true' : null"
              >{{ 'resources.all' | t }}</a
            >
          </li>
          @for (type of types; track type.value) {
            <li>
              <a
                [routerLink]="'resources' | pagePath"
                [queryParams]="params({ type: type.value })"
                class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold"
                [class]="chipClass(activeType() === type.value)"
                [attr.aria-current]="activeType() === type.value ? 'true' : null"
              >
                <app-icon [name]="type.icon" [size]="16" />{{ type.label | t }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <form
        class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="search"
        [attr.aria-label]="'resources.filterLabel' | t"
        (submit)="$event.preventDefault()"
      >
        <label class="block text-sm font-semibold">
          {{ 'resources.class' | t }}
          <select
            class="mt-1 block min-h-11 w-full rounded-xl border border-stone-400 bg-white px-3 font-normal"
            [value]="classSlug() ?? ''"
            (change)="pick('classSlug', $event)"
          >
            <option value="">{{ 'resources.any' | t }}</option>
            @for (item of classes.value(); track item.slug) {
              <option [value]="item.slug" [selected]="item.slug === classSlug()">
                {{ item.name | localize }}
              </option>
            }
          </select>
        </label>
        <label class="block text-sm font-semibold">
          {{ 'resources.subject' | t }}
          <select
            class="mt-1 block min-h-11 w-full rounded-xl border border-stone-400 bg-white px-3 font-normal disabled:bg-stone-100"
            [disabled]="subjects().length === 0"
            (change)="pick('subject', $event)"
          >
            <option value="">{{ 'resources.any' | t }}</option>
            @for (subject of subjects(); track subject.bn) {
              <option [value]="subject.bn" [selected]="subject.bn === subjectFilter()">
                {{ subject | localize }}
              </option>
            }
          </select>
        </label>
        <label class="block text-sm font-semibold">
          {{ 'resources.year' | t }}
          <select
            class="mt-1 block min-h-11 w-full rounded-xl border border-stone-400 bg-white px-3 font-normal disabled:bg-stone-100"
            [disabled]="years().length === 0"
            (change)="pick('year', $event)"
          >
            <option value="">{{ 'resources.any' | t }}</option>
            @for (year of years(); track year) {
              <option [value]="year" [selected]="'' + year === yearFilter()">{{ year }}</option>
            }
          </select>
        </label>
        <label class="block text-sm font-semibold">
          {{ 'resources.exam' | t }}
          <select
            class="mt-1 block min-h-11 w-full rounded-xl border border-stone-400 bg-white px-3 font-normal disabled:bg-stone-100"
            [disabled]="exams().length === 0"
            (change)="pick('exam', $event)"
          >
            <option value="">{{ 'resources.any' | t }}</option>
            @for (exam of exams(); track exam.bn) {
              <option [value]="exam.bn" [selected]="exam.bn === examFilter()">
                {{ exam | localize }}
              </option>
            }
          </select>
        </label>
      </form>
      @if (subjects().length === 0 && years().length === 0 && exams().length === 0) {
        <p class="mt-2 text-sm text-ink-muted">{{ 'resources.optionsPending' | t }}</p>
      }

      <app-async-state
        class="mt-8 block"
        [status]="items.status()"
        [empty]="false"
        [skeletonCount]="3"
        (retry)="items.reload()"
      >
        @if (visible().length) {
          <ul class="grid gap-4 md:grid-cols-2">
            @for (item of visible(); track item.id) {
              <li class="card p-5">
                <p class="text-sm font-medium text-primary-800">{{ typeLabel(item.type) | t }}</p>
                <h3 class="mt-1 text-lg" [lang]="item.title | localizedLang">
                  {{ item.title | localize }}
                </h3>
                @if (item.description; as description) {
                  <p class="mt-1 text-sm text-ink-muted" [lang]="description | localizedLang">
                    {{ description | localize }}
                  </p>
                }
                @if (href(item); as link) {
                  <div class="mt-4 flex flex-wrap gap-3">
                    <a
                      appButton
                      variant="outline"
                      size="sm"
                      [href]="link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ 'notices.openAttachment' | t }}
                      <app-icon name="external" [size]="16" />
                      <span class="sr-only">{{ 'common.externalLink' | t }}</span>
                    </a>
                    <a appButton variant="ghost" size="sm" [href]="link" download>
                      <app-icon name="download" [size]="16" /> {{ 'notices.download' | t }}
                    </a>
                  </div>
                } @else {
                  <p class="mt-4 text-sm text-ink-muted">{{ 'resources.fileSoon' | t }}</p>
                }
              </li>
            }
          </ul>
        } @else if (items.value().length) {
          <div class="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p class="font-display text-lg font-semibold">{{ 'resources.noMatchTitle' | t }}</p>
            <p class="mt-1 text-ink-muted">{{ 'resources.noMatchText' | t }}</p>
            <a
              appButton
              variant="outline"
              size="sm"
              class="mt-4"
              [routerLink]="'resources' | pagePath"
              >{{ 'resources.clear' | t }}</a
            >
          </div>
        } @else {
          <section aria-labelledby="pending-types">
            <h2 id="pending-types" class="text-xl sm:text-2xl">
              {{ 'resources.pendingTitle' | t }}
            </h2>
            <app-pending-note class="mt-4 block max-w-3xl" [message]="'resources.pending' | t" />
            <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (type of types; track type.value) {
                <li class="card flex items-center gap-4 border-dashed p-5">
                  <span
                    class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"
                  >
                    <app-icon [name]="type.icon" [size]="22" />
                  </span>
                  <div>
                    <p class="font-semibold">{{ type.label | t }}</p>
                    <p class="text-sm text-ink-muted">{{ 'common.toBeConfirmed' | t }}</p>
                  </div>
                </li>
              }
            </ul>
          </section>
        }
      </app-async-state>
    </app-page-scaffold>
  `,
})
export class ResourcesPage {
  private readonly service = inject(ResourceService);
  private readonly classService = inject(SchoolClassService);
  private readonly router = inject(Router);

  /** Query parameters, bound by `withComponentInputBinding`. */
  readonly type = input<string>();
  readonly classSlug = input<string>();
  readonly subject = input<string>();
  readonly year = input<string>();
  readonly exam = input<string>();

  protected readonly types = RESOURCE_TYPES;
  protected readonly items = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly ResourceItem[],
  });
  protected readonly classes = rxResource({
    stream: () => this.classService.list(),
    defaultValue: [] as readonly SchoolClass[],
  });

  protected readonly activeType = computed<TypeFilter>(() => {
    const value = this.type();
    return isType(value) ? value : 'all';
  });
  protected readonly subjectFilter = computed(() => this.subject() ?? '');
  protected readonly yearFilter = computed(() => this.year() ?? '');
  protected readonly examFilter = computed(() => this.exam() ?? '');

  /** Options come from the items themselves, so a filter only offers values that exist. */
  protected readonly subjects = computed(() =>
    uniqueBy(
      this.items.value().flatMap((i) => (i.subject ? [i.subject] : [])),
      (s) => s.bn,
    ),
  );
  protected readonly exams = computed(() =>
    uniqueBy(
      this.items.value().flatMap((i) => (i.exam ? [i.exam] : [])),
      (e) => e.bn,
    ),
  );
  protected readonly years = computed(() =>
    [...new Set(this.items.value().flatMap((i) => (i.year ? [i.year] : [])))].sort((a, b) => b - a),
  );

  protected readonly visible = computed(() =>
    filterResources(this.items.value(), {
      type: this.activeType(),
      classSlug: this.classSlug() ?? '',
      subject: this.subjectFilter(),
      year: this.yearFilter(),
      exam: this.examFilter(),
    }),
  );

  protected chipClass(active: boolean): string {
    return active
      ? 'border-primary-700 bg-primary-700 text-white'
      : 'border-stone-300 bg-white text-secondary-950 hover:bg-primary-50';
  }

  /** Query parameters for a link that changes some filters and keeps the rest. */
  protected params(change: Record<string, string | null>): Record<string, string | null> {
    return {
      type: this.type() ?? null,
      classSlug: this.classSlug() ?? null,
      subject: this.subject() ?? null,
      year: this.year() ?? null,
      exam: this.exam() ?? null,
      ...change,
    };
  }

  protected typeLabel(type: ResourceType): TranslationKey {
    return RESOURCE_TYPES.find((t) => t.value === type)?.label ?? 'resources.all';
  }

  protected href(item: ResourceItem): string | null {
    return item.file ? safeAttachmentPath(item.file.src) : null;
  }

  /** Applies a filter chosen in one of the selects by updating the URL. */
  protected pick(name: 'classSlug' | 'subject' | 'year' | 'exam', event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    void this.router.navigate([], {
      queryParams: { [name]: value || null },
      queryParamsHandling: 'merge',
    });
  }
}

function uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  return [...new Map(items.map((item) => [key(item), item])).values()];
}

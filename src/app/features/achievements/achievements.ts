import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslationKey } from '../../core/i18n/translation.service';
import { Achievement, AchievementCategory } from '../../core/models/achievement.model';
import { AchievementService } from '../../core/services/achievement.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { LocalizedLangPipe, LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface Section {
  category: AchievementCategory;
  icon: IconName;
  title: TranslationKey;
}

const SECTIONS: readonly Section[] = [
  { category: 'academic', icon: 'book', title: 'achievements.academic' },
  { category: 'sports', icon: 'award', title: 'achievements.sports' },
  { category: 'cultural', icon: 'heart', title: 'achievements.cultural' },
];

/**
 * Achievements by category. The school has not published any verified achievements, so every
 * category shows a marked placeholder; real entries (from the service) replace it automatically.
 */
@Component({
  selector: 'app-achievements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncState,
    Icon,
    PageScaffold,
    PendingNote,
    RelatedLinks,
    LocalizePipe,
    LocalizedLangPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="achievements" [intro]="'achievements.intro' | t">
      <app-async-state
        [status]="achievements.status()"
        [skeletonCount]="3"
        (retry)="achievements.reload()"
      >
        <div class="space-y-10">
          @for (section of sections; track section.category) {
            <section [attr.aria-labelledby]="'ach-' + section.category">
              <h2
                [id]="'ach-' + section.category"
                class="flex items-center gap-3 text-xl sm:text-2xl"
              >
                <span
                  class="grid size-11 place-items-center rounded-xl bg-accent-100 text-secondary-950"
                >
                  <app-icon [name]="section.icon" [size]="22" />
                </span>
                {{ section.title | t }}
              </h2>
              @if (byCategory()[section.category]; as items) {
                <ul class="mt-5 grid gap-5 md:grid-cols-2">
                  @for (item of items; track item.id) {
                    <li class="card p-5">
                      <h3 class="text-lg" [lang]="item.title | localizedLang">
                        {{ item.title | localize }}
                      </h3>
                      <p
                        class="mt-1 text-sm text-ink-muted"
                        [lang]="item.description | localizedLang"
                      >
                        {{ item.description | localize }}
                      </p>
                    </li>
                  }
                </ul>
              } @else {
                <app-pending-note
                  class="mt-5 block max-w-3xl"
                  [message]="'achievements.placeholderText' | t"
                />
              }
            </section>
          }
        </div>
      </app-async-state>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class AchievementsPage {
  private readonly service = inject(AchievementService);

  protected readonly sections = SECTIONS;
  protected readonly related = ['gallery', 'videos', 'about/messages'] as const;
  protected readonly achievements = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Achievement[],
  });
  /** Achievements grouped by category; a category without entries is absent (shows the placeholder). */
  protected readonly byCategory = computed(() => {
    const groups: Partial<Record<AchievementCategory, Achievement[]>> = {};
    for (const item of this.achievements.value()) (groups[item.category] ??= []).push(item);
    return groups;
  });
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Achievement } from '../../../core/models/achievement.model';
import { AchievementService } from '../../../core/services/achievement.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { Badge } from '../../../shared/components/badge/badge';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { Icon, IconName } from '../../../shared/components/icon/icon';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslationKey } from '../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const PLACEHOLDERS: readonly { icon: IconName; title: TranslationKey }[] = [
  { icon: 'book', title: 'achievements.academic' },
  { icon: 'award', title: 'achievements.sports' },
  { icon: 'heart', title: 'achievements.cultural' },
];

/** Verified achievements when the school supplies them; clearly marked placeholders until then. */
@Component({
  selector: 'app-home-achievements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, Badge, ContentSection, Icon, LocalizePipe, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section
      [title]="'nav.achievements' | t"
      [description]="'home.achievementsDescription' | t"
      [link]="'achievements' | pagePath"
    >
      <app-async-state [status]="achievements.status()" (retry)="achievements.reload()">
        <ul class="grid gap-5 md:grid-cols-3">
          @for (item of achievements.value(); track item.id) {
            <li class="card p-5">
              <h3 class="text-lg">{{ item.title | localize }}</h3>
              <p class="mt-1 text-sm text-ink-muted">{{ item.description | localize }}</p>
            </li>
          } @empty {
            @for (item of placeholders; track item.title) {
              <li class="card flex flex-col items-start gap-3 border-dashed p-5">
                <span
                  class="grid size-12 place-items-center rounded-xl bg-accent-100 text-secondary-950"
                >
                  <app-icon [name]="item.icon" [size]="24" />
                </span>
                <h3 class="text-lg">{{ item.title | t }}</h3>
                <p class="text-sm text-ink-muted">{{ 'achievements.placeholderText' | t }}</p>
                <app-badge tone="neutral">{{ 'common.toBeConfirmed' | t }}</app-badge>
              </li>
            }
          }
        </ul>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeAchievements {
  private readonly service = inject(AchievementService);

  protected readonly placeholders = PLACEHOLDERS;
  protected readonly achievements = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Achievement[],
  });
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationKey } from '../../core/i18n/translation.service';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface Theme {
  icon: IconName;
  title: TranslationKey;
  text: TranslationKey;
  source: TranslationKey;
}

/** Themes quoted from the published Chairman and Headmaster messages; no new claims. */
const THEMES: readonly Theme[] = [
  {
    icon: 'graduation',
    title: 'philosophy.citizensTitle',
    text: 'philosophy.citizensText',
    source: 'philosophy.sourceChairman',
  },
  {
    icon: 'heart',
    title: 'philosophy.valuesTitle',
    text: 'philosophy.valuesText',
    source: 'philosophy.sourceHeadmaster',
  },
  {
    icon: 'monitor',
    title: 'philosophy.teachingTitle',
    text: 'philosophy.teachingText',
    source: 'philosophy.sourceHeadmaster',
  },
  {
    icon: 'award',
    title: 'philosophy.clubsTitle',
    text: 'philosophy.clubsText',
    source: 'philosophy.sourceHeadmaster',
  },
];

@Component({
  selector: 'app-philosophy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageScaffold, PendingNote, RelatedLinks, Icon, TranslatePipe],
  template: `
    <app-page-scaffold page="about/philosophy" [intro]="'philosophy.intro' | t">
      <app-pending-note class="block max-w-3xl" [message]="'philosophy.pending' | t" />
      <section aria-labelledby="themes-title" class="mt-10">
        <h2 id="themes-title" class="text-xl sm:text-2xl">{{ 'philosophy.themesTitle' | t }}</h2>
        <ul class="mt-5 grid gap-5 sm:grid-cols-2">
          @for (theme of themes; track theme.title) {
            <li class="card flex gap-4 p-5">
              <span
                class="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"
              >
                <app-icon [name]="theme.icon" [size]="24" />
              </span>
              <div>
                <h3 class="text-lg">{{ theme.title | t }}</h3>
                <p class="mt-1 text-ink-muted">{{ theme.text | t }}</p>
                <p class="mt-2 text-sm font-medium text-primary-800">{{ theme.source | t }}</p>
              </div>
            </li>
          }
        </ul>
      </section>
      <app-related-links class="mt-12 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class PhilosophyPage {
  protected readonly themes = THEMES;
  protected readonly related = ['about/messages', 'about/mission-vision', 'academics'] as const;
}

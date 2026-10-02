import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Only milestones the school itself has stated are shown; the rest is marked as pending. */
@Component({
  selector: 'app-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageScaffold, PendingNote, RelatedLinks, TranslatePipe],
  template: `
    <app-page-scaffold page="about/history" [intro]="'history.intro' | t">
      <ol class="relative max-w-3xl border-s-2 border-primary-200 ps-8">
        <li class="relative pb-10">
          <span
            aria-hidden="true"
            class="absolute -start-[2.65rem] top-1 size-5 rounded-full border-4 border-white bg-primary-700 ring-2 ring-primary-200"
          ></span>
          <h2 class="text-xl sm:text-2xl">{{ 'history.year2010' | t }}</h2>
          <p class="mt-2 text-ink-muted">{{ 'history.text2010' | t }}</p>
        </li>
        <li class="relative">
          <span
            aria-hidden="true"
            class="absolute -start-[2.65rem] top-1 size-5 rounded-full border-4 border-white bg-secondary-700 ring-2 ring-secondary-200"
          ></span>
          <h2 class="text-xl sm:text-2xl">{{ 'history.today' | t }}</h2>
          <p class="mt-2 text-ink-muted">{{ 'history.textToday' | t }}</p>
        </li>
      </ol>
      <p class="mt-6 text-sm text-ink-muted">{{ 'history.source' | t }}</p>
      <app-pending-note class="mt-8 block max-w-3xl" [message]="'history.pending' | t" />
      <app-related-links class="mt-12 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class HistoryPage {
  protected readonly related = ['about', 'about/messages', 'about/mission-vision'] as const;
}

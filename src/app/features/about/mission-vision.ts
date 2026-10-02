import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** The school has not published mission or vision text: both are clearly marked placeholders. */
@Component({
  selector: 'app-mission-vision-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageScaffold, PendingNote, RelatedLinks, RouterLink, Icon, PagePathPipe, TranslatePipe],
  template: `
    <app-page-scaffold page="about/mission-vision" [intro]="'missionVision.intro' | t">
      <div class="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="mission-title" class="card p-6">
          <h2 id="mission-title" class="text-xl sm:text-2xl">{{ 'missionVision.mission' | t }}</h2>
          <app-pending-note class="mt-4 block" [message]="'missionVision.pending' | t" />
        </section>
        <section aria-labelledby="vision-title" class="card p-6">
          <h2 id="vision-title" class="text-xl sm:text-2xl">{{ 'missionVision.vision' | t }}</h2>
          <app-pending-note class="mt-4 block" [message]="'missionVision.pending' | t" />
        </section>
      </div>

      <section aria-labelledby="leaders-quote" class="mt-12 max-w-3xl">
        <h2 id="leaders-quote" class="text-xl sm:text-2xl">
          {{ 'missionVision.leadersTitle' | t }}
        </h2>
        <figure class="mt-4 rounded-2xl bg-primary-50 p-6">
          <app-icon name="quote" [size]="28" class="text-primary-700" />
          <blockquote class="mt-3 text-lg text-secondary-950">
            {{ 'missionVision.chairmanQuote' | t }}
          </blockquote>
        </figure>
        <p class="mt-4">
          <a
            [routerLink]="'about/messages' | pagePath"
            class="font-semibold text-primary-700 hover:underline"
            >{{ 'missionVision.moreLink' | t }}</a
          >
        </p>
      </section>

      <app-related-links class="mt-12 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class MissionVisionPage {
  protected readonly related = ['about/philosophy', 'about/messages', 'about'] as const;
}

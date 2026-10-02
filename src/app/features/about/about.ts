import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { LocaleDigitsPipe, LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    PageScaffold,
    PendingNote,
    RelatedLinks,
    LocaleDigitsPipe,
    LocaleNumberPipe,
    LocalizePipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="about" [intro]="'about.intro' | t">
      <div class="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="about-story">
          <h2 id="about-story" class="text-2xl sm:text-3xl">{{ 'about.storyTitle' | t }}</h2>
          <div class="prose-content mt-4 max-w-none text-base sm:text-lg">
            <p>{{ 'home.aboutP1' | t }}</p>
            <p>{{ 'home.aboutP2' | t }}</p>
            <p>{{ 'home.aboutP3' | t }}</p>
          </div>
          <figure class="mt-8">
            <img
              ngSrc="images/bqes/gallery/annual-sports-4.webp"
              width="1500"
              height="1125"
              [alt]="'about.storyImageAlt' | t"
              class="w-full rounded-2xl object-cover shadow-[var(--shadow-card)]"
            />
          </figure>
        </section>

        <section aria-labelledby="about-glance" class="card p-6">
          <h2 id="about-glance" class="text-xl sm:text-2xl">{{ 'about.glanceTitle' | t }}</h2>
          <dl class="mt-4 divide-y divide-stone-200">
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.schoolName' | t }}</dt>
              <dd class="text-ink-muted">{{ info().name | localize }}</dd>
            </div>
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.established' | t }}</dt>
              <dd class="text-ink-muted">{{ info().establishedYear | localeNumber: false }}</dd>
            </div>
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.location' | t }}</dt>
              <dd class="text-ink-muted">
                @if (info().address; as address) {
                  {{ address | localize }}
                } @else {
                  {{ 'common.toBeConfirmed' | t }}
                }
              </dd>
            </div>
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.mediums' | t }}</dt>
              <dd class="text-ink-muted">{{ 'about.mediumsValue' | t }}</dd>
            </div>
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.classes' | t }}</dt>
              <dd class="text-ink-muted">{{ 'about.classesValue' | t }}</dd>
            </div>
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.groups' | t }}</dt>
              <dd class="text-ink-muted">{{ 'about.groupsValue' | t }}</dd>
            </div>
            <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt class="font-semibold text-secondary-950">{{ 'about.recognition' | t }}</dt>
              <dd class="text-ink-muted">
                {{ 'about.recognitionValue' | t }}
                <span class="block text-sm">{{ 'about.recognitionSource' | t }}</span>
              </dd>
            </div>
            @if (info().schoolCode; as code) {
              <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt class="font-semibold text-secondary-950">{{ 'footer.schoolCode' | t }}</dt>
                <dd class="text-ink-muted">{{ code | localeDigits }}</dd>
              </div>
            }
            @if (info().eiin; as eiin) {
              <div class="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt class="font-semibold text-secondary-950">{{ 'footer.eiin' | t }}</dt>
                <dd class="text-ink-muted">{{ eiin | localeDigits }}</dd>
              </div>
            }
          </dl>
        </section>
      </div>

      <app-pending-note class="mt-10 block" [message]="'about.pending' | t" />
      <app-related-links class="mt-12 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class AboutPage {
  protected readonly info = inject(SchoolInfoService).info;
  protected readonly related = [
    'about/history',
    'about/mission-vision',
    'about/philosophy',
    'about/messages',
    'about/facilities',
    'academics',
  ] as const;
}

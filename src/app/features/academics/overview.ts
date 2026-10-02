import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SchoolClass } from '../../core/models/school-class.model';
import { SchoolClassService } from '../../core/services/school-class.service';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { TranslationKey } from '../../core/i18n/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface Fact {
  icon: IconName;
  title: TranslationKey;
  text: TranslationKey;
}

const FACTS: readonly Fact[] = [
  { icon: 'book', title: 'academics.classesTitle', text: 'academics.classesText' },
  { icon: 'globe', title: 'academics.mediumTitle', text: 'academics.mediumText' },
  { icon: 'graduation', title: 'academics.groupsTitle', text: 'academics.groupsText' },
];

@Component({
  selector: 'app-academics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageScaffold, PendingNote, RelatedLinks, Icon, TranslatePipe],
  template: `
    <app-page-scaffold page="academics" [intro]="'academics.intro' | t">
      <ul class="grid gap-5 md:grid-cols-3">
        @for (fact of facts; track fact.title) {
          <li class="card p-6">
            <span
              class="grid size-12 place-items-center rounded-xl bg-primary-100 text-primary-800"
            >
              <app-icon [name]="fact.icon" [size]="24" />
            </span>
            <h2 class="mt-4 text-lg">{{ fact.title | t }}</h2>
            <p class="mt-1 text-ink-muted">
              {{ fact.text | t: { count: classes.value().length } }}
            </p>
          </li>
        }
      </ul>
      <p class="mt-6 text-sm text-ink-muted">{{ 'academics.recognitionNote' | t }}</p>
      <app-pending-note class="mt-8 block" [message]="'academics.pending' | t" />
      <app-related-links class="mt-12 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class AcademicsPage {
  private readonly service = inject(SchoolClassService);

  protected readonly facts = FACTS;
  protected readonly classes = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly SchoolClass[],
  });
  protected readonly related = [
    'academics/programs',
    'academics/calendar',
    'results',
    'resources',
    'admission',
    'about/facilities',
  ] as const;
}

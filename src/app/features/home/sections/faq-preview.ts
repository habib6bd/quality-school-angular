import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../../core/i18n/language.service';
import { pickLocalized } from '../../../core/i18n/localized';
import { FaqItem } from '../../../core/models/faq.model';
import { FaqService } from '../../../core/services/faq.service';
import { Accordion, AccordionItem } from '../../../shared/components/accordion/accordion';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Accordion, AsyncState, ContentSection, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section [title]="'nav.faq' | t" [link]="'faq' | pagePath">
      <app-async-state
        [status]="faqs.status()"
        [empty]="faqs.value().length === 0"
        skeleton="list"
        (retry)="faqs.reload()"
      >
        <div class="max-w-3xl"><app-accordion [items]="items()" /></div>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeFaq {
  private readonly service = inject(FaqService);
  private readonly language = inject(LanguageService);

  protected readonly faqs = rxResource({
    stream: () => this.service.preview(4),
    defaultValue: [] as readonly FaqItem[],
  });
  protected readonly items = computed<AccordionItem[]>(() =>
    this.faqs.value().map((faq) => ({
      id: faq.id,
      title: pickLocalized(faq.question, this.language.lang()),
      content: pickLocalized(faq.answer, this.language.lang()),
    })),
  );
}

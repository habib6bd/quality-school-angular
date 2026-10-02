import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Testimonial } from '../../../core/models/testimonial.model';
import { TestimonialService } from '../../../core/services/testimonial.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { Icon } from '../../../shared/components/icon/icon';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Guardian reviews: real, approved ones only. Until some exist, the section says so plainly. */
@Component({
  selector: 'app-home-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, Icon, LocalizePipe, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section
      tone="white"
      [title]="'testimonials.title' | t"
      [link]="'contact' | pagePath"
      [linkLabel]="'nav.contact' | t"
    >
      <app-async-state
        [status]="testimonials.status()"
        [empty]="testimonials.value().length === 0"
        [emptyTitle]="'testimonials.emptyTitle' | t"
        [emptyMessage]="'testimonials.emptyMessage' | t"
        emptyIcon="quote"
        (retry)="testimonials.reload()"
      >
        <ul class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (item of testimonials.value(); track item.id) {
            <li class="card p-6">
              <app-icon name="quote" [size]="28" class="text-accent-500" />
              <blockquote class="mt-3 text-ink-muted">{{ item.quote | localize }}</blockquote>
              <p class="mt-4 font-semibold">{{ item.attribution | localize }}</p>
            </li>
          }
        </ul>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeTestimonials {
  private readonly service = inject(TestimonialService);

  protected readonly testimonials = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly Testimonial[],
  });
}

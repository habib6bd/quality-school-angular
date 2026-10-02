import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Testimonial } from '../../../core/models/testimonial.model';
import { LocalizedLangPipe, LocalizePipe } from '../../pipes/localize.pipe';
import { Icon } from '../icon/icon';

/** One guardian review. Only reviews the school has verified and approved may be shown. */
@Component({
  selector: 'app-testimonial-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, LocalizePipe, LocalizedLangPipe],
  template: `
    <figure class="card h-full p-6">
      <app-icon name="quote" [size]="28" class="text-accent-500" />
      <blockquote class="mt-3 text-ink-muted" [lang]="testimonial().quote | localizedLang">
        {{ testimonial().quote | localize }}
      </blockquote>
      <figcaption class="mt-4 font-semibold" [lang]="testimonial().attribution | localizedLang">
        {{ testimonial().attribution | localize }}
      </figcaption>
    </figure>
  `,
})
export class TestimonialCard {
  readonly testimonial = input.required<Testimonial>();
}

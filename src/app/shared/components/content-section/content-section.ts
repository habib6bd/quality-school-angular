import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '../../directives/button.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';
import { SectionHeading } from '../section-heading/section-heading';

let nextId = 0;

/**
 * A titled page section with an optional "view all" link. Provides the landmark
 * (`<section aria-labelledby>`) and heading, so feature pages only supply content.
 */
@Component({
  selector: 'app-content-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [SectionHeading, RouterLink, ButtonDirective, Icon, TranslatePipe],
  template: `
    <section
      [class]="tone() === 'white' ? 'section bg-white' : 'section'"
      [attr.aria-labelledby]="id"
    >
      <div class="container-page">
        <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <app-section-heading
            [headingId]="id"
            [title]="title()"
            [eyebrow]="eyebrow()"
            [description]="description()"
          />
          @if (link()) {
            <a appButton variant="outline" size="sm" [routerLink]="link()">
              {{ linkLabel() ?? ('common.viewAll' | t) }}
              <app-icon name="arrowRight" [size]="16" />
            </a>
          }
        </div>
        <div class="mt-8 sm:mt-10"><ng-content /></div>
      </div>
    </section>
  `,
})
export class ContentSection {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>();
  readonly description = input<string>();
  /** Router commands of the "view all" link; omit for no link. */
  readonly link = input<readonly string[]>();
  readonly linkLabel = input<string>();
  readonly tone = input<'default' | 'white'>('default');

  protected readonly id = `section-${nextId++}`;
}

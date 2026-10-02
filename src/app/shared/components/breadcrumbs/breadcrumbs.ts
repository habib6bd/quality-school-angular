import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../../../core/models/breadcrumb.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

export type { BreadcrumbItem };

@Component({
  selector: 'app-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    <nav [attr.aria-label]="'common.breadcrumb' | t">
      <ol
        class="flex flex-wrap items-center gap-1 text-sm"
        [class]="inverse() ? 'text-white/80' : 'text-ink-muted'"
      >
        @for (item of items(); track $index; let last = $last) {
          <li class="inline-flex items-center gap-1">
            @if (item.link && !last) {
              <a
                [routerLink]="item.link"
                class="rounded hover:underline"
                [class]="inverse() ? 'hover:text-white' : 'hover:text-primary-700'"
                >{{ item.label }}</a
              >
              <app-icon name="chevronRight" [size]="14" />
            } @else {
              <span
                aria-current="page"
                class="font-medium"
                [class]="inverse() ? 'text-white' : 'text-ink'"
                >{{ item.label }}</span
              >
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumbs {
  readonly items = input.required<readonly BreadcrumbItem[]>();
  readonly inverse = input(false);
}

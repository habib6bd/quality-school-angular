import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  template: `
    <div
      class="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"
    >
      <span
        class="mb-4 grid size-14 place-items-center rounded-full bg-primary-50 text-primary-700"
      >
        <app-icon [name]="icon()" [size]="26" />
      </span>
      <p class="font-display text-lg font-semibold text-secondary-950">
        {{ title() ?? ('common.emptyTitle' | t) }}
      </p>
      <p class="mt-1 max-w-md text-ink-muted">{{ message() ?? ('common.emptyMessage' | t) }}</p>
      <div class="mt-5 empty:hidden"><ng-content /></div>
    </div>
  `,
})
export class EmptyState {
  readonly title = input<string>();
  readonly message = input<string>();
  readonly icon = input<IconName>('inbox');
}

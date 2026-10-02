import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Badge } from '../badge/badge';
import { Icon } from '../icon/icon';

/** Marks content the school has not supplied yet, so nothing is invented in its place. */
@Component({
  selector: 'app-pending-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge, Icon, TranslatePipe],
  template: `
    <aside
      class="flex gap-4 rounded-2xl border border-dashed border-accent-600 bg-accent-50 p-5 text-secondary-950"
    >
      <app-icon name="info" [size]="22" class="mt-0.5 text-accent-700" />
      <div>
        <app-badge tone="demo">{{ 'common.toBeConfirmed' | t }}</app-badge>
        <p class="mt-2">{{ message() }}</p>
      </div>
    </aside>
  `,
})
export class PendingNote {
  readonly message = input.required<string>();
}

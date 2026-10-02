import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'primary' | 'secondary' | 'accent' | 'neutral' | 'danger' | 'demo';

const TONES: Record<BadgeTone, string> = {
  primary: 'bg-primary-50 text-primary-800 ring-primary-200',
  secondary: 'bg-secondary-50 text-secondary-800 ring-secondary-200',
  accent: 'bg-accent-50 text-accent-700 ring-accent-200',
  neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
  danger: 'bg-red-50 text-red-800 ring-red-200',
  demo: 'bg-amber-100 text-amber-900 ring-amber-300',
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class Badge {
  readonly tone = input<BadgeTone>('primary');

  protected readonly classes = computed(
    () =>
      `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[this.tone()]}`,
  );
}

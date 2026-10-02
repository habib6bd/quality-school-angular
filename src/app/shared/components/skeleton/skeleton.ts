import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Placeholder shown while content loads. Announces "Loading" once to screen readers. */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div role="status" class="animate-pulse">
      <span class="sr-only">{{ 'common.loading' | t }}</span>
      <div aria-hidden="true" class="grid gap-6" [class]="gridClass()">
        @for (item of placeholders(); track item) {
          @switch (variant()) {
            @case ('card') {
              <div class="card">
                <div class="aspect-[4/3] bg-stone-200"></div>
                <div class="space-y-3 p-5">
                  <div class="h-4 w-3/4 rounded bg-stone-200"></div>
                  <div class="h-3 w-full rounded bg-stone-200"></div>
                  <div class="h-3 w-5/6 rounded bg-stone-200"></div>
                </div>
              </div>
            }
            @case ('list') {
              <div class="flex gap-4 rounded-xl bg-white p-4">
                <div class="size-12 shrink-0 rounded-lg bg-stone-200"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-2/3 rounded bg-stone-200"></div>
                  <div class="h-3 w-1/3 rounded bg-stone-200"></div>
                </div>
              </div>
            }
            @default {
              <div class="space-y-2">
                <div class="h-3 w-full rounded bg-stone-200"></div>
                <div class="h-3 w-11/12 rounded bg-stone-200"></div>
                <div class="h-3 w-4/5 rounded bg-stone-200"></div>
              </div>
            }
          }
        }
      </div>
    </div>
  `,
})
export class Skeleton {
  readonly variant = input<'text' | 'card' | 'list'>('text');
  readonly count = input(3);

  protected readonly placeholders = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i),
  );
  protected readonly gridClass = computed(() =>
    this.variant() === 'card' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
  );
}

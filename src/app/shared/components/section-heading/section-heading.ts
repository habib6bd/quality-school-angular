import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div [class]="wrapperClass()">
      @if (eyebrow()) {
        <p
          class="mb-2 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary-700 uppercase"
        >
          <span aria-hidden="true" class="h-0.5 w-6 rounded bg-accent-500"></span>
          {{ eyebrow() }}
        </p>
      }
      @switch (level()) {
        @case (1) {
          <h1
            [id]="headingId()"
            class="text-3xl sm:text-4xl lg:text-5xl"
            [class.text-white]="inverse()"
          >
            {{ title() }}
          </h1>
        }
        @case (3) {
          <h3 [id]="headingId()" class="text-xl sm:text-2xl" [class.text-white]="inverse()">
            {{ title() }}
          </h3>
        }
        @default {
          <h2
            [id]="headingId()"
            class="text-2xl sm:text-3xl lg:text-4xl"
            [class.text-white]="inverse()"
          >
            {{ title() }}
          </h2>
        }
      }
      @if (description()) {
        <p
          class="mt-3 text-base sm:text-lg"
          [class.text-ink-muted]="!inverse()"
          [class.text-white/85]="inverse()"
        >
          {{ description() }}
        </p>
      }
    </div>
  `,
})
export class SectionHeading {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>();
  readonly description = input<string>();
  readonly level = input<1 | 2 | 3>(2);
  readonly align = input<'start' | 'center'>('start');
  readonly inverse = input(false);
  /** Lets a `<section aria-labelledby>` reference the heading. */
  readonly headingId = input<string | null>(null);

  protected readonly wrapperClass = computed(() =>
    this.align() === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl',
  );
}

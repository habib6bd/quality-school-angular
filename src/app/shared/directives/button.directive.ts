import { computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600 ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900',
  secondary: 'bg-secondary-700 text-white hover:bg-secondary-800 active:bg-secondary-900',
  accent: 'bg-accent-400 text-secondary-950 hover:bg-accent-300 active:bg-accent-500',
  outline: 'border border-primary-700 text-primary-700 hover:bg-primary-50',
  ghost: 'text-primary-700 hover:bg-primary-50',
  light: 'bg-white text-primary-800 hover:bg-primary-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-5 text-sm sm:text-base',
  lg: 'min-h-12 px-6 text-base sm:text-lg',
};

/** Styles a native `<button>` or `<a>` as a button; semantics stay with the host element. */
@Directive({
  selector: 'button[appButton], a[appButton]',
  host: { '[class]': 'classes()' },
})
export class ButtonDirective {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');

  protected readonly classes = computed(
    () => `${BASE} ${VARIANTS[this.variant()]} ${SIZES[this.size()]}`,
  );
}

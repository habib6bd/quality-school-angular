import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const TONES = [
  'bg-primary-100 text-primary-800',
  'bg-secondary-100 text-secondary-800',
  'bg-accent-100 text-secondary-950',
] as const;

/** First letter of a name in upper case, ignoring leading punctuation; `?` when there is none. */
export function initialOf(name: string): string {
  const letter = name.trim().match(/\p{L}/u)?.[0];
  return letter ? letter.toLocaleUpperCase() : '?';
}

function toneFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

/** Initial-letter avatar, used until a person supplies an approved photo. Decorative. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()', 'aria-hidden': 'true' },
  template: '{{ initial() }}',
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input<'md' | 'lg' | 'xl'>('md');

  protected readonly initial = computed(() => initialOf(this.name()));
  protected readonly classes = computed(() => {
    const size = { md: 'size-14 text-xl', lg: 'size-20 text-3xl', xl: 'size-32 text-5xl' }[
      this.size()
    ];
    return `inline-grid shrink-0 place-items-center rounded-full font-display font-semibold ${size} ${toneFor(this.name())}`;
  });
}

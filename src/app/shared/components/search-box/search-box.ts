import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

let nextId = 0;

@Component({
  selector: 'app-search-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  template: `
    <form
      role="search"
      class="relative"
      (submit)="$event.preventDefault(); submitted.emit(value())"
    >
      <label [for]="inputId" class="sr-only">{{ label() ?? ('common.search' | t) }}</label>
      <app-icon
        name="search"
        class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
      />
      <input
        #field
        [id]="inputId"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        class="min-h-12 w-full rounded-xl border border-stone-300 bg-white py-2 pr-11 pl-11 text-base placeholder:text-stone-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-200 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        [placeholder]="placeholder() ?? ('common.searchPlaceholder' | t)"
        [value]="value()"
        (input)="onInput($event)"
      />
      @if (value()) {
        <button
          type="button"
          class="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-stone-100"
          [attr.aria-label]="'common.clearSearch' | t"
          (click)="value.set(''); submitted.emit('')"
        >
          <app-icon name="close" [size]="18" />
        </button>
      }
    </form>
  `,
})
export class SearchBox {
  readonly value = model('');
  readonly label = input<string>();
  readonly placeholder = input<string>();
  readonly submitted = output<string>();

  protected readonly inputId = `search-${nextId++}`;
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  /** Moves keyboard focus into the text field. */
  focus(): void {
    this.field()?.nativeElement.focus();
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}

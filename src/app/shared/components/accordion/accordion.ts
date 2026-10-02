import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { Icon } from '../icon/icon';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

let nextId = 0;

/** WAI-ARIA accordion: buttons with aria-expanded, arrow/Home/End keys move between headers. */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div
      class="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white"
    >
      @for (item of items(); track item.id) {
        @let open = isOpen(item.id);
        <div>
          <h3 class="text-base font-semibold sm:text-lg">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-primary-50/60"
              [id]="uid + '-h-' + item.id"
              [attr.aria-expanded]="open"
              [attr.aria-controls]="uid + '-p-' + item.id"
              data-accordion-trigger
              (click)="toggle(item.id)"
              (keydown)="onKeydown($event)"
            >
              <span>{{ item.title }}</span>
              <app-icon
                name="chevronDown"
                class="text-primary-700 transition-transform"
                [class.rotate-180]="open"
              />
            </button>
          </h3>
          <div
            role="region"
            [id]="uid + '-p-' + item.id"
            [attr.aria-labelledby]="uid + '-h-' + item.id"
            [hidden]="!open"
            class="px-5 pb-5 whitespace-pre-line text-ink-muted"
          >
            {{ item.content }}
          </div>
        </div>
      }
    </div>
  `,
})
export class Accordion {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly items = input.required<readonly AccordionItem[]>();
  /** Allow several panels open at once. */
  readonly multiple = input(false);

  protected readonly uid = `acc-${nextId++}`;
  private readonly openIds = signal<ReadonlySet<string>>(new Set());

  isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  toggle(id: string): void {
    this.openIds.update((ids) => {
      const next = new Set(this.multiple() ? ids : []);
      if (ids.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const current = event.currentTarget as HTMLElement;
    const triggers = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('[data-accordion-trigger]'),
    );
    const i = triggers.indexOf(current);
    const target =
      event.key === 'ArrowDown'
        ? triggers[(i + 1) % triggers.length]
        : event.key === 'ArrowUp'
          ? triggers[(i - 1 + triggers.length) % triggers.length]
          : event.key === 'Home'
            ? triggers[0]
            : event.key === 'End'
              ? triggers[triggers.length - 1]
              : undefined;
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
}

let nextId = 0;

/**
 * WAI-ARIA tabs with automatic activation. Projected content is the active panel;
 * the parent switches what it renders based on `selected`.
 */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="tablist"
      [attr.aria-label]="label()"
      class="flex gap-1 overflow-x-auto rounded-xl bg-stone-100 p-1"
    >
      @for (tab of tabs(); track tab.id) {
        @let active = tab.id === selected();
        <button
          type="button"
          role="tab"
          [id]="uid + '-tab-' + tab.id"
          [attr.aria-selected]="active"
          [attr.aria-controls]="uid + '-panel'"
          [attr.tabindex]="active ? 0 : -1"
          class="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors sm:text-base"
          [class]="active ? 'bg-white text-primary-800 shadow-sm' : 'text-ink-muted hover:text-ink'"
          (click)="select(tab.id)"
          (keydown)="onKeydown($event, $index)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
    <div
      role="tabpanel"
      [id]="uid + '-panel'"
      [attr.aria-labelledby]="uid + '-tab-' + selected()"
      tabindex="0"
      class="mt-6 rounded-lg focus-visible:outline-2"
    >
      <ng-content />
    </div>
  `,
})
export class Tabs {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly tabs = input.required<readonly TabItem[]>();
  readonly label = input.required<string>();
  readonly selected = model.required<string>();

  protected readonly uid = `tabs-${nextId++}`;

  select(id: string): void {
    this.selected.set(id);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs().length;
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % count
        : event.key === 'ArrowLeft'
          ? (index - 1 + count) % count
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? count - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    const tab = this.tabs()[next];
    this.select(tab.id);
    this.host.nativeElement.querySelector<HTMLElement>(`#${this.uid}-tab-${tab.id}`)?.focus();
  }
}

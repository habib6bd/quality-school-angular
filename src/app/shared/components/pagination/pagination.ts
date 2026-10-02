import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

type PageSlot = number | 'gap';

/** Returns page numbers to show, with `'gap'` markers for skipped ranges. */
export function pageSlots(current: number, total: number, siblings = 1): PageSlot[] {
  if (total <= 0) return [];
  const pages = new Set<number>([1, total]);
  for (let p = current - siblings; p <= current + siblings; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const slots: PageSlot[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) slots.push('gap');
    slots.push(page);
  });
  return slots;
}

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  template: `
    @if (totalPages() > 1) {
      <nav [attr.aria-label]="'common.pagination' | t" class="flex justify-center">
        <ul class="flex flex-wrap items-center gap-1">
          <li>
            <button
              type="button"
              class="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium hover:bg-primary-50 disabled:opacity-40"
              [disabled]="page() <= 1"
              (click)="go(page() - 1)"
            >
              <app-icon name="chevronLeft" [size]="16" />
              <span class="hidden sm:inline">{{ 'common.previous' | t }}</span>
              <span class="sr-only sm:hidden">{{ 'common.previous' | t }}</span>
            </button>
          </li>
          @for (slot of slots(); track $index) {
            <li>
              @if (slot === 'gap') {
                <span class="px-2 text-ink-muted" aria-hidden="true">…</span>
              } @else {
                <button
                  type="button"
                  class="min-h-10 min-w-10 rounded-lg text-sm font-semibold"
                  [class]="slot === page() ? 'bg-primary-700 text-white' : 'hover:bg-primary-50'"
                  [attr.aria-current]="slot === page() ? 'page' : null"
                  [attr.aria-label]="('common.page' | t) + ' ' + slot"
                  (click)="go(slot)"
                >
                  {{ slot }}
                </button>
              }
            </li>
          }
          <li>
            <button
              type="button"
              class="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium hover:bg-primary-50 disabled:opacity-40"
              [disabled]="page() >= totalPages()"
              (click)="go(page() + 1)"
            >
              <span class="hidden sm:inline">{{ 'common.next' | t }}</span>
              <span class="sr-only sm:hidden">{{ 'common.next' | t }}</span>
              <app-icon name="chevronRight" [size]="16" />
            </button>
          </li>
        </ul>
      </nav>
    }
  `,
})
export class Pagination {
  /** 1-based current page. */
  readonly page = model(1);
  readonly totalPages = input.required<number>();

  protected readonly slots = computed(() => pageSlots(this.page(), this.totalPages()));

  go(page: number): void {
    const clamped = Math.min(Math.max(page, 1), this.totalPages());
    if (clamped !== this.page()) this.page.set(clamped);
  }
}

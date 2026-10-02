import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

const SHOW_AFTER_PX = 600;

@Component({
  selector: 'app-back-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  host: { '(window:scroll)': 'onScroll()' },
  template: `
    @if (visible()) {
      <button
        type="button"
        class="fixed right-4 bottom-4 z-40 grid size-12 place-items-center rounded-full bg-primary-700 text-white shadow-lg transition hover:bg-primary-800 sm:right-6 sm:bottom-6"
        [attr.aria-label]="'common.backToTop' | t"
        (click)="scrollToTop()"
      >
        <app-icon name="arrowUp" [size]="22" />
      </button>
    }
  `,
})
export class BackToTop {
  private readonly document = inject(DOCUMENT);
  protected readonly visible = signal(false);

  protected onScroll(): void {
    const show = (this.document.defaultView?.scrollY ?? 0) > SHOW_AFTER_PX;
    if (show !== this.visible()) this.visible.set(show);
  }

  scrollToTop(): void {
    const view = this.document.defaultView;
    const reduce = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    view?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    // Move focus to the top of the page so keyboard users continue from there.
    this.document.getElementById('main-content')?.focus({ preventScroll: true });
  }
}

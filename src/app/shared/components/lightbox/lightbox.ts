import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';
import { Modal } from '../modal/modal';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

/** Full-screen image viewer. `index` is the open image, or `null` when closed. */
@Component({
  selector: 'app-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal, Icon, TranslatePipe],
  template: `
    <app-modal
      [open]="current() !== null"
      (openChange)="!$event && index.set(null)"
      [title]="current()?.caption || current()?.alt || ''"
      [hideTitle]="true"
      size="full"
      [dark]="true"
    >
      @if (current(); as image) {
        <figure class="relative flex flex-col items-center gap-3 px-2 pb-4 sm:px-14">
          <img
            [src]="image.src"
            [alt]="image.alt"
            class="max-h-[75dvh] w-auto max-w-full rounded-lg object-contain"
          />
          <figcaption class="text-center text-sm text-white/85">
            @if (image.caption) {
              <span class="block font-medium text-white">{{ image.caption }}</span>
            }
            <span aria-live="polite">{{
              'common.imageOf' | t: { current: (index() ?? 0) + 1, total: images().length }
            }}</span>
          </figcaption>
          @if (images().length > 1) {
            <button
              type="button"
              class="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
              [attr.aria-label]="'common.previous' | t"
              (click)="step(-1)"
            >
              <app-icon name="chevronLeft" [size]="24" />
            </button>
            <button
              type="button"
              class="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
              [attr.aria-label]="'common.next' | t"
              (click)="step(1)"
            >
              <app-icon name="chevronRight" [size]="24" />
            </button>
          }
        </figure>
      }
    </app-modal>
  `,
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class Lightbox {
  readonly images = input.required<readonly LightboxImage[]>();
  readonly index = model<number | null>(null);

  protected readonly current = computed(() => {
    const i = this.index();
    return i === null ? null : (this.images()[i] ?? null);
  });

  step(delta: number): void {
    const i = this.index();
    const count = this.images().length;
    if (i === null || count === 0) return;
    this.index.set((i + delta + count) % count);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.index() === null) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.step(-1);
    }
  }
}

import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * Accessible modal built on the native `<dialog>` element, which provides focus
 * containment, an inert background and Escape-to-close. Focus returns to the
 * element that opened it.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  template: `
    <!--
      Backdrop click is a mouse-only convenience; keyboard users close with Escape (native
      <dialog> behaviour) or the Close button, so no extra key handler is needed here.
    -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialog
      [class]="dialogClass()"
      [attr.aria-labelledby]="titleId"
      (close)="open.set(false)"
      (click)="onBackdropClick($event)"
    >
      <div [class]="panelClass()">
        <div class="flex items-start justify-between gap-4" [class]="headerClass()">
          <h2
            [id]="titleId"
            class="text-lg sm:text-xl"
            [class.sr-only]="hideTitle()"
            [class.text-white]="dark()"
          >
            {{ title() }}
          </h2>
          <button
            type="button"
            class="ml-auto grid size-10 shrink-0 place-items-center rounded-full transition-colors"
            [class]="dark() ? 'text-white hover:bg-white/15' : 'text-ink-muted hover:bg-stone-100'"
            [attr.aria-label]="'common.close' | t"
            (click)="close()"
          >
            <app-icon name="close" [size]="22" />
          </button>
        </div>
        <div [class]="bodyClass()"><ng-content /></div>
      </div>
    </dialog>
  `,
})
export class Modal implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private returnFocusTo: HTMLElement | null = null;

  readonly open = model(false);
  readonly title = input.required<string>();
  readonly hideTitle = input(false);
  readonly size = input<'md' | 'lg' | 'xl' | 'full'>('md');
  readonly placement = input<'center' | 'end'>('center');
  readonly dark = input(false);

  protected readonly titleId = `modal-title-${nextId++}`;

  protected readonly dialogClass = computed(() => {
    const base =
      'm-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-stone-950/70 backdrop:backdrop-blur-sm';
    return this.placement() === 'end'
      ? `${base} fixed inset-y-0 right-0 left-auto h-dvh max-h-dvh w-full max-w-sm`
      : `${base} fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] ${SIZES[this.size()]}`;
  });
  protected readonly panelClass = computed(() => {
    const tone = this.dark() ? 'bg-stone-950 text-white' : 'bg-white text-ink';
    return this.placement() === 'end'
      ? `${tone} flex h-full flex-col shadow-2xl`
      : `${tone} flex max-h-[90dvh] flex-col rounded-2xl shadow-2xl`;
  });
  protected readonly headerClass = computed(() =>
    this.hideTitle() ? 'p-2' : 'border-b border-stone-200/60 p-4 sm:p-5',
  );
  protected readonly bodyClass = computed(() =>
    this.size() === 'full'
      ? 'min-h-0 flex-1 overflow-y-auto'
      : 'min-h-0 flex-1 overflow-y-auto p-4 sm:p-6',
  );

  constructor() {
    effect(() => {
      const dialog = this.dialogRef().nativeElement;
      if (this.open() && !dialog.open) this.show(dialog);
      else if (!this.open() && dialog.open) this.hide(dialog);
      this.document.documentElement.classList.toggle('overflow-hidden', this.open());
      if (!this.open()) this.restoreFocus();
    });
  }

  close(): void {
    this.open.set(false);
  }

  ngOnDestroy(): void {
    this.document.documentElement.classList.remove('overflow-hidden');
  }

  protected onBackdropClick(event: MouseEvent): void {
    // Clicks on the ::backdrop are dispatched to the <dialog> element itself.
    if (event.target === this.dialogRef().nativeElement) this.close();
  }

  private show(dialog: HTMLDialogElement): void {
    const active = this.document.activeElement;
    this.returnFocusTo = active instanceof HTMLElement ? active : null;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  private hide(dialog: HTMLDialogElement): void {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  private restoreFocus(): void {
    const target = this.returnFocusTo;
    this.returnFocusTo = null;
    if (target?.isConnected) target.focus();
  }
}

const SIZES = { md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl', full: 'max-w-6xl' } as const;

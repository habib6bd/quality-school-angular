import { DOCUMENT, IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Gsap, loadGsap, prefersReducedMotion } from '../../../core/animation/gsap';
import { responsiveLoader, srcsetFor } from '../../../core/images/responsive';
import { GalleryItem } from '../../../core/models/gallery.model';
import { Icon } from '../../../shared/components/icon/icon';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Seconds each photo stays before the next one fades in. */
const INTERVAL = 6;
/** Seconds of the crossfade between two photos. */
const FADE = 1.4;
/** Scale a photo slowly zooms to while it is shown. */
const ZOOM = 1.07;
/** Pixels a horizontal swipe must travel to change the photo. */
const SWIPE = 40;

type Hold = 'hover' | 'focus' | 'hidden' | 'offscreen';

/**
 * Hero photo slideshow: a soft crossfade with a slow zoom (GSAP), autoplay with a pause button,
 * dots, arrows, arrow keys and swipe. Follows the WAI-ARIA carousel pattern: autoplay stops while
 * the pointer is over it, while a control has keyboard focus, and while it is off screen or the
 * tab is hidden. With reduced motion it does not autoplay or zoom, and photos switch instantly.
 * The server HTML shows the first photo, which is the only one loaded with priority.
 */
@Component({
  selector: 'app-hero-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveLoader }],
  imports: [NgOptimizedImage, Icon, LocalizePipe, TranslatePipe],
  template: `
    <div
      role="region"
      class="relative"
      [attr.aria-roledescription]="'common.carousel' | t"
      [attr.aria-label]="'home.heroSliderLabel' | t"
      (keydown)="onKeydown($event)"
      (focusin)="onFocusIn($event)"
      (focusout)="onFocusOut($event)"
      (pointerenter)="$event.pointerType === 'mouse' && hold('hover', true)"
      (pointerleave)="hold('hover', false)"
    >
      <div
        class="relative isolate aspect-[4/3] touch-pan-y overflow-hidden rounded-3xl bg-primary-950 shadow-2xl ring-4 ring-white/20 select-none"
        [attr.aria-live]="playing() ? 'off' : 'polite'"
        (pointerdown)="onPointerDown($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="pointerStart = null"
      >
        @for (item of slides(); track item.id; let i = $index) {
          <div
            #slide
            role="group"
            class="absolute inset-0 will-change-transform"
            [attr.aria-roledescription]="'common.slide' | t"
            [attr.aria-label]="'common.imageOf' | t: { current: i + 1, total: slides().length }"
            [attr.aria-hidden]="i === current() ? null : 'true'"
            [attr.inert]="i === current() ? null : ''"
            [style.opacity]="i === 0 ? 1 : 0"
          >
            @if (rendered().has(i)) {
              @let srcset = srcsetFor(item.image.src, item.image.width);
              @if (srcset) {
                <img
                  [ngSrc]="item.image.src"
                  [ngSrcset]="srcset"
                  sizes="(min-width: 1024px) 590px, 100vw"
                  [width]="item.image.width"
                  [height]="item.image.height"
                  [priority]="i === 0"
                  [alt]="item.image.alt | localize"
                  draggable="false"
                  class="size-full object-cover"
                />
              } @else {
                <img
                  [ngSrc]="item.image.src"
                  [width]="item.image.width"
                  [height]="item.image.height"
                  [priority]="i === 0"
                  [alt]="item.image.alt | localize"
                  draggable="false"
                  class="size-full object-cover"
                />
              }
            }
          </div>
        }

        @if (slides().length > 1) {
          <button
            type="button"
            class="absolute start-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:size-11"
            [attr.aria-label]="'common.previous' | t"
            (click)="go(current() - 1)"
          >
            <app-icon name="chevronLeft" [size]="22" />
          </button>
          <button
            type="button"
            class="absolute end-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:size-11"
            [attr.aria-label]="'common.next' | t"
            (click)="go(current() + 1)"
          >
            <app-icon name="chevronRight" [size]="22" />
          </button>

          <div
            class="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-1 bg-gradient-to-t from-black/50 to-transparent px-3 pt-12 pb-2"
          >
            <button
              type="button"
              class="grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15"
              [attr.aria-label]="(playing() ? 'common.pause' : 'common.play') | t"
              (click)="togglePlay()"
            >
              <app-icon [name]="playing() ? 'pause' : 'play'" [size]="16" />
            </button>
            @for (item of slides(); track item.id; let i = $index) {
              <button
                type="button"
                class="group grid h-11 w-7 place-items-center"
                [attr.aria-label]="'common.goToImage' | t: { n: i + 1 }"
                [attr.aria-current]="i === current() ? 'true' : null"
                (click)="go(i)"
              >
                <span
                  class="h-1.5 rounded-full transition-all duration-500"
                  [class]="
                    i === current() ? 'w-6 bg-white' : 'w-1.5 bg-white/50 group-hover:bg-white/80'
                  "
                ></span>
              </button>
            }
          </div>
          <div aria-hidden="true" class="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/10">
            <div #progress class="h-full origin-left scale-x-0 bg-accent-400"></div>
          </div>
        }
      </div>
    </div>
  `,
  host: {
    class: 'block',
    '(document:visibilitychange)': 'hold("hidden", document.hidden)',
  },
})
export class HeroSlider {
  readonly slides = input.required<readonly GalleryItem[]>();

  protected readonly current = signal(0);
  /** The visitor's choice: false after pressing pause, and by default with reduced motion. */
  protected readonly playing = signal(true);
  /** Slides whose photo is in the DOM: the shown one and the next, so the first photo loads alone. */
  protected readonly rendered = signal<ReadonlySet<number>>(new Set([0]));
  protected readonly srcsetFor = srcsetFor;
  protected readonly document = inject(DOCUMENT);
  protected pointerStart: { x: number; y: number } | null = null;

  private readonly slideRefs = viewChildren<ElementRef<HTMLElement>>('slide');
  private readonly progressRef = viewChild<ElementRef<HTMLElement>>('progress');
  private readonly holds = new Set<Hold>();
  private gsap: Gsap | null = null;
  private reducedMotion = false;
  /** Fills the progress bar over one interval, then shows the next photo. */
  private timer: ReturnType<Gsap['to']> | null = null;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let destroyed = false;
    let observer: IntersectionObserver | undefined;

    afterNextRender(() => {
      const view = this.document.defaultView;
      this.reducedMotion = prefersReducedMotion(view);
      if (this.reducedMotion) this.playing.set(false);
      this.preload(this.current() + 1);

      if (view && 'IntersectionObserver' in view) {
        observer = new view.IntersectionObserver(([entry]) =>
          this.hold('offscreen', !entry.isIntersecting),
        );
        observer.observe(host);
      }

      void loadGsap().then((gsap) => {
        if (destroyed) return;
        this.gsap = gsap;
        const shown = this.slideElements()[this.current()];
        if (shown && !this.reducedMotion) this.zoom(shown);
        this.startTimer();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      observer?.disconnect();
      this.timer?.kill();
      this.gsap?.killTweensOf(this.slideElements());
    });
  }

  /** Shows photo `index` (wrapping around at both ends). */
  go(index: number): void {
    const count = this.slides().length;
    if (count < 2) return;
    const to = ((index % count) + count) % count;
    const from = this.current();
    if (to === from) return;

    this.current.set(to);
    this.preload(to);
    this.preload(to + 1);
    this.crossfade(from, to);
    this.startTimer();
  }

  togglePlay(): void {
    this.playing.update((playing) => !playing);
    if (!this.timer) this.startTimer();
    this.applyPlayback();
  }

  protected hold(reason: Hold, on: boolean): void {
    if (on) this.holds.add(reason);
    else this.holds.delete(reason);
    this.applyPlayback();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.go(this.current() + (event.key === 'ArrowRight' ? 1 : -1));
  }

  /** Pause for keyboard focus only: a mouse click on a control must not stop autoplay for good. */
  protected onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    try {
      if (target.matches(':focus-visible')) this.hold('focus', true);
    } catch {
      this.hold('focus', true);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !(event.currentTarget as HTMLElement).contains(next)) this.hold('focus', false);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pointerStart = { x: event.clientX, y: event.clientY };
  }

  protected onPointerUp(event: PointerEvent): void {
    const start = this.pointerStart;
    this.pointerStart = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy)) return;
    this.go(this.current() + (dx < 0 ? 1 : -1));
  }

  private slideElements(): HTMLElement[] {
    return this.slideRefs().map((ref) => ref.nativeElement);
  }

  private preload(index: number): void {
    const count = this.slides().length;
    if (count === 0) return;
    const i = index % count;
    this.rendered.update((set) => (set.has(i) ? set : new Set([...set, i])));
  }

  private crossfade(from: number, to: number): void {
    const slides = this.slideElements();
    const outgoing = slides[from];
    const incoming = slides[to];
    if (!outgoing || !incoming) return;

    const gsap = this.gsap;
    if (!gsap || this.reducedMotion) {
      outgoing.style.opacity = '0';
      incoming.style.opacity = '1';
      return;
    }
    // The outgoing photo keeps zooming while it fades out; only its fade is replaced.
    gsap.killTweensOf(outgoing, 'opacity');
    gsap.killTweensOf(incoming);
    gsap.set(slides, { zIndex: 0 });
    gsap.set(outgoing, { zIndex: 1 });
    gsap.set(incoming, { zIndex: 2, scale: 1 });
    gsap.to(outgoing, { opacity: 0, duration: FADE, ease: 'power2.inOut' });
    gsap.to(incoming, { opacity: 1, duration: FADE, ease: 'power2.inOut' });
    this.zoom(incoming);
  }

  private zoom(slide: HTMLElement): void {
    this.gsap?.to(slide, { scale: ZOOM, duration: INTERVAL + FADE * 2, ease: 'sine.out' });
  }

  private startTimer(): void {
    this.timer?.kill();
    this.timer = null;
    const progress = this.progressRef()?.nativeElement;
    if (!this.gsap || !progress) return;
    this.timer = this.gsap.fromTo(
      progress,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: INTERVAL,
        ease: 'none',
        onComplete: () => this.go(this.current() + 1),
      },
    );
    this.applyPlayback();
  }

  private applyPlayback(): void {
    this.timer?.paused(!this.playing() || this.holds.size > 0);
  }
}

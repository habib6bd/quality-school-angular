import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { loadGsap, prefersReducedMotion } from '../../../core/animation/gsap';
import { GalleryItem } from '../../../core/models/gallery.model';
import { GalleryService } from '../../../core/services/gallery.service';
import { SchoolInfoService } from '../../../core/services/school-info.service';
import { Icon } from '../../../shared/components/icon/icon';
import { ButtonDirective } from '../../../shared/directives/button.directive';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HeroSlider } from './hero-slider';

@Component({
  selector: 'app-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroSlider,
    RouterLink,
    ButtonDirective,
    Icon,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <section
      class="relative isolate overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white"
      aria-labelledby="home-title"
    >
      <div
        aria-hidden="true"
        class="absolute inset-0 -z-10 opacity-15 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]"
      ></div>
      <div
        #glow
        aria-hidden="true"
        class="absolute -right-24 -bottom-24 -z-10 size-96 rounded-full bg-accent-500/25 blur-3xl"
      ></div>
      <div class="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 id="home-title" class="text-4xl text-white sm:text-5xl lg:text-6xl">
            {{ info().name | localize }}
          </h1>
          <p class="mt-4 font-display text-xl font-medium text-accent-200 sm:text-2xl">
            {{ 'home.heroTagline' | t }}
          </p>
          <p class="mt-4 max-w-xl text-base text-white/90 sm:text-lg">{{ 'home.heroLead' | t }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a appButton variant="accent" size="lg" [routerLink]="'admission' | pagePath">
              {{ 'home.heroCta' | t }}
              <app-icon name="arrowRight" [size]="20" />
            </a>
            <a appButton variant="light" size="lg" [routerLink]="'contact' | pagePath">
              {{ 'nav.contact' | t }}
            </a>
          </div>
          <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            @for (point of points; track point) {
              <li class="inline-flex items-center gap-2">
                <app-icon name="check" [size]="16" class="text-accent-300" />
                {{ point | t }}
              </li>
            }
          </ul>
        </div>
        @if (slides().length) {
          <app-hero-slider [slides]="slides()" />
        }
      </div>
    </section>
  `,
})
export class HomeHero {
  protected readonly info = inject(SchoolInfoService).info;
  protected readonly points = ['home.heroPoint1', 'home.heroPoint2', 'home.heroPoint3'] as const;
  /** The first six gallery photos. The bundled data arrives synchronously, so the server HTML and the first client render both include the slider. */
  protected readonly slides = toSignal(inject(GalleryService).featured(6), {
    initialValue: [] as readonly GalleryItem[],
  });

  private readonly glow = viewChild.required<ElementRef<HTMLElement>>('glow');

  constructor() {
    const document = inject(DOCUMENT);
    let destroyed = false;
    let stop: (() => void) | undefined;

    // A slow drift of the decorative glow. The text is already painted by the server, so it is not animated in.
    afterNextRender(() => {
      if (prefersReducedMotion(document.defaultView)) return;
      void loadGsap().then((gsap) => {
        if (destroyed) return;
        const tween = gsap.to(this.glow().nativeElement, {
          x: -60,
          y: -40,
          scale: 1.15,
          duration: 14,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        stop = () => tween.kill();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      stop?.();
    });
  }
}

import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { responsiveLoader, srcsetFor } from '../../../core/images/responsive';
import { GalleryItem } from '../../../core/models/gallery.model';
import { Badge } from '../badge/badge';
import { Icon } from '../icon/icon';
import { LocalizePipe } from '../../pipes/localize.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MosaicSpan, narrowMosaic, sizesFor, spanClasses, wideMosaic } from './mosaic';

/** The call-to-action card that opens the mosaic. Texts are already translated. */
export interface GalleryFeature {
  eyebrow: string;
  title: string;
  linkLabel: string;
  /** Router commands of the card's link. */
  link: readonly string[];
}

interface PhotoTile {
  item: GalleryItem;
  classes: string;
  sizes: string;
}

const FEATURE_NARROW: MosaicSpan = { cols: 2, rows: 2 };

/**
 * Photo mosaic: four columns of tall, square and wide tiles on desktop, two columns below. An
 * optional feature card leads it. Every photo is a button that asks the parent to open it.
 */
@Component({
  selector: 'app-gallery-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, Badge, Icon, LocalizePipe, TranslatePipe],
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveLoader }],
  template: `
    <ul
      class="grid auto-rows-[5rem] grid-cols-2 gap-3 sm:auto-rows-[7rem] sm:gap-4 lg:auto-rows-[6.25rem] lg:grid-cols-4 xl:auto-rows-[7.5rem]"
    >
      @if (feature(); as card) {
        <li [class]="featureClasses()" data-feature>
          <div
            class="relative isolate flex h-full flex-col justify-center overflow-hidden rounded-xl bg-primary-800 p-6 text-white sm:p-8 lg:p-10"
          >
            <span
              aria-hidden="true"
              class="absolute -end-16 -top-16 -z-10 size-56 rounded-full bg-primary-700/70"
            ></span>
            <span
              aria-hidden="true"
              class="absolute -bottom-24 end-20 -z-10 size-48 rounded-full border-[1.5rem] border-primary-700/40"
            ></span>
            <span aria-hidden="true" class="mb-3 block h-1 w-10 rounded-full bg-accent-400"></span>
            <p class="text-sm font-semibold text-primary-100 uppercase">{{ card.eyebrow }}</p>
            <p
              class="mt-1 text-3xl leading-tight font-extrabold uppercase [text-shadow:0_2px_6px_rgb(0_0_0/0.3)] sm:text-4xl xl:text-5xl"
            >
              {{ card.title }}
            </p>
            <a
              [routerLink]="card.link"
              class="mt-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-stone-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {{ card.linkLabel }}
              <app-icon name="arrowRight" [size]="16" class="rtl:rotate-180" />
            </a>
          </div>
        </li>
      }
      @for (tile of tiles(); track tile.item.id; let i = $index) {
        @let item = tile.item;
        <li [class]="tile.classes">
          <button
            type="button"
            class="group relative block size-full overflow-hidden rounded-xl bg-stone-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-secondary-600"
            [attr.aria-label]="('gallery.open' | t) + ': ' + (item.image.alt | localize)"
            (click)="choose.emit(i)"
          >
            @let srcset = srcsetFor(item.image.src, item.image.width);
            @if (srcset) {
              <img
                [ngSrc]="item.image.src"
                [ngSrcset]="srcset"
                [sizes]="tile.sizes"
                [width]="item.image.width"
                [height]="item.image.height"
                [alt]="item.image.alt | localize"
                [priority]="priority() && i < 2"
                class="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
              />
            } @else {
              <img
                [ngSrc]="item.image.src"
                [width]="item.image.width"
                [height]="item.image.height"
                [alt]="item.image.alt | localize"
                [priority]="priority() && i < 2"
                class="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
              />
            }
            <span
              aria-hidden="true"
              class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            ></span>
            <span
              aria-hidden="true"
              class="absolute end-3 bottom-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white/90 text-primary-800 opacity-0 shadow-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            >
              <app-icon name="search" [size]="18" />
            </span>
            @if (item.image.isDemo) {
              <app-badge tone="demo" class="absolute start-2 top-2">{{
                'common.demoImage' | t
              }}</app-badge>
            }
          </button>
        </li>
      }
    </ul>
  `,
})
export class GalleryGrid {
  readonly items = input.required<readonly GalleryItem[]>();
  readonly priority = input(false);
  readonly feature = input<GalleryFeature>();

  protected readonly srcsetFor = srcsetFor;

  /** Index (within `items`) of the photo the visitor chose. */
  readonly choose = output<number>();

  private readonly wide = computed(() =>
    wideMosaic(this.items().length + (this.feature() ? 1 : 0)),
  );

  protected readonly featureClasses = computed(() => spanClasses(FEATURE_NARROW, this.wide()[0]));

  protected readonly tiles = computed<PhotoTile[]>(() => {
    const items = this.items();
    const narrow = narrowMosaic(items.length);
    const wide = this.wide().slice(this.feature() ? 1 : 0);
    return items.map((item, i) => ({
      item,
      classes: spanClasses(narrow[i], wide[i]),
      sizes: sizesFor(narrow[i], wide[i]),
    }));
  });
}

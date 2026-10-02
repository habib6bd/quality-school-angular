import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { responsiveLoader, srcsetFor } from '../../../core/images/responsive';
import { GalleryItem } from '../../../core/models/gallery.model';
import { Badge } from '../badge/badge';
import { LocalizePipe } from '../../pipes/localize.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Responsive photo grid; every photo is a button that asks the parent to open it. */
@Component({
  selector: 'app-gallery-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, Badge, LocalizePipe, TranslatePipe],
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveLoader }],
  template: `
    <ul class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      @for (item of items(); track item.id; let i = $index) {
        <li>
          <button
            type="button"
            class="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-200 shadow-[var(--shadow-card)]"
            [attr.aria-label]="('gallery.open' | t) + ': ' + (item.image.alt | localize)"
            (click)="choose.emit(i)"
          >
            @let srcset = srcsetFor(item.image.src, item.image.width);
            @if (srcset) {
              <img
                [ngSrc]="item.image.src"
                [ngSrcset]="srcset"
                sizes="(min-width: 1024px) 400px, 50vw"
                [width]="item.image.width"
                [height]="item.image.height"
                [alt]="item.image.alt | localize"
                [priority]="priority() && i < 2"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            } @else {
              <img
                [ngSrc]="item.image.src"
                [width]="item.image.width"
                [height]="item.image.height"
                [alt]="item.image.alt | localize"
                [priority]="priority() && i < 2"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            }
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

  protected readonly srcsetFor = srcsetFor;

  /** Index (within `items`) of the photo the visitor chose. */
  readonly choose = output<number>();
}

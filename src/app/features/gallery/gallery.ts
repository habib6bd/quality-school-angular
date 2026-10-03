import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationKey } from '../../core/i18n/translation.service';
import { GalleryCategory, GalleryItem } from '../../core/models/gallery.model';
import { GalleryService } from '../../core/services/gallery.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { GalleryGrid } from '../../shared/components/gallery-grid/gallery-grid';
import { Lightbox, LightboxImage } from '../../shared/components/lightbox/lightbox';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export type GalleryFilter = GalleryCategory | 'all';

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, TranslationKey> = {
  'annual-sports': 'gallery.category.annualSports',
  'school-events': 'gallery.category.schoolEvents',
};
const CATEGORIES = Object.keys(GALLERY_CATEGORY_LABELS) as GalleryCategory[];

export function isGalleryCategory(value: unknown): value is GalleryCategory {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value);
}

/** Photo gallery. The category lives in the URL (`?category=annual-sports`). */
@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AsyncState,
    ButtonDirective,
    GalleryGrid,
    Lightbox,
    PageScaffold,
    RelatedLinks,
    LocaleNumberPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="gallery" [intro]="'gallery.intro' | t">
      <nav [attr.aria-label]="'gallery.filterLabel' | t">
        <ul class="flex flex-wrap gap-2">
          @for (chip of chips; track chip.value) {
            @let active = chip.value === activeCategory();
            <li>
              <a
                [routerLink]="'gallery' | pagePath"
                [queryParams]="{ category: chip.value === 'all' ? null : chip.value }"
                class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors"
                [class]="
                  active
                    ? 'border-primary-700 bg-primary-700 text-white'
                    : 'border-stone-300 bg-white text-secondary-950 hover:bg-primary-50'
                "
                [attr.aria-current]="active ? 'true' : null"
              >
                {{ chip.label | t }}
                <span
                  class="rounded-full px-2 text-xs"
                  [class]="active ? 'bg-primary-900' : 'bg-stone-100'"
                  >{{ count(chip.value) | localeNumber }}</span
                >
              </a>
            </li>
          }
        </ul>
      </nav>

      <app-async-state
        class="mt-6 block"
        [status]="photos.status()"
        [empty]="visible().length === 0"
        [emptyTitle]="'gallery.emptyTitle' | t"
        [emptyMessage]="'gallery.emptyMessage' | t"
        emptyIcon="image"
        [skeletonCount]="6"
        (retry)="photos.reload()"
      >
        <app-gallery-grid
          [items]="visible()"
          [priority]="true"
          [feature]="{
            eyebrow: 'gallery.explore' | t,
            title: activeLabel() | t,
            linkLabel: 'gallery.watchVideos' | t,
            link: 'videos' | pagePath,
          }"
          (choose)="selected.set($event)"
        />
        <a empty appButton variant="outline" [routerLink]="'gallery' | pagePath">{{
          'gallery.showAll' | t
        }}</a>
        <app-lightbox [images]="images()" [(index)]="selected" />
      </app-async-state>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class GalleryPage {
  protected readonly related = ['videos', 'events', 'achievements'] as const;
  private readonly service = inject(GalleryService);
  private readonly language = inject(LanguageService);

  /** Query parameter, bound by `withComponentInputBinding`. */
  readonly category = input<string>();

  protected readonly selected = signal<number | null>(null);
  protected readonly chips: readonly { value: GalleryFilter; label: TranslationKey }[] = [
    { value: 'all', label: 'gallery.all' },
    ...CATEGORIES.map((value) => ({ value, label: GALLERY_CATEGORY_LABELS[value] })),
  ];
  protected readonly photos = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly GalleryItem[],
  });
  protected readonly activeCategory = computed<GalleryFilter>(() => {
    const value = this.category();
    return isGalleryCategory(value) ? value : 'all';
  });
  protected readonly visible = computed(() => {
    const category = this.activeCategory();
    return category === 'all'
      ? this.photos.value()
      : this.photos.value().filter((item) => item.category === category);
  });
  protected readonly activeLabel = computed<TranslationKey>(() => {
    const category = this.activeCategory();
    return category === 'all' ? 'gallery.all' : GALLERY_CATEGORY_LABELS[category];
  });
  /** The same photos for the lightbox, described by their alt text. */
  protected readonly images = computed<LightboxImage[]>(() =>
    this.visible().map((item) => {
      const alt = pickLocalized(item.image.alt, this.language.lang());
      return { src: item.image.src, alt, caption: alt };
    }),
  );

  protected count(value: GalleryFilter): number {
    return value === 'all'
      ? this.photos.value().length
      : this.photos.value().filter((item) => item.category === value).length;
  }
}

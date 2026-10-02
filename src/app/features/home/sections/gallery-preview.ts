import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../../core/i18n/language.service';
import { pickLocalized } from '../../../core/i18n/localized';
import { GalleryItem } from '../../../core/models/gallery.model';
import { GalleryService } from '../../../core/services/gallery.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { GalleryGrid } from '../../../shared/components/gallery-grid/gallery-grid';
import { Lightbox, LightboxImage } from '../../../shared/components/lightbox/lightbox';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, GalleryGrid, Lightbox, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section
      tone="white"
      [eyebrow]="'nav.campusLife' | t"
      [title]="'nav.gallery' | t"
      [link]="'gallery' | pagePath"
    >
      <app-async-state
        [status]="items.status()"
        [empty]="items.value().length === 0"
        (retry)="items.reload()"
      >
        <app-gallery-grid [items]="items.value()" (choose)="selected.set($event)" />
        <app-lightbox [images]="images()" [(index)]="selected" />
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeGallery {
  private readonly service = inject(GalleryService);
  private readonly language = inject(LanguageService);

  protected readonly selected = signal<number | null>(null);
  protected readonly items = rxResource({
    stream: () => this.service.featured(6),
    defaultValue: [] as readonly GalleryItem[],
  });
  protected readonly images = computed<LightboxImage[]>(() =>
    this.items.value().map((item) => ({
      src: item.image.src,
      alt: pickLocalized(item.image.alt, this.language.lang()),
    })),
  );
}

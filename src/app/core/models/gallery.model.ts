import { Localized } from '../i18n/localized';
import { ImageAsset } from './media.model';

export type GalleryCategory = 'annual-sports' | 'school-events';

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  image: ImageAsset;
  caption?: Localized;
}

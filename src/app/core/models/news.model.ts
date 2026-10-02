import { Localized } from '../i18n/localized';
import { ImageAsset } from './media.model';

export interface NewsArticle {
  slug: string;
  title: Localized;
  summary: Localized;
  /** Paragraphs of the article body. */
  body: Localized<readonly string[]>;
  publishedAt: string;
  image?: ImageAsset;
}

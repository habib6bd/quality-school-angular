import { Localized } from '../i18n/localized';
import { ImageAsset } from './media.model';

export interface SchoolEvent {
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized<readonly string[]>;
  /** ISO date of the first day. */
  startDate: string;
  /** ISO date of the last day; omitted for single-day events. */
  endDate?: string;
  location?: Localized;
  image?: ImageAsset;
}

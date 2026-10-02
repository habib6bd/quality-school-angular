import { Localized } from '../i18n/localized';

export interface SchoolVideo {
  id: string;
  title: Localized;
  /** YouTube video id; the embed and thumbnail URLs are derived from it. */
  youtubeId: string;
}

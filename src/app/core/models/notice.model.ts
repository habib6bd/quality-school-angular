import { Localized } from '../i18n/localized';

export type NoticeCategory = 'admission' | 'academic' | 'exam' | 'holiday' | 'general';

export interface NoticeAttachment {
  kind: 'image';
  /** Local path (relative to the site root) of a file shipped with the site. */
  src: string;
  width: number;
  height: number;
  label: Localized;
}

export interface Notice {
  slug: string;
  title: Localized;
  summary: Localized;
  category: NoticeCategory;
  /** ISO date (`YYYY-MM-DD`). */
  publishedAt: string;
  /** ISO date after which the notice is no longer current; omitted when it does not expire. */
  expiresAt?: string;
  attachments: readonly NoticeAttachment[];
}

import { Localized } from '../i18n/localized';

export interface Announcement {
  id: string;
  message: Localized;
  /** Nav path (relative to the language prefix) for the call-to-action link. */
  linkPath?: string;
  linkLabel?: Localized;
  /** ISO dates (inclusive); the announcement is hidden outside this window. */
  startDate: string;
  endDate: string;
}

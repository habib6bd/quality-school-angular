import { Localized } from '../i18n/localized';

export type CalendarCategory = 'class' | 'exam' | 'holiday' | 'event';

export interface CalendarEvent {
  id: string;
  title: Localized;
  category: CalendarCategory;
  /** ISO date (`YYYY-MM-DD`) of the first day. */
  startDate: string;
  /** ISO date of the last day; omitted for single-day entries. */
  endDate?: string;
}

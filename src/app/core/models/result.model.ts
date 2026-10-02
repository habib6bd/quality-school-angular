import { Localized } from '../i18n/localized';

export interface ResultOptions {
  /** Exams the school offers lookups for; empty until the school supplies them. */
  exams: readonly { id: string; name: Localized }[];
  years: readonly number[];
}

export interface ResultQuery {
  classSlug: string;
  /** Empty when the school has not published any exam list. */
  examId: string;
  year: number | null;
  /** Roll number as typed, digits only (ASCII). */
  roll: string;
}

/** One line of a result as the API chooses to expose it (label + value). No other fields are shown. */
export interface ResultRow {
  label: Localized;
  value: string;
}

export type ResultLookup =
  /** No results system is connected yet. */
  | { status: 'unavailable' }
  | { status: 'not-found' }
  | { status: 'found'; rows: readonly ResultRow[] };

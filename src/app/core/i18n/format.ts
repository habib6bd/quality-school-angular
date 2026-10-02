import { Lang } from './lang';

/** BCP 47 locales used for number and date formatting. */
export const LOCALES: Record<Lang, string> = { bn: 'bn-BD', en: 'en-GB' };

const numberFormats = new Map<string, Intl.NumberFormat>();

/** Formats a number with the language's digits (Bangla digits on Bangla pages). */
export function formatNumber(value: number, lang: Lang, grouping = true): string {
  const key = `${lang}:${grouping}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(LOCALES[lang], { useGrouping: grouping });
    numberFormats.set(key, format);
  }
  return format.format(value);
}

export type DateStyle = 'long' | 'medium' | 'short';

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  short: { day: 'numeric', month: 'short' },
};

/**
 * Formats an ISO date (`YYYY-MM-DD` or full timestamp) for display.
 * Date-only strings are treated as calendar dates, so the day never shifts with time zones.
 */
export function formatDate(iso: string, lang: Lang, style: DateStyle = 'long'): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const date = new Date(dateOnly ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALES[lang], {
    ...DATE_OPTIONS[style],
    ...(dateOnly ? { timeZone: 'UTC' } : { timeZone: 'Asia/Dhaka' }),
  }).format(date);
}

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Rewrites ASCII digits in free text (phone numbers, codes) as Bangla digits on Bangla pages. */
export function formatDigits(text: string, lang: Lang): string {
  return lang === 'bn' ? text.replace(/\d/g, (digit) => BANGLA_DIGITS[Number(digit)]) : text;
}

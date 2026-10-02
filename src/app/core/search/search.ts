import { Lang } from '../i18n/lang';
import { Localized, pickLocalized } from '../i18n/localized';

export type SearchKind = 'page' | 'teacher' | 'notice' | 'news' | 'event' | 'resource';

/** Order in which result groups are listed and in which ties are broken. */
export const SEARCH_KINDS: readonly SearchKind[] = [
  'page',
  'teacher',
  'notice',
  'news',
  'event',
  'resource',
];

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: Localized;
  /** Summary or keywords, searched and shown as the snippet. */
  text: Localized;
  /** Path relative to the language prefix, e.g. `teachers/salma-alam-sonia`. */
  path: string;
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
}

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Lower-cases and writes Bangla digits as ASCII digits, so "২০২৬" finds "2026" and vice versa. */
export function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));
}

/** Words of a query: whitespace-separated, normalised, without duplicates. */
export function tokenize(query: string): string[] {
  return [...new Set(normalizeForSearch(query).split(/\s+/).filter(Boolean))];
}

function haystack(value: Localized): string {
  // A newline joins the two languages so a phrase can never match across the seam.
  return normalizeForSearch(`${value.bn}\n${value.en ?? ''}`);
}

/**
 * Finds entries containing every word of the query (in either language). Title matches count
 * more than text matches; a title containing the whole phrase counts most. Results are sorted
 * by score, then by kind, then by title.
 */
export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  lang: Lang,
): SearchHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const phrase = normalizeForSearch(query.trim());
  const hits: SearchHit[] = [];
  for (const entry of entries) {
    const title = haystack(entry.title);
    const text = haystack(entry.text);
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      if (title.includes(token)) score += 10;
      else if (text.includes(token)) score += 3;
      else {
        matchedAll = false;
        break;
      }
    }
    if (!matchedAll) continue;
    if (tokens.length > 1 && title.includes(phrase)) score += 5;
    hits.push({ entry, score });
  }
  const kindRank = (hit: SearchHit) => SEARCH_KINDS.indexOf(hit.entry.kind);
  return hits.sort(
    (a, b) =>
      b.score - a.score ||
      kindRank(a) - kindRank(b) ||
      pickLocalized(a.entry.title, lang).localeCompare(pickLocalized(b.entry.title, lang), lang),
  );
}

export interface Segment {
  text: string;
  match: boolean;
}

/** Splits text into plain and matching parts (for `<mark>`), without ever building HTML. */
export function highlightSegments(text: string, tokens: readonly string[]): Segment[] {
  const lower = normalizeForSearch(text);
  if (lower.length !== text.length || tokens.length === 0) return [{ text, match: false }];
  const ranges: [number, number][] = [];
  for (const token of tokens) {
    let from = 0;
    for (let at = lower.indexOf(token, from); at >= 0; at = lower.indexOf(token, from)) {
      ranges.push([at, at + token.length]);
      from = at + token.length;
    }
  }
  if (ranges.length === 0) return [{ text, match: false }];
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  const segments: Segment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), match: false });
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}

/** A short snippet around the first match (or the start), with ellipses when cut. */
export function snippet(text: string, tokens: readonly string[], max = 160): string {
  if (text.length <= max) return text;
  const lower = normalizeForSearch(text);
  const first = tokens
    .map((token) => lower.indexOf(token))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  const start = Math.max(0, (first ?? 0) - 40);
  const end = Math.min(text.length, start + max);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

import { Lang } from '../i18n/lang';
import { pickLocalized } from '../i18n/localized';
import { BreadcrumbItem } from '../models/breadcrumb.model';
import { SchoolEvent } from '../models/event.model';
import { NewsArticle } from '../models/news.model';
import { SchoolInfo } from '../models/school-info.model';
import { absoluteUrl, assetUrl } from './urls';

type JsonLd = Record<string, unknown>;

/** `01711732486` → `+8801711732486` (Bangladesh country code, as used on the school's own banner). */
export function internationalPhone(local: string): string {
  const digits = local.replace(/\D/g, '');
  return digits.startsWith('880') ? `+${digits}` : `+88${digits}`;
}

/** The school as a schema.org `School`; only facts the site actually holds are included. */
export function schoolJsonLd(info: SchoolInfo, lang: Lang, siteUrl?: string): JsonLd {
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: pickLocalized(info.name, lang),
    alternateName: pickLocalized(info.shortName, lang),
    url: absoluteUrl(lang, '/', siteUrl),
    logo: assetUrl(info.logo.src, siteUrl),
    foundingDate: String(info.establishedYear),
    inLanguage: ['bn', 'en'],
  };
  if (info.address) {
    data['address'] = {
      '@type': 'PostalAddress',
      streetAddress: pickLocalized(info.address, lang),
      addressLocality: lang === 'bn' ? 'ঢাকা' : 'Dhaka',
      addressCountry: 'BD',
    };
  }
  if (info.phones.length) data['telephone'] = info.phones.map(internationalPhone);
  if (info.emails.length) data['email'] = info.emails;
  if (info.social.length) data['sameAs'] = info.social.map((s) => s.url);
  return data;
}

/**
 * Breadcrumb trail. Items without a link (the current page) use `currentUrl`; links are router
 * commands (`['/', 'bn', 'about']`) turned into absolute URLs.
 */
export function breadcrumbJsonLd(
  items: readonly BreadcrumbItem[],
  currentUrl: string,
  siteUrl = '',
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.link ? `${siteUrl.replace(/\/+$/, '')}${linkToPath(item.link)}` : currentUrl,
    })),
  };
}

function linkToPath(link: readonly string[]): string {
  const path = link.filter((part) => part !== '/').join('/');
  return `/${path}`;
}

/** `NewsArticle` for a published article; call only for real articles. */
export function newsArticleJsonLd(
  article: NewsArticle,
  lang: Lang,
  url: string,
  siteUrl?: string,
): JsonLd {
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: pickLocalized(article.title, lang),
    description: pickLocalized(article.summary, lang),
    datePublished: article.publishedAt,
    inLanguage: lang,
    mainEntityOfPage: url,
  };
  if (article.image) data['image'] = assetUrl(article.image.src, siteUrl);
  return data;
}

/** `Event` for a published event; call only for real events. */
export function eventJsonLd(event: SchoolEvent, lang: Lang, url: string, siteUrl?: string): JsonLd {
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: pickLocalized(event.title, lang),
    description: pickLocalized(event.summary, lang),
    startDate: event.startDate,
    inLanguage: lang,
    url,
  };
  if (event.endDate) data['endDate'] = event.endDate;
  if (event.location)
    data['location'] = { '@type': 'Place', name: pickLocalized(event.location, lang) };
  if (event.image) data['image'] = assetUrl(event.image.src, siteUrl);
  return data;
}

/** JSON for a `<script type="application/ld+json">`; `<` is escaped so content can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

import { TranslationKey } from '../i18n/translation.service';

/**
 * Every static public page, keyed by its path relative to the language prefix.
 * This single list drives the router, SSR prerendering, page titles, breadcrumbs
 * and (later) the sitemap, so a page only needs to be declared once.
 */
export interface PageDef {
  path: string;
  titleKey: TranslationKey;
  /** Meta description shown in search results and link previews. */
  descriptionKey: TranslationKey;
  /** Path of the parent page for breadcrumbs; omitted means "child of home". */
  parent?: string;
  /**
   * The page's content depends on URL query parameters (filters, page number, search text).
   * It is rendered per request on the server instead of prerendered, so the HTML always matches
   * what the browser hydrates.
   */
  queryDriven?: boolean;
}

export const PAGES: readonly PageDef[] = [
  { path: '', titleKey: 'nav.home', descriptionKey: 'seo.home' },

  { path: 'about', titleKey: 'nav.aboutSchool', descriptionKey: 'seo.about' },
  {
    path: 'about/history',
    titleKey: 'nav.history',
    descriptionKey: 'seo.history',
    parent: 'about',
  },
  {
    path: 'about/mission-vision',
    titleKey: 'nav.missionVision',
    descriptionKey: 'seo.missionVision',
    parent: 'about',
  },
  {
    path: 'about/philosophy',
    titleKey: 'nav.philosophy',
    descriptionKey: 'seo.philosophy',
    parent: 'about',
  },
  {
    path: 'about/messages',
    titleKey: 'nav.messages',
    descriptionKey: 'seo.messages',
    parent: 'about',
  },
  {
    path: 'about/facilities',
    titleKey: 'nav.facilities',
    descriptionKey: 'seo.facilities',
    parent: 'about',
  },

  { path: 'academics', titleKey: 'nav.academicOverview', descriptionKey: 'seo.academics' },
  {
    path: 'academics/programs',
    titleKey: 'nav.programs',
    descriptionKey: 'seo.programs',
    parent: 'academics',
  },
  {
    path: 'academics/calendar',
    titleKey: 'nav.calendar',
    descriptionKey: 'seo.calendar',
    parent: 'academics',
    queryDriven: true,
  },
  { path: 'results', titleKey: 'nav.results', descriptionKey: 'seo.results', parent: 'academics' },
  {
    path: 'resources',
    titleKey: 'nav.resources',
    descriptionKey: 'seo.resources',
    parent: 'academics',
    queryDriven: true,
  },

  { path: 'admission', titleKey: 'nav.admissionInfo', descriptionKey: 'seo.admission' },
  {
    path: 'admission/apply',
    titleKey: 'nav.applyOnline',
    descriptionKey: 'seo.apply',
    parent: 'admission',
  },
  { path: 'faq', titleKey: 'nav.faq', descriptionKey: 'seo.faq' },

  { path: 'teachers', titleKey: 'nav.teachers', descriptionKey: 'seo.teachers', queryDriven: true },
  { path: 'notices', titleKey: 'nav.notices', descriptionKey: 'seo.notices', queryDriven: true },
  { path: 'news', titleKey: 'nav.news', descriptionKey: 'seo.news', queryDriven: true },
  { path: 'events', titleKey: 'nav.events', descriptionKey: 'seo.events', queryDriven: true },
  { path: 'gallery', titleKey: 'nav.gallery', descriptionKey: 'seo.gallery', queryDriven: true },
  { path: 'videos', titleKey: 'nav.videos', descriptionKey: 'seo.videos' },
  { path: 'achievements', titleKey: 'nav.achievements', descriptionKey: 'seo.achievements' },

  { path: 'contact', titleKey: 'nav.contact', descriptionKey: 'seo.contact' },
  { path: 'search', titleKey: 'nav.search', descriptionKey: 'seo.search' },
];

const BY_PATH = new Map(PAGES.map((page) => [page.path, page]));

export function findPage(path: string): PageDef | undefined {
  return BY_PATH.get(path);
}

/** Ancestors of a page from home down to (and including) the page itself. */
export function pageTrail(path: string): PageDef[] {
  const trail: PageDef[] = [];
  let current = findPage(path);
  while (current) {
    trail.unshift(current);
    if (current.path === '') break;
    current = findPage(current.parent ?? '');
  }
  return trail;
}

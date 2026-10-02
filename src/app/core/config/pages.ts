import { TranslationKey } from '../i18n/translation.service';

/**
 * Every static public page, keyed by its path relative to the language prefix.
 * This single list drives the router, SSR prerendering, page titles, breadcrumbs
 * and (later) the sitemap, so a page only needs to be declared once.
 */
export interface PageDef {
  path: string;
  titleKey: TranslationKey;
  /** Path of the parent page for breadcrumbs; omitted means "child of home". */
  parent?: string;
}

export const PAGES: readonly PageDef[] = [
  { path: '', titleKey: 'nav.home' },

  { path: 'about', titleKey: 'nav.aboutSchool' },
  { path: 'about/history', titleKey: 'nav.history', parent: 'about' },
  { path: 'about/mission-vision', titleKey: 'nav.missionVision', parent: 'about' },
  { path: 'about/messages', titleKey: 'nav.messages', parent: 'about' },
  { path: 'about/facilities', titleKey: 'nav.facilities', parent: 'about' },

  { path: 'academics', titleKey: 'nav.academicOverview' },
  { path: 'academics/programs', titleKey: 'nav.programs', parent: 'academics' },
  { path: 'academics/calendar', titleKey: 'nav.calendar', parent: 'academics' },
  { path: 'results', titleKey: 'nav.results', parent: 'academics' },
  { path: 'resources', titleKey: 'nav.resources', parent: 'academics' },

  { path: 'admission', titleKey: 'nav.admissionInfo' },
  { path: 'admission/apply', titleKey: 'nav.applyOnline', parent: 'admission' },
  { path: 'faq', titleKey: 'nav.faq' },

  { path: 'teachers', titleKey: 'nav.teachers' },
  { path: 'notices', titleKey: 'nav.notices' },
  { path: 'news', titleKey: 'nav.news' },
  { path: 'events', titleKey: 'nav.events' },
  { path: 'gallery', titleKey: 'nav.gallery' },
  { path: 'videos', titleKey: 'nav.videos' },
  { path: 'achievements', titleKey: 'nav.achievements' },

  { path: 'contact', titleKey: 'nav.contact' },
  { path: 'search', titleKey: 'nav.search' },
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

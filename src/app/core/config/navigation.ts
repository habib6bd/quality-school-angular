import { TranslationKey } from '../i18n/translation.service';

export interface NavItem {
  labelKey: TranslationKey;
  /** Path relative to the language prefix; `''` is the home page. */
  path: string;
  children?: readonly NavItem[];
}

export const MAIN_NAV: readonly NavItem[] = [
  { labelKey: 'nav.home', path: '' },
  {
    labelKey: 'nav.about',
    path: 'about',
    children: [
      { labelKey: 'nav.aboutSchool', path: 'about' },
      { labelKey: 'nav.history', path: 'about/history' },
      { labelKey: 'nav.missionVision', path: 'about/mission-vision' },
      { labelKey: 'nav.philosophy', path: 'about/philosophy' },
      { labelKey: 'nav.messages', path: 'about/messages' },
      { labelKey: 'nav.facilities', path: 'about/facilities' },
    ],
  },
  {
    labelKey: 'nav.academics',
    path: 'academics',
    children: [
      { labelKey: 'nav.academicOverview', path: 'academics' },
      { labelKey: 'nav.programs', path: 'academics/programs' },
      { labelKey: 'nav.calendar', path: 'academics/calendar' },
      { labelKey: 'nav.results', path: 'results' },
      { labelKey: 'nav.resources', path: 'resources' },
    ],
  },
  {
    labelKey: 'nav.admission',
    path: 'admission',
    children: [
      { labelKey: 'nav.admissionInfo', path: 'admission' },
      { labelKey: 'nav.applyOnline', path: 'admission/apply' },
      { labelKey: 'nav.faq', path: 'faq' },
    ],
  },
  { labelKey: 'nav.teachers', path: 'teachers' },
  { labelKey: 'nav.notices', path: 'notices' },
  {
    labelKey: 'nav.campusLife',
    path: 'gallery',
    children: [
      { labelKey: 'nav.news', path: 'news' },
      { labelKey: 'nav.events', path: 'events' },
      { labelKey: 'nav.gallery', path: 'gallery' },
      { labelKey: 'nav.videos', path: 'videos' },
      { labelKey: 'nav.achievements', path: 'achievements' },
    ],
  },
  { labelKey: 'nav.contact', path: 'contact' },
];

export const FOOTER_QUICK_LINKS: readonly NavItem[] = [
  { labelKey: 'nav.aboutSchool', path: 'about' },
  { labelKey: 'nav.admissionInfo', path: 'admission' },
  { labelKey: 'nav.teachers', path: 'teachers' },
  { labelKey: 'nav.notices', path: 'notices' },
  { labelKey: 'nav.results', path: 'results' },
  { labelKey: 'nav.gallery', path: 'gallery' },
  { labelKey: 'nav.faq', path: 'faq' },
  { labelKey: 'nav.contact', path: 'contact' },
];

/** Builds a router-link command array for a nav path in the given language. */
export function navCommands(lang: string, path: string): string[] {
  return path ? ['/', lang, ...path.split('/')] : ['/', lang];
}

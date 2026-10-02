import { Routes } from '@angular/router';
import { PAGES } from './core/config/pages';
import { DEFAULT_LANG, SUPPORTED_LANGS } from './core/i18n/lang';
import { Shell } from './layout/shell/shell';

type ComponentLoader = NonNullable<Routes[number]['loadComponent']>;

/** Pages with their own feature component; the rest show the placeholder page until built. */
const PAGE_COMPONENTS: Partial<Record<string, ComponentLoader>> = {
  '': () => import('./features/home/home').then((m) => m.Home),
  about: () => import('./features/about/about').then((m) => m.AboutPage),
  'about/history': () => import('./features/about/history').then((m) => m.HistoryPage),
  'about/mission-vision': () =>
    import('./features/about/mission-vision').then((m) => m.MissionVisionPage),
  'about/philosophy': () => import('./features/about/philosophy').then((m) => m.PhilosophyPage),
  'about/messages': () => import('./features/about/messages').then((m) => m.MessagesPage),
  'about/facilities': () => import('./features/about/facilities').then((m) => m.FacilitiesPage),
  teachers: () => import('./features/teachers/teachers').then((m) => m.TeachersPage),
  admission: () => import('./features/admission/admission').then((m) => m.AdmissionPage),
  'admission/apply': () => import('./features/admission/apply').then((m) => m.ApplyPage),
  academics: () => import('./features/academics/overview').then((m) => m.AcademicsPage),
  'academics/programs': () => import('./features/academics/programs').then((m) => m.ProgramsPage),
};

const placeholder: ComponentLoader = () =>
  import('./features/placeholder/placeholder-page').then((m) => m.PlaceholderPage);

const notFound: ComponentLoader = () =>
  import('./features/not-found/not-found').then((m) => m.NotFound);

/** Routes shared by every language tree. */
const pageRoutes: Routes = [
  ...PAGES.map((page) => ({
    path: page.path,
    pathMatch: 'full' as const,
    data: { page: page.path, titleKey: page.titleKey, descriptionKey: page.descriptionKey },
    loadComponent: PAGE_COMPONENTS[page.path] ?? placeholder,
  })),
  {
    path: 'academics/programs/:slug',
    data: { titleKey: 'nav.programs', descriptionKey: 'seo.programs' },
    loadComponent: () => import('./features/academics/class-detail').then((m) => m.ClassDetailPage),
  },
  {
    path: 'teachers/:slug',
    data: { titleKey: 'nav.teachers', descriptionKey: 'seo.teachers' },
    loadComponent: () =>
      import('./features/teachers/teacher-detail').then((m) => m.TeacherDetailPage),
  },
  { path: '**', data: { titleKey: 'notFound.title' }, loadComponent: notFound },
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_LANG },
  ...SUPPORTED_LANGS.map((lang) => ({
    path: lang,
    component: Shell,
    data: { lang },
    children: pageRoutes,
  })),
  {
    path: '**',
    component: Shell,
    data: { lang: DEFAULT_LANG },
    children: [{ path: '**', data: { titleKey: 'notFound.title' }, loadComponent: notFound }],
  },
];

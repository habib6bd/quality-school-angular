import { Routes } from '@angular/router';
import { PAGES } from './core/config/pages';
import { DEFAULT_LANG, SUPPORTED_LANGS } from './core/i18n/lang';
import { Shell } from './layout/shell/shell';

type ComponentLoader = NonNullable<Routes[number]['loadComponent']>;

/** Pages with their own feature component; the rest show the placeholder page until built. */
const PAGE_COMPONENTS: Partial<Record<string, ComponentLoader>> = {
  '': () => import('./features/home/home').then((m) => m.Home),
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
    data: { page: page.path, titleKey: page.titleKey },
    loadComponent: PAGE_COMPONENTS[page.path] ?? placeholder,
  })),
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

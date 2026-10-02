import { Routes } from '@angular/router';
import { DEFAULT_LANG, SUPPORTED_LANGS } from './core/i18n/lang';
import { Shell } from './layout/shell/shell';

/** Pages shared by every language tree. */
const pageRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
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
    children: [
      {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];

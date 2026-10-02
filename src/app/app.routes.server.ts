import { RenderMode, ServerRoute } from '@angular/ssr';
import { PAGES } from './core/config/pages';
import { SUPPORTED_LANGS } from './core/i18n/lang';

/** Every registered page is prerendered in both languages at build time. */
const prerenderedPages: ServerRoute[] = SUPPORTED_LANGS.flatMap((lang) =>
  PAGES.map((page) => ({
    path: page.path ? `${lang}/${page.path}` : lang,
    renderMode: RenderMode.Prerender,
  })),
);

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  ...prerenderedPages,
  // Any URL not matched above renders the not-found page with a real 404 status.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];

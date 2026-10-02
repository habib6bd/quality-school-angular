import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { PAGES } from './core/config/pages';
import { SUPPORTED_LANGS } from './core/i18n/lang';
import { SchoolClassService } from './core/services/school-class.service';

/** Every registered page is prerendered in both languages at build time. */
const prerenderedPages: ServerRoute[] = SUPPORTED_LANGS.flatMap((lang) =>
  PAGES.map((page) => ({
    path: page.path ? `${lang}/${page.path}` : lang,
    renderMode: RenderMode.Prerender,
  })),
);

/** Class information pages: one per class, in both languages. */
const classPages: ServerRoute[] = SUPPORTED_LANGS.map((lang) => ({
  path: `${lang}/academics/programs/:slug`,
  renderMode: RenderMode.Prerender,
  // Unknown slugs are rendered on demand and answered with a 404 by the page itself.
  fallback: PrerenderFallback.Server,
  getPrerenderParams: async () => {
    const classes = await firstValueFrom(inject(SchoolClassService).list());
    return classes.map((item) => ({ slug: item.slug }));
  },
}));

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  ...prerenderedPages,
  ...classPages,
  // Any URL not matched above renders the not-found page with a real 404 status.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];

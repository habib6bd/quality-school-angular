import { inject } from '@angular/core';
import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { firstValueFrom } from 'rxjs';
import { PageDef, PAGES } from './core/config/pages';
import { SUPPORTED_LANGS } from './core/i18n/lang';
import { SchoolClassService } from './core/services/school-class.service';
import { EventService } from './core/services/event.service';
import { NewsService } from './core/services/news.service';
import { NoticeService } from './core/services/notice.service';
import { TeacherService } from './core/services/teacher.service';

/**
 * Every registered page is prerendered in both languages at build time, except pages driven by
 * query parameters, which are rendered per request so filters and pages are honoured on the server.
 */
function pageRoute(lang: string, page: PageDef): ServerRoute {
  const path = page.path ? `${lang}/${page.path}` : lang;
  return page.queryDriven
    ? { path, renderMode: RenderMode.Server }
    : { path, renderMode: RenderMode.Prerender };
}

const registeredPages: ServerRoute[] = SUPPORTED_LANGS.flatMap((lang) =>
  PAGES.map((page) => pageRoute(lang, page)),
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

/** Staff profile pages: one per person, in both languages. */
const teacherPages: ServerRoute[] = SUPPORTED_LANGS.map((lang) => ({
  path: `${lang}/teachers/:slug`,
  renderMode: RenderMode.Prerender,
  fallback: PrerenderFallback.Server,
  getPrerenderParams: async () => {
    const teachers = await firstValueFrom(inject(TeacherService).list());
    return teachers.map((teacher) => ({ slug: teacher.slug }));
  },
}));

/** Detail pages of the content lists. Slugs are discovered through the services, so new items are prerendered automatically. */
const contentPages: ServerRoute[] = SUPPORTED_LANGS.flatMap((lang) => [
  {
    path: `${lang}/notices/:slug`,
    renderMode: RenderMode.Prerender as const,
    fallback: PrerenderFallback.Server,
    getPrerenderParams: async () =>
      (await firstValueFrom(inject(NoticeService).list())).map((item) => ({ slug: item.slug })),
  },
  {
    path: `${lang}/news/:slug`,
    renderMode: RenderMode.Prerender as const,
    fallback: PrerenderFallback.Server,
    getPrerenderParams: async () =>
      (await firstValueFrom(inject(NewsService).list())).map((item) => ({ slug: item.slug })),
  },
  {
    path: `${lang}/events/:slug`,
    renderMode: RenderMode.Prerender as const,
    fallback: PrerenderFallback.Server,
    getPrerenderParams: async () =>
      (await firstValueFrom(inject(EventService).list())).map((item) => ({ slug: item.slug })),
  },
]);

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  ...registeredPages,
  ...classPages,
  ...teacherPages,
  ...contentPages,
  // Any URL not matched above renders the not-found page with a real 404 status.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];

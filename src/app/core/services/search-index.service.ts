import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, shareReplay } from 'rxjs';
import { PAGES } from '../config/pages';
import { Lang, SUPPORTED_LANGS } from '../i18n/lang';
import { Localized } from '../i18n/localized';
import { TranslationKey, TranslationService } from '../i18n/translation.service';
import { SearchEntry } from '../search/search';
import { EventService } from './event.service';
import { NewsService } from './news.service';
import { NoticeService } from './notice.service';
import { ResourceService } from './resource.service';
import { SchoolClassService } from './school-class.service';
import { TeacherService } from './teacher.service';

/**
 * The site-wide search index, built once in the browser (or on the server) from the same
 * services the pages use, so search can never show something the site does not.
 */
@Injectable({ providedIn: 'root' })
export class SearchIndexService {
  private readonly i18n = inject(TranslationService);
  private readonly classes = inject(SchoolClassService);
  private readonly teachers = inject(TeacherService);
  private readonly notices = inject(NoticeService);
  private readonly news = inject(NewsService);
  private readonly events = inject(EventService);
  private readonly resources = inject(ResourceService);

  private readonly index$ = forkJoin({
    classes: this.classes.list(),
    teachers: this.teachers.list(),
    notices: this.notices.list(),
    news: this.news.list(),
    events: this.events.list(),
    resources: this.resources.list(),
  }).pipe(
    map(({ classes, teachers, notices, news, events, resources }): readonly SearchEntry[] => [
      ...this.pageEntries(),
      ...classes.map((item): SearchEntry => ({
        id: `class:${item.slug}`,
        kind: 'page',
        title: item.name,
        text: this.both('nav.programs'),
        path: `academics/programs/${item.slug}`,
      })),
      ...teachers.map((t): SearchEntry => ({
        id: `teacher:${t.slug}`,
        kind: 'teacher',
        // Names are published in English only; both languages search and show the same name.
        title: { bn: t.name, en: t.name },
        text: this.both(`teachers.designation.${t.designation}` as TranslationKey),
        path: `teachers/${t.slug}`,
      })),
      ...notices.map((n): SearchEntry => ({
        id: `notice:${n.slug}`,
        kind: 'notice',
        title: n.title,
        text: n.summary,
        path: `notices/${n.slug}`,
      })),
      ...news.map((n): SearchEntry => ({
        id: `news:${n.slug}`,
        kind: 'news',
        title: n.title,
        text: n.summary,
        path: `news/${n.slug}`,
      })),
      ...events.map((e): SearchEntry => ({
        id: `event:${e.slug}`,
        kind: 'event',
        title: e.title,
        text: e.summary,
        path: `events/${e.slug}`,
      })),
      ...resources.map((r): SearchEntry => ({
        id: `resource:${r.id}`,
        kind: 'resource',
        title: r.title,
        text: r.description ?? this.both('nav.resources'),
        path: 'resources',
      })),
    ]),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  entries(): Observable<readonly SearchEntry[]> {
    return this.index$;
  }

  /** Static pages, searchable by title and description in both languages (home and search excluded). */
  private pageEntries(): SearchEntry[] {
    return PAGES.filter((page) => page.path !== '' && page.path !== 'search').map((page) => ({
      id: `page:${page.path}`,
      kind: 'page' as const,
      title: this.both(page.titleKey),
      text: this.both(page.descriptionKey),
      path: page.path,
    }));
  }

  private both(key: TranslationKey): Localized {
    const text = (lang: Lang) => this.i18n.translate(lang, key);
    return { bn: text(SUPPORTED_LANGS[0]), en: text(SUPPORTED_LANGS[1]) };
  }
}

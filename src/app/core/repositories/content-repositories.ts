import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { EnvironmentProviders, inject, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CLASSES } from '../data/classes.data';
import { EVENTS } from '../data/events.data';
import { FACILITIES } from '../data/facilities.data';
import { FAQS } from '../data/faqs.data';
import { GALLERY } from '../data/gallery.data';
import { LEADER_MESSAGES } from '../data/leadership.data';
import { NEWS } from '../data/news.data';
import { NOTICES } from '../data/notices.data';
import { TEACHERS } from '../data/teachers.data';
import { VIDEOS } from '../data/videos.data';
import {
  ACHIEVEMENTS_DATA,
  CALENDAR_DATA,
  RESOURCES_DATA,
  TESTIMONIALS_DATA,
} from '../data/unpublished.data';
import { Achievement } from '../models/achievement.model';
import { CalendarEvent } from '../models/calendar.model';
import { SchoolEvent } from '../models/event.model';
import { Facility } from '../models/facility.model';
import { FaqItem } from '../models/faq.model';
import { GalleryItem } from '../models/gallery.model';
import { LeaderMessage } from '../models/leader-message.model';
import { NewsArticle } from '../models/news.model';
import { Notice } from '../models/notice.model';
import { ResourceItem } from '../models/resource.model';
import { SchoolClass } from '../models/school-class.model';
import { Teacher } from '../models/teacher.model';
import { Testimonial } from '../models/testimonial.model';
import { SchoolVideo } from '../models/video.model';
import { ContentSource, createContentSource, HttpContentRepository } from './content-repository';

/** One source per content collection; the `path` is the proposed API route (see docs/CONTENT-INTEGRATION.md). */
export const ACHIEVEMENT_LIST = createContentSource<Achievement>(
  'ACHIEVEMENTS_REPOSITORY',
  'achievements',
  ACHIEVEMENTS_DATA,
);
export const CALENDAR_LIST = createContentSource<CalendarEvent>(
  'CALENDAR_REPOSITORY',
  'calendar',
  CALENDAR_DATA,
);
export const CLASS_LIST = createContentSource<SchoolClass>(
  'CLASSES_REPOSITORY',
  'classes',
  CLASSES,
);
export const EVENT_LIST = createContentSource<SchoolEvent>('EVENTS_REPOSITORY', 'events', EVENTS);
export const FACILITY_LIST = createContentSource<Facility>(
  'FACILITIES_REPOSITORY',
  'facilities',
  FACILITIES,
);
export const FAQ_LIST = createContentSource<FaqItem>('FAQS_REPOSITORY', 'faqs', FAQS);
export const GALLERY_LIST = createContentSource<GalleryItem>(
  'GALLERY_REPOSITORY',
  'gallery',
  GALLERY,
);
export const LEADER_MESSAGE_LIST = createContentSource<LeaderMessage>(
  'LEADER_MESSAGES_REPOSITORY',
  'leader-messages',
  LEADER_MESSAGES,
);
export const NEWS_LIST = createContentSource<NewsArticle>('NEWS_REPOSITORY', 'news', NEWS);
export const NOTICE_LIST = createContentSource<Notice>('NOTICES_REPOSITORY', 'notices', NOTICES);
export const RESOURCE_LIST = createContentSource<ResourceItem>(
  'RESOURCES_REPOSITORY',
  'resources',
  RESOURCES_DATA,
);
export const TEACHER_LIST = createContentSource<Teacher>(
  'TEACHERS_REPOSITORY',
  'teachers',
  TEACHERS,
);
export const TESTIMONIAL_LIST = createContentSource<Testimonial>(
  'TESTIMONIALS_REPOSITORY',
  'testimonials',
  TESTIMONIALS_DATA,
);
export const VIDEO_LIST = createContentSource<SchoolVideo>('VIDEOS_REPOSITORY', 'videos', VIDEOS);

const ALL_SOURCES: readonly ContentSource<unknown>[] = [
  ACHIEVEMENT_LIST,
  CALENDAR_LIST,
  CLASS_LIST,
  EVENT_LIST,
  FACILITY_LIST,
  FAQ_LIST,
  GALLERY_LIST,
  LEADER_MESSAGE_LIST,
  NEWS_LIST,
  NOTICE_LIST,
  RESOURCE_LIST,
  TEACHER_LIST,
  TESTIMONIAL_LIST,
  VIDEO_LIST,
];

/**
 * NOT used by the app yet. Add it to `app.config.ts` providers (and set `environment.apiBaseUrl`)
 * to read every collection from the content API instead of the bundled data.
 */
export function provideHttpContentRepositories(
  baseUrl = environment.apiBaseUrl,
): (Provider | EnvironmentProviders)[] {
  if (!baseUrl) {
    throw new Error('provideHttpContentRepositories needs environment.apiBaseUrl to be set.');
  }
  return [
    provideHttpClient(withFetch()),
    ...ALL_SOURCES.map((source): Provider => ({
      provide: source.token,
      useFactory: () => new HttpContentRepository(inject(HttpClient), baseUrl, source.path),
    })),
  ];
}

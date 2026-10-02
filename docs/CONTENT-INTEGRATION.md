# Content integration guide

What the school must supply, and how the website connects to a CMS or API later.

The site currently serves **bundled local data** (`src/app/core/data`). Nothing is sent to or loaded from a server. Anything the school has not published is shown as a clearly marked placeholder or an honest empty state. Nothing has been invented.

## 1. What the school must supply

| Area                                                           | Today                                                                       | Needed from the school                                                                           | Where it goes                                                          |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Address, phones, EIIN, School Code                             | Transcribed by eye from the admission banner                                | **Confirm** each value                                                                           | `core/data/school-info.data.ts`                                        |
| Email address(es), office hours                                | Empty (not published anywhere)                                              | Official email(s) and office hours (Bangla and English)                                          | `school-info.data.ts` (`emails`, `officeHours`)                        |
| Production domain                                              | `https://www.bqesbd.com` assumed                                            | Confirm the final domain (canonical URLs, sitemap, Open Graph)                                   | `environments/environment*.ts`, `public/robots.txt`, `npm run sitemap` |
| Mission and vision, history, educational philosophy            | Placeholder notes                                                           | Approved text in Bangla and English                                                              | `features/about/*`                                                     |
| Admission: eligibility, steps, required documents, dates, fees | Placeholder notes (no age limits, fees or document names were written)      | Approved admission policy and calendar                                                           | `features/admission/admission.ts`                                      |
| Teacher and staff photos and profiles                          | Initial-letter avatars; names and designations only (English)               | Approved photos, Bangla names, consent to publish                                                | `core/data/teachers.data.ts`                                           |
| Class details (subjects, syllabus per class)                   | Class list only                                                             | Per-class information                                                                            | `core/data/classes.data.ts`                                            |
| Notices                                                        | One real notice (admission 2026)                                            | Ongoing notices, with dates and attachments                                                      | `core/data/notices.data.ts`                                            |
| News and events                                                | Empty lists                                                                 | Real articles and events                                                                         | `news.data.ts`, `events.data.ts`                                       |
| Academic calendar                                              | Empty                                                                       | Term dates, holidays, exam dates                                                                 | `unpublished.data.ts` (`CALENDAR_DATA`)                                |
| Routines, syllabus, study material, forms, policies            | Empty (placeholder page)                                                    | Files (PDF) with title, class, subject, year, type                                               | `unpublished.data.ts` (`RESOURCES_DATA`)                               |
| Results                                                        | Lookup form is a prototype; no data                                         | A result source and a privacy-safe lookup design (the form must not expose other students' data) | `core/services/result.service.ts`                                      |
| Achievements                                                   | Empty (academic, sports, cultural categories)                               | Verified achievements with dates                                                                 | `unpublished.data.ts` (`ACHIEVEMENTS_DATA`)                            |
| Guardian testimonials                                          | Empty                                                                       | Written, approved reviews with consent                                                           | `unpublished.data.ts` (`TESTIMONIALS_DATA`)                            |
| Gallery and videos                                             | Real sports-day photos; one real YouTube video; demo photos marked `isDemo` | More approved photos/videos; **replace the demo photos** (public-domain stock, not BQES)         | `gallery.data.ts`, `videos.data.ts`                                    |
| FAQ                                                            | Generic and site-usage answers only                                         | School-specific answers                                                                          | `core/data/faqs.data.ts`                                               |
| Facilities                                                     | Only facilities stated in the headmaster's message and admission banner     | Confirm and extend                                                                               | `core/data/facilities.data.ts`                                         |
| Share image                                                    | Logo used for Open Graph                                                    | A 1200x630 preview image                                                                         | `core/seo/seo.service.ts`                                              |
| Photos of people                                               | Only the leaders' photos and sports-day photos already on the school site   | Written approval before publishing any student photo or name                                     |                                                                        |

The admission and contact **forms are frontend prototypes**: they validate input but send nothing and log nothing. Connecting them needs a backend, spam protection and a privacy notice, none of which exist yet.

## 2. How content is loaded

```
component -> *Service (ordering, filtering, lookup) -> ContentRepository<T> (InjectionToken) -> data source
```

- `core/repositories/content-repository.ts` defines `ContentRepository<T>` (`list(): Observable<readonly T[]>`), `LocalContentRepository` (bundled data) and `HttpContentRepository` (a `GET {apiBaseUrl}/{path}` stub).
- `core/repositories/content-repositories.ts` creates one token per collection (default: the local repository) and exports `provideHttpContentRepositories()`.
- Services keep the domain rules (sorting, upcoming/past, designation order, filters). Components never see the data source.
- Pages use `rxResource` plus `<app-async-state>` for the shared loading, error (with retry) and empty states.

### Proposed API (one JSON array per collection)

| Token                 | Path                   | Item model      |
| --------------------- | ---------------------- | --------------- |
| `NOTICE_LIST`         | `GET /notices`         | `Notice`        |
| `NEWS_LIST`           | `GET /news`            | `NewsArticle`   |
| `EVENT_LIST`          | `GET /events`          | `SchoolEvent`   |
| `TEACHER_LIST`        | `GET /teachers`        | `Teacher`       |
| `CLASS_LIST`          | `GET /classes`         | `SchoolClass`   |
| `FACILITY_LIST`       | `GET /facilities`      | `Facility`      |
| `LEADER_MESSAGE_LIST` | `GET /leader-messages` | `LeaderMessage` |
| `GALLERY_LIST`        | `GET /gallery`         | `GalleryItem`   |
| `VIDEO_LIST`          | `GET /videos`          | `SchoolVideo`   |
| `ACHIEVEMENT_LIST`    | `GET /achievements`    | `Achievement`   |
| `TESTIMONIAL_LIST`    | `GET /testimonials`    | `Testimonial`   |
| `FAQ_LIST`            | `GET /faqs`            | `FaqItem`       |
| `RESOURCE_LIST`       | `GET /resources`       | `ResourceItem`  |
| `CALENDAR_LIST`       | `GET /calendar`        | `CalendarEvent` |

Models are in `core/models`. Localised fields use `{ bn, en? }`.

### Turning the API on

1. Set `apiBaseUrl` in the production environment file.
2. Add `provideHttpContentRepositories()` to `app.config.ts` providers.
3. Replace the pass-through in `HttpContentRepository.list()` with validation or mapping for the real response shape.
4. Prerendered pages and the sitemap use the bundled data at build time. Detail pages for CMS items (`/notices/:slug` etc.) need their `getPrerenderParams` in `app.routes.server.ts` and `scripts/generate-sitemap.mjs` pointed at the API, or switched to server rendering.
5. Decide what happens with the SSR transfer cache and caching headers for API responses.

### Not covered yet

- Results lookup, admission submission and contact submission (`ResultService`, `ContactService`) are single-purpose and unwired. They need real endpoints, authentication where relevant, and validation on the server.
- No authentication, payment or admin panel exists, by design.
- `SchoolInfoService` (address, phones) is deliberately synchronous because the shell needs it on every page.

## 3. Adding or changing content today

Edit the file in `core/data`, run `npm run sitemap` (it regenerates `public/sitemap.xml`), then the usual checks. Keep every `isDemo` flag on stand-in photos.

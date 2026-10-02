# BQES — Progress report

Phase reports are appended below in order. (A final summary is added at the top when Phase 16 is done.)

---

### Phase 4: Main layout & homepage

**Implemented**

- Homepage with all 17 planned sections in order: hero (real school photo + admission CTA) → quick access → About → Why choose (verified features only) → Chairman/Headmaster messages (real text + photos) → Classes → Teachers preview → Campus & facilities → Latest notices (real admission notice) → Upcoming events (empty state) → Achievements (marked placeholders) → Photo gallery (real, with lightbox) → Video gallery (real YouTube video, nocookie modal) → Guardian reviews (honest empty state) → Admission CTA → FAQ preview → Contact + map. Announcement bar, header and footer come from the shell.
- Banner-transcribed address, phones, EIIN and School Code moved into `core/data/school-info.data.ts` with a source comment; the footer now shows EIIN/School Code and Bangla digits.
- Data/service layer: models (`core/models`), data (`core/data`) and `Observable`-based services for classes, facilities, leadership, teachers, notices, news, events, gallery, videos, achievements, testimonials and FAQs. Unpublished content is empty, never invented.
- Shared: `AsyncState` (loading/error/empty), `ContentSection`, `Avatar`, `TeacherCard`, `NoticeCard`, `GalleryGrid`, `VideoCard`/`VideoModal`, `MapEmbed` (allow-listed Google Maps hosts only), `pagePath`, `localeDigits`, `localizedLang` pipes.
- Playwright infrastructure: `e2e/fixtures.ts` (stubs font CDN), `e2e/support.ts` (error collector, overflow and broken-image helpers), `PW_EXECUTABLE` support.

**Files** — new: `src/app/features/home/sections/*` (17), `src/app/shared/components/{async-state,avatar,content-section,gallery-grid,map-embed,notice-card,teacher-card,video}/*`, `src/app/core/{models,data,services}/*` (content), `docs/DECISIONS.md`, `e2e/{home.spec,fixtures,support}.ts`. Modified: `home.ts`, footer, translations, pipes, `format.ts`, `localized.ts`, `playwright.config.ts`, `tsconfig.spec.json` (adds `node` types for the data-file spec), `e2e/smoke.spec.ts` (hero heading is white now; asserts theme tokens).

**Dependencies:** none added.

**Commands:** `npm ci`; `npm run typecheck`; `npm run lint`; `npx ng test --watch=false`; `npx ng build`; `PORT=4310 ./scripts/ssr-smoke.sh /bn /en /bn/about /en/nope`; `PW_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test`.

**Verification**

| Check            | Result                                                       |
| ---------------- | ------------------------------------------------------------ |
| Type checking    | PASS                                                         |
| Lint             | PASS (all files)                                             |
| Unit tests       | PASS — 26 files, 113 tests                                   |
| Production build | PASS — 46 static routes prerendered                          |
| SSR smoke        | PASS — `/bn` 200, `/en` 200, `/bn/about` 200, `/en/nope` 404 |
| Browser tests    | PASS — 53 tests (Chromium 141 via `PW_EXECUTABLE`)           |

**Issues (honest):** YouTube thumbnails, the YouTube embed and Google Maps cannot be reached from this sandbox, so they were verified only against stubs (the real thumbnail/embed/map rendering is unverified; a failing thumbnail falls back to a plain tile). Real fonts (Hind Siliguri/Inter) did not load in tests (stubbed), so visual checks used fallback fonts. Notice, teacher and gallery links point at list pages until detail routes are built in Phases 6, 8 and 9.

**Acceptance criteria:** PASS — renders in bn and en; every internal link returns 200; no horizontal overflow at 320–1440 px (both languages); no broken images; loading, error and empty states handled; build passes.

---

### Phase 5: About & academic pages

**Implemented**

- About (`/about`: story, at-a-glance facts, EIIN/School Code, related pages), History (only the stated 2010 founding; fuller history marked pending), Mission & Vision (marked placeholders + a quoted line from the Chairman), Educational philosophy (placeholder + themes quoted from the leaders, each sourced), Messages (full Chairman and Headmaster messages with photos; English translation explained), Facilities (the 7 verified facilities), Academic overview, Programs/classes (all 13 classes) and a Class information page per class (`/academics/programs/:slug`, prev/next, groups, pending note).
- Shared building blocks: `PageScaffold` (header + breadcrumbs + content frame, detail title support), `RelatedLinks`, `PendingNote`, `ResponseStatusService` (real 404 for unknown detail slugs).
- SEO: `SeoService` sets title, description, Open Graph and Twitter tags for every route (via the title strategy) and for detail pages; every page in the registry has a bilingual description.
- Routing: nine new page components registered in `PAGE_COMPONENTS`; class detail route added to the router and to server routes (prerendered per class and language, 404 fallback).

**Files** — new: `src/app/features/about/*`, `src/app/features/academics/*`, `src/app/core/seo/*`, `src/app/core/services/response-status.service.ts`, `src/app/shared/components/{page-scaffold,related-links,pending-note}/*`, specs, `e2e/about-academics.spec.ts`. Modified: `pages.ts` (descriptions + philosophy page), `navigation.ts`, `app.routes.ts`, `app.routes.server.ts`, `translated-title.strategy.ts`, `school-class.service.ts`, translations.

**Dependencies:** none added.

**Commands:** `npm run typecheck`; `npm run lint`; `npx ng test --watch=false`; `npx ng build`; `PORT=4310 ./scripts/ssr-smoke.sh /bn/about /en/about/history /bn/about/philosophy /en/academics/programs/nine /en/academics/programs/nope /bn/academics/programs/nope`; `PW_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test`.

**Verification**

| Check            | Result                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type checking    | PASS                                                                                                                                                                     |
| Lint             | PASS                                                                                                                                                                     |
| Unit tests       | PASS — 31 files, 149 tests                                                                                                                                               |
| Production build | PASS — 74 static routes prerendered                                                                                                                                      |
| SSR smoke        | PASS — /bn/about 200; /en/about/history 200; /bn/about/philosophy 200; /en/academics/programs/nine 200; /en/academics/programs/nope 404; /bn/academics/programs/nope 404 |
| Browser tests    | PASS — 83 Playwright tests (Chromium 141 via `PW_EXECUTABLE`)                                                                                                            |

**Issues (honest):** Mission, vision and a formal educational philosophy are not published, so those pages are intentionally placeholders. The English translations of the leaders' messages were written for this site and need the school's review. Canonical/hreflang/JSON-LD are not set yet (Phase 13). The nine pages × 2 languages were checked in Chromium 141 only; real fonts were stubbed in tests.

**Acceptance criteria:** PASS — all routes work in both languages (`/bn|en` × 9 pages incl. class pages); consistent `PageScaffold` layout; title and description set per page; unit and e2e tests pass; unknown class returns a real 404.

---

### Phase 6: Teachers & faculty directory

**Implemented**

- Typed `Teacher` model and `TeacherService` (list, preview, bySlug) fed from the published staff data: name, designation and display serial only (no photos, no private fields). Principal first, then teachers, then staff.
- Directory page (`/teachers`): cards with initial-letter avatars, designation filter chips with live counts, name search, `Showing N of M` live region, empty state with a clear-filters link, English names on Bangla pages with `lang="en"`. Filters are URL query parameters, so they are server-rendered, shareable and kept by the language switcher.
- Person page (`/teachers/:slug`): avatar, name, designation, pending note for photo/profile, link to the general contact page; real 404 for unknown slugs; prerendered per person and language; SEO title/description per person.
- Homepage staff preview cards now link to the person pages.
- Infrastructure: `queryDriven` page flag (server-rendered instead of prerendered), hydration-ready marker for tests.

**Files** — new: `src/app/features/teachers/*` (+ specs), `e2e/teachers.spec.ts`. Modified: `pages.ts`, `app.routes.ts`, `app.routes.server.ts`, `app.ts` (+ spec), home teachers preview, translations, `e2e/fixtures.ts`.

**Dependencies:** none added.

**Commands:** `npm run typecheck`; `npm run lint`; `npx ng test --watch=false`; `npx ng build`; `PORT=4310 ./scripts/ssr-smoke.sh /bn/teachers /en/teachers?designation=staff /en/teachers/md-abdullah-al-mizan /bn/teachers/nobody`; `PW_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test`.

**Verification**

| Check            | Result                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Type checking    | PASS                                                                                                                        |
| Lint             | PASS                                                                                                                        |
| Unit tests       | PASS — 32 files, 164 tests                                                                                                  |
| Production build | PASS — 128 static routes prerendered                                                                                        |
| SSR smoke        | PASS — /bn/teachers 200; /en/teachers?designation=staff 200; /en/teachers/md-abdullah-al-mizan 200; /bn/teachers/nobody 404 |
| Browser tests    | PASS — 100 Playwright tests (Chromium 141 via `PW_EXECUTABLE`)                                                              |

**Issues (honest):** Staff photos, subjects and qualifications are not published (the old site's photos need a vendor login), so profiles are intentionally minimal. The published teacher count (27) differs from the 24 principal+teacher entries in the list; both are shown as published. Hydration race: text typed into a server-rendered input before hydration is lost (mitigated in tests only; a production fix would need a pre-hydration input replay).

**Acceptance criteria:** PASS — cards display; filters work (chips, search, combined); empty results handled; detail routes work (28 profile pages + 404 for unknown); mobile layout verified at 320–1440 px; tests pass.

---

### Phase 7: Admission (info + form prototype)

**Implemented**

- Admission overview (`/admission`): the real 2026 admission notice with its image (lightbox), classes open for admission (links to class pages), eligibility / application steps / required documents as marked placeholders, admission calendar table with placeholder dates, admission FAQs, direct contact block (banner phone numbers and address) and CTAs.
- Application wizard prototype (`/admission/apply`): Reactive Forms, 5 steps + confirmation (student → guardian → class & medium → documents → review → done), clearly labelled as a prototype, step progress, focus management, per-field errors and an error summary, review with edit buttons, back/next, start over.
- Validation: required fields, name length, real non-future birth date, Bangladeshi mobile numbers (ASCII or Bangla digits), optional e-mail, study group required only for Nine/Ten, acknowledgement checkbox.
- Accessibility: `aria-describedby`, `aria-invalid`, `aria-required`, `aria-live` regions, alert summary that receives focus and links to fields, focus moved to the step heading on navigation.
- Privacy: no network, storage, cookies or logging of what is typed; no payment; verified by tests.
- Shared `shared/forms`: validators, `FormField`, `FieldControl`, `ErrorSummary`.

**Files** — new: `src/app/features/admission/*` (+ specs), `src/app/shared/forms/*` (+ spec), `e2e/admission.spec.ts`. Modified: `app.routes.ts`, `faq.service.ts` (category filter), translations (`admission`, `forms`, `apply`).

**Dependencies:** none added.

**Commands:** `npm run typecheck`; `npm run lint`; `npx ng test --watch=false`; `npx ng build`; `PORT=4310 ./scripts/ssr-smoke.sh /bn/admission /en/admission/apply /bn/admission/apply`; `PW_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test`.

**Verification**

| Check            | Result                                                                     |
| ---------------- | -------------------------------------------------------------------------- |
| Type checking    | PASS                                                                       |
| Lint             | PASS                                                                       |
| Unit tests       | PASS — 35 files, 207 tests                                                 |
| Production build | PASS — 128 static routes prerendered                                       |
| SSR smoke        | PASS — /bn/admission 200; /en/admission/apply 200; /bn/admission/apply 200 |
| Browser tests    | PASS — 117 Playwright tests (Chromium 141 via `PW_EXECUTABLE`)             |

**Issues (honest):** Eligibility, steps, documents, dates and fees are not published, so those sections are placeholders by design. The form cannot submit anything (prototype). A text-input value typed before hydration completes can be lost on slow devices (same race as Phase 6; tests wait for the hydration marker).

**Acceptance criteria:** PASS — validation works (required, format, date, conditional group); required fields enforced; errors accessible (aria + summary + live region); submission states correct (blocked step, review, prototype confirmation, start over); no data sent, stored or logged; tests pass.

---

### Phase 8: Notices, news & events

**Implemented**

- Models and services for notices, news and events (list, bySlug, upcoming/past for events); notice attachments are a typed union (image / pdf).
- Notice board (`/notices`): the real admission notice, category chips with counts (all five categories), URL-driven filter and pagination (`?category`, `?page`, clamped), empty-category state, live result count.
- Notice page (`/notices/:slug`): category badge, date, summary, attachment with image preview + lightbox, open-in-new-tab and download links through a safe-URL allow-list, graceful skip of unsafe attachments, back link, SEO title/description.
- News and events lists with pagination and honest empty states (no items are published); events have an upcoming/past switch; detail routes for both (tested with stub data), real 404 for unknown slugs.
- New shared cards `NewsCard` and `EventCard`; `paginate()` utility; `safeAttachmentPath()`; homepage and admission notice links now go to the notice page.

**Files** — new: `src/app/features/{notices,news,events}/*`, `src/app/shared/components/{news-card,event-card}/*`, `src/app/core/util/paginate.ts`, `src/app/shared/util/safe-url.ts`, specs, `e2e/notices-news-events.spec.ts`. Modified: `notice.model.ts`, `event.service.ts`, `app.routes.ts`, `app.routes.server.ts`, `pages.ts` (`queryDriven`), homepage notices section, admission page, translations.

**Dependencies:** none added.

**Commands:** `npm run typecheck`; `npm run lint`; `npx ng test --watch=false`; `npx ng build`; `PORT=4310 ./scripts/ssr-smoke.sh /bn/notices /en/notices?category=exam /en/notices/admission-2026 /en/notices/nope /en/news /bn/events?view=past /bn/news/nope`; `PW_EXECUTABLE=/opt/pw-browsers/chromium npx playwright test`.

**Verification**

| Check            | Result                                                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type checking    | PASS                                                                                                                                                                   |
| Lint             | PASS                                                                                                                                                                   |
| Unit tests       | PASS — 37 files, 245 tests                                                                                                                                             |
| Production build | PASS — 124 static routes prerendered                                                                                                                                   |
| SSR smoke        | PASS — /bn/notices 200; /en/notices?category=exam 200; /en/notices/admission-2026 200; /en/notices/nope 404; /en/news 200; /bn/events?view=past 200; /bn/news/nope 404 |
| Browser tests    | PASS — 135 Playwright tests (Chromium 141 via `PW_EXECUTABLE`)                                                                                                         |

**Issues (honest):** Only one notice exists, so multi-page notice listings and the category filter on real multi-category data were verified with stub data in unit tests, not in the browser. The notice's own expiry date (2026-02-28) is stored but not used to hide it (see DECISIONS). News and events pages are empty until the school publishes items.

**Acceptance criteria:** PASS — listings, filters, pagination and detail routes work in both languages; attachments are linked safely; unknown items return 404; unit, browser and build checks pass.

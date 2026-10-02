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

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

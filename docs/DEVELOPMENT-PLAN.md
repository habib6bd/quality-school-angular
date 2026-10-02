# BQES Website — Development Plan & Progress

Bilingual (Bangla default, English) public website for **Banasree Quality Education School (BQES)**, built with Angular 22 + SSR + Tailwind CSS v4.

Work proceeds **one phase at a time**. A phase is finished only when its acceptance criteria pass with real command output. After each phase, stop and post the phase report (format at the bottom) so the owner can review and commit.

## Status

| #   | Phase                                  | Status     |
| --- | -------------------------------------- | ---------- |
| 1   | Project foundation                     | ✅ Done    |
| 2   | Design system & shared components      | ✅ Done    |
| 3   | Bilingual architecture                 | ✅ Done    |
| 4   | Main layout & homepage                 | ✅ Done    |
| 5   | About & academic pages                 | ✅ Done    |
| 6   | Teachers & faculty directory           | ✅ Done    |
| 7   | Admission (info + form prototype)      | ✅ Done    |
| 8   | Notices, news & events                 | ✅ Done    |
| 9   | Gallery, videos & achievements         | ✅ Done    |
| 10  | Results, resources & academic calendar | ✅ Done    |
| 11  | Guardian reviews, FAQ & contact        | ✅ Done    |
| 12  | Site search & navigation polish        | ✅ Done    |
| 13  | SEO & SSR                              | ✅ Done    |
| 14  | Accessibility & performance            | ✅ Done    |
| 15  | CMS / API integration readiness        | ✅ Done    |
| 16  | Final QA                               | ⏭ **Next** |

Update this table when a phase is completed.

---

## Source material (already in the repo)

| What                                                                                                                                                                      | Where                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Verified public data from the existing site (school name, stats, chairman & headmaster messages, classes, notice, gallery, video, social links, staff names/designations) | `docs/source-data/bqes-public-data.json`                                                                            |
| Contact details, School Code and EIIN transcribed from the school's admission banner (needs school confirmation)                                                          | same file, `contactFromAdmissionBanner`                                                                             |
| Real school images (logo, leaders, banners, sports-day gallery, admission notice)                                                                                         | `public/images/bqes/`                                                                                               |
| Demo photos (public domain / CC0, **not BQES**)                                                                                                                           | `public/images/demo/` — credits in `docs/source-data/DEMO-IMAGE-CREDITS.md` and `docs/source-data/demo-images.json` |

Facts worth knowing:

- Founded in Banasree in **2010** (both leadership messages). The logo reads "Quality Education College, ESTD 2006" (parent institution).
- Classes: Play, Nursery, Junior One, One–Ten; Nine and Ten have Science and Business Studies groups. Bangla medium and English version.
- The headmaster's message lists: smart boards, IR boards and multimedia projectors in every classroom; online school banking; on-campus prayer; canteen, store and vending machine; cultural, debate, science and math clubs with TV/national competition participation. The admission banner adds: all classrooms air-conditioned; a new, spacious play zone.
- Stats from the vendor API: 281 students, 27 teachers, 1 campus. Its staff count is inconsistent, so don't display it.
- **Staff photos on the old site require a vendor login and are not public.** Use the initial-letter avatar until the school supplies approved photos.
- The address, phones, School Code and EIIN come **only** from the banner transcription. Display them, and record `docs/source-data` as the source in a code comment so the school can confirm them.

## Rules for content (non-negotiable)

- Never invent names, phone numbers, emails, statistics, results, achievements, testimonials, fees, dates, facilities, awards or policies.
- Missing information gets a clearly marked placeholder (`common.toBeConfirmed`, `page.preparingTitle` / `page.preparingMessage`, or `EmptyState`).
- Demo images must be marked `isDemo: true` in data, and the UI shows the `demo` badge where it is reasonable.
- No fake testimonials, events, news or notices. Use empty states instead.
- Never use another school's branding, photos, text or identity.
- Forms (admission, contact) are **frontend prototypes**: no network submission, no logging of personal data, and they are clearly labelled as prototypes.
- No payment processing, no fake authentication, no unsecured admin panel.
- Don't publish student names or photos without approval. The real sports-day photos from the school's own site are acceptable.

---

## Remaining phases

Each phase reuses the existing architecture (see `CLAUDE.md`). To turn a placeholder page into a real one, create the feature component and register its loader in `PAGE_COMPONENTS` in `src/app/app.routes.ts`. Add detail routes (e.g. `teachers/:slug`) to `pageRoutes` there, and add them to `app.routes.server.ts` with `getPrerenderParams`.

### Phase 4 — Main layout & homepage

Sections, in this order: announcement bar (exists) → header (exists) → hero with real school photography (banners or gallery) and an Admission CTA → quick access links → About BQES → Why choose BQES (verified facilities only) → headmaster/chairman message (real text and photo) → academic programs (real classes) → teachers preview → campus & facilities → latest notices → upcoming events (empty state) → achievements (placeholder) → photo gallery (real) → video gallery (real YouTube video) → guardian testimonials (honest empty state) → admission CTA → FAQ preview → contact info & map → footer (exists).
Also: move the banner-transcribed address, phones, EIIN and school code into `src/app/core/data/school-info.data.ts`, with a source comment.
**Acceptance:** renders in bn and en; every link leads to a valid route; no horizontal overflow at 320–1440 px; no broken images; loading and empty states handled; build passes.

### Phase 5 — About & academic pages

About, history, mission & vision, messages (chairman and headmaster, real), educational philosophy, academic overview, programs/classes (real list), class information, facilities (verified list). Each page has a `PageHeader` with breadcrumbs (`BreadcrumbService.forPage`), intro, images, related links and SEO metadata. Mission and vision text isn't published, so mark it as a placeholder.
**Acceptance:** all routes work in both languages; consistent layout; metadata set; tests pass.

### Phase 6 — Teachers & faculty directory

A typed `Teacher` model plus `TeacherService` fed from `bqes-public-data.json` staff (name, designation; no private fields). Cards use an initial-letter avatar. Filters by designation (Principal / Teacher / Staff), detail route `teachers/:slug`, and an empty filter result. Names are only in English, so the Bangla page shows the English name (no transliteration invented).
**Acceptance:** cards display; filters work; empty results handled; detail routes work; mobile usable; tests pass.

### Phase 7 — Admission

Admission overview, eligibility, available classes, application steps, required documents, admission calendar (placeholder dates), FAQ, contact, CTA. A multi-step Reactive Forms wizard: student → guardian → academic → documents → review → confirmation. Clearly labelled as a **prototype** with no backend; accessible errors (`aria-describedby`, `aria-live`); no personal data logged; no payment.
**Acceptance:** validation works; required fields enforced; errors accessible; submission states correct; tests pass.

### Phase 8 — Notices, news & events

Models and services for each. Notice board: the real admission notice (with its image attachment `images/bqes/notices/admission-2026.webp`), category, date, detail page, filters, pagination, safe attachment links. News and events: listing and detail architecture with honest empty states (no fake items).
**Acceptance:** listings, filters, pagination and detail routes work; attachments are handled safely; both languages; tests and build pass.

### Phase 9 — Gallery, videos & achievements

Gallery with category filter, responsive grid, the `Lightbox` component, lazy loading and alt text (real sports-day photos). Videos: YouTube thumbnails and a nocookie embed in an accessible modal (`aPdUbVyfpSU`, "Study Tour - 2025"). Achievements: academic, sports and cultural categories as placeholders, since none are published.
**Acceptance:** keyboard-accessible lightbox and modals; responsive images without layout shift; valid video links; tests pass.

### Phase 10 — Results, resources & academic calendar

An integration-ready results lookup UI that exposes no private data. Class and exam routines, academic calendar (responsive), syllabus, study resources, downloadable forms and policies — all as placeholders with filters (class, subject, year, exam, resource type).
**Acceptance:** filters work; downloads work for available files; responsive calendar; no private data exposed; tests pass.

### Phase 11 — Guardian reviews, FAQ & contact

Testimonials: a model and component, but an empty state (none are verified). FAQ: categories, search and accordion, in bn and en. Answers must be generic or about site usage unless the school supplies them. Contact: address, phones, office hours (placeholder), map (`SCHOOL_INFO.mapEmbedUrl`), and a validated contact form prototype with success and error states and no endpoint.
**Acceptance:** forms validate; FAQ works; contact details consistent; valid map location; no fake endpoints; tests pass.

### Phase 12 — Site search & navigation polish

A client-side index over pages, teachers, notices, news, events and resources; `/search?q=` with results, category labels, empty states, pagination and keyboard support, in both languages. Polish breadcrumbs, related content and mobile interactions.

### Phase 13 — SEO & SSR

A `SeoService` that sets title, description, canonical, Open Graph and Twitter tags, and hreflang (bn, en, x-default). JSON-LD: `School`/`EducationalOrganization`, `BreadcrumbList`, and `Article`/`Event` only where real data exists. `public/robots.txt`; a sitemap generated from `PAGES` (`scripts/generate-sitemap.mjs`); correct 404 status (already done). Verify the SSR HTML contains content.

### Phase 14 — Accessibility & performance

Add `@axe-core/playwright` audits of key routes; check heading hierarchy, contrast, focus, reduced motion and form errors. Performance: lazy routes, `NgOptimizedImage` with sizes, no layout shift. Run Lighthouse in Chrome and report the actual numbers.

### Phase 15 — CMS / API readiness

Every content service goes through a repository interface (an `InjectionToken`) with a `Local…Repository` (current data) and an unwired `Http…Repository` stub that uses `environment.apiBaseUrl`. Use a shared loading/error/empty pattern. Write `docs/CONTENT-INTEGRATION.md` listing what the school must supply.

### Phase 16 — Final QA

Run every check. Playwright at 320, 375, 425, 768, 1024, 1280 and 1440 px in bn and en; console-error check; form review; honest final report. Do not claim production readiness for backend features.

---

## Verification commands (run all, every phase)

```bash
npm ci                                   # if node_modules is missing
npm run typecheck                        # app + spec TypeScript
npm run lint                             # ESLint (Angular + a11y template rules)
npx ng test --watch=false                # Vitest unit tests
npx ng build                             # production build + SSR prerender
PORT=4310 ./scripts/ssr-smoke.sh /bn /en /bn/about /en/nope   # SSR status/lang/title
npx playwright test                      # e2e against the SSR build
```

Playwright uses Google Chrome if it is installed. Otherwise run `npx playwright install --with-deps chromium` once.

## Phase report format

```
### Phase N: [Name]
Implemented • Files created or modified • Dependencies • Commands executed
Verification: Type checking / Unit tests / Lint / Production build / Browser tests — PASS | FAIL | NOT RUN
Issues (honest) • Acceptance criteria: PASS or BLOCKED (why)
```

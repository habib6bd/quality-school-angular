# Decisions (autonomous run)

One line per ambiguous choice, made to stay consistent with the plan, the content rules and the existing code.

## Phase 4

- Content services return `Observable`s and components read them with `rxResource` + the shared `AsyncState` component, so loading/error/empty are handled once and Phase 15 can swap the data source for a repository without touching components.
- The homepage `<h1>` is the school name; the published tagline "মানসম্মত শিক্ষাই আমাদের অঙ্গীকার" (from the admission banner) is the hero sub-line.
- The hero shows no extra admission chip: the site-wide announcement bar already carries the admission message, so it is not duplicated.
- Stats (281 students, 27 teachers, 1 campus) are shown with a note that they come from the school's existing website; the staff count is not shown (plan). The published teacher figure (27) differs from the 24 principal+teacher entries in the staff list; both are kept as published rather than reconciled.
- The chairman and headmaster messages have English translations written for this site (marked in `leadership.data.ts` for the school to review). Leader names are published in Bangla only, so no English spelling is invented; they are shown in Bangla script with `lang="bn"` on English pages.
- "Principal" (staff list, English name "Sk. Md. Abdullah Al Mizan") and "Headmaster" (message, Bangla name "ড. আব্দুল্লাহ আল মিজান") are not assumed to be the same record; both are shown as published. The Bangla label for Principal is "প্রধান শিক্ষক".
- Gallery photos keep the school's own grouping: the two filed under "Annual Sports" are `annual-sports`; the others had no group and are `school-events`. Alt text describes only what is visible. Files keep their original `annual-sports-N` names.
- Notice `expiresAt` is stored but not used to hide notices: the notice window (to 2026-02-28) conflicts with the school's scrolling announcement (to 2026-11-17).
- The Playwright config accepts `PW_EXECUTABLE` to use a pre-installed Chromium when Playwright's own download is blocked (the sandbox has Chromium 141 but Playwright 1.63 expects a newer build). Default behaviour is unchanged. `ignoreHTTPSErrors` is enabled because the only external hosts are the font CDN behind a TLS-inspecting proxy in sandboxes.
- E2E tests stub Google Fonts, YouTube and Google Maps (`e2e/fixtures.ts`, `e2e/support.ts`) so they are deterministic offline and real console errors stay visible.
- The Angular CLI in this sandbox needs Node ≥ 22.22.3; a newer Node was installed outside the repo (scratch directory) only to run the checks.

## Phase 5

- Added an "Educational philosophy" page (`about/philosophy`) and a class information page (`academics/programs/:slug`) because the plan lists them but the page registry had no entry. Both are in the nav/sitemap sources.
- Mission and vision are two clearly marked placeholders (not published). The philosophy page shows only themes quoted from the published Chairman/Headmaster messages, each with a source line, plus a placeholder for a formal statement.
- "Recognised by the Dhaka Education Board" is shown on About and Academics with the note "as stated on the school's admission banner" (it is printed on the banner), not as an independently verified claim.
- The logo's "ESTD 2006" parent-institution mention in the plan is not used anywhere: both leader messages and the banner say 2010, and the 2006 reading could not be verified from the repo's logo file.
- Class pages show only name, order, medium and groups. Subjects, routine, syllabus and fees are a placeholder, never invented.
- Unknown class slugs are rendered by the router (so the layout stays), show the shared not-found page and set the HTTP status to 404 through `RESPONSE_INIT` (`ResponseStatusService`); known slugs are prerendered with a server fallback. The same pattern will be used by teacher/notice/news/event detail routes.
- `SeoService` was introduced here (title, description, Open Graph, Twitter) and is called by the title strategy for every route; canonical URLs, hreflang and JSON-LD are left to Phase 13 as the plan says. Every `PAGES` entry now has a `descriptionKey`.

## Phase 6

- Staff directory filters live in the URL (`?designation=…&q=…`), so a filtered list is shareable, survives the language switch and is rendered on the server. Because the content depends on the query string, pages flagged `queryDriven` in the page registry are rendered per request instead of prerendered (otherwise the static HTML would not match what the browser hydrates). Only `teachers` is flagged so far; later list pages with filters/pagination will be flagged too.
- Staff are shown exactly as published: English names on both language pages (with `lang="en"`), no transliteration, avatar initials only. Profile pages show name and designation, a pending note for photo/profile, and point to the school's general contact page; no private contact fields exist in the model.
- Two entries share the name "Habibur Rahman" with different spellings/serials in the source (`habibur-rahman`, `habibur-rahman-2`); both are kept as published.
- The app now sets `data-app-ready="true"` on `<html>` once hydrated and stable. E2E `goto` waits for it, because typing into a server-rendered control before hydration is lost (a real race that surfaced in the name-search test).

## Phase 7

- Eligibility, application steps, required documents and admission dates are not published anywhere, so each is a marked placeholder (`PendingNote`; calendar rows read "To be confirmed by the school"). No age limits, fees or document names were written. The page does show what the school did publish: the 2026 admission notice with its image (opens in the lightbox), the classes that admit, and the banner contact details.
- The application is a Reactive Forms wizard (student → guardian → class & medium → documents → review → confirmation) kept in memory only: no HTTP client is used, nothing is stored (no local/session storage, no cookies) and nothing is logged. Unit and e2e tests assert all of this, including spying on `fetch`, XHR, `sendBeacon` and `console.*`.
- The documents step uploads nothing (the list of documents is unpublished); it asks the visitor to acknowledge that this is a prototype. The final screen is labelled "Prototype finished".
- Mobile numbers accept `01XXXXXXXXX`, with or without `+88`/`88`, and Bangla digits; date of birth only has to be a real, non-future date (no invented age rules). A study group is required only for the classes that have groups (Nine, Ten).
- Reusable form building blocks were added to `shared/forms`: `FormField` + `FieldControl` (label, hint, error, `aria-describedby`, `aria-invalid`, `aria-required`, polite live region) and `ErrorSummary` (alert that takes focus and links to each invalid field). Contact (Phase 11) reuses them.
- The nav label "অনলাইন আবেদন / Apply Online" is kept as registered; the page itself carries the prototype label.

## Phase 8

- Notices, news and events each get a list page (URL-driven: `?category=`, `?view=`, `?page=`; rendered per request, flagged `queryDriven`) and a detail route (`notices|news|events/:slug`, prerendered per slug via the services, real 404 for unknown slugs). Only the one real notice exists; news and events are empty and show honest empty states. Detail pages for news/events are exercised in unit tests with stub services, never with invented content in the app data.
- The notice filter always shows all five categories (with counts, so 0 for those without notices) instead of hiding empty ones; an empty category shows "No notices in this category" with a way back.
- Out-of-range or invalid `page` values are clamped to the valid range (no error page). Page size: notices 6, news/events 9.
- Attachments are linked only through `safeAttachmentPath`: site-relative paths, no scheme/`//`/`..`/query/fragment, allowed types `webp png jpg jpeg pdf`. Links open in a new tab with `rel="noopener noreferrer"` plus a `download` link; unsafe attachments are not rendered and the page says one was skipped. The `NoticeAttachment` model is now a union of image and pdf attachments.
- The homepage notice card and the admission page now link to the notice detail page.

## Phase 9

- The gallery filter (`?category=`) uses the school's own grouping: "Annual Sports" (2 photos) and "School events" (the 5 photos the school left ungrouped). The lightbox caption is the photo's description (the school's photos have no captions, only the generic title "BQES").
- Gallery pages are rendered per request (`queryDriven`) so a filtered URL is correct on the server. The first two photos load eagerly, the rest lazily; every photo has explicit width/height and a fixed aspect-ratio tile (measured CLS < 0.1 in the browser test).
- The video tile + dialog logic is now one shared `VideoGallery` used by the homepage and `/videos`: nothing from YouTube loads until the visitor opens the player (privacy-enhanced `youtube-nocookie.com` embed, id validated against `[A-Za-z0-9_-]{11}`); each video also links to its YouTube page and the school channel (from the verified social links) with `rel="noopener noreferrer"`.
- Achievements: the school has published none, so each of the three categories (academic, sports, cultural) is a marked placeholder; real items from `AchievementService` replace the placeholder for their category automatically. The football-tournament photos in the gallery were deliberately not turned into "achievements" because no result or title is published.

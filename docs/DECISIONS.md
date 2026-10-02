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

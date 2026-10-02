# CLAUDE.md

Bilingual school website for **Banasree Quality Education School (BQES)**: Angular 22 (standalone, signals, zoneless), SSR with prerendering, Tailwind CSS v4, Vitest, Playwright.

**Plan, progress and content rules: [docs/DEVELOPMENT-PLAN.md](docs/DEVELOPMENT-PLAN.md). Read it first.** By default, do one phase per session, verify it, update the status table, and stop with the phase report so the owner can review. If the owner's prompt asks for an **autonomous run**, keep going phase after phase and commit each verified phase. The owner's prompt always takes precedence over this default.

## Commands

```bash
npm run typecheck && npm run lint && npx ng test --watch=false && npx ng build
npx playwright test          # needs a fresh `ng build`; uses Chrome or bundled Chromium
PORT=4310 ./scripts/ssr-smoke.sh /bn /en/about /bn/nope
```

## Architecture

- **Routes:** `src/app/core/config/pages.ts` (`PAGES`) is the single list of static pages. It feeds the router (`app.routes.ts`), SSR prerendering (`app.routes.server.ts`), titles and breadcrumbs. Each page exists under `/bn/...` and `/en/...`; `/` redirects to `/bn`. A page without an entry in `PAGE_COMPONENTS` renders `PlaceholderPage`.
- **Language:** the URL prefix is the source of truth. `Shell` sets `LanguageService` from route data. Switching language navigates to the same path under the other prefix (`LanguageSwitcher`).
- **UI strings:** `core/i18n/translations/bn.ts` is the source of truth for keys, and `en.ts` must mirror it (a unit test enforces this). Use them in templates with `{{ 'key' | t }}`, or `TranslationService.t()` in code. Never hard-code visible text.
- **School content:** use `Localized` (`{ bn, en? }`) with the `localize` pipe. English falls back to Bangla. Data lives in `core/data/*.data.ts`, models in `core/models`, and access goes through `core/services` (components never import data files).
- **Numbers and dates:** use the `localeNumber` and `localeDate` pipes (Bangla digits on bn pages).
- **Inner pages:** start with `<app-page-header [title] [intro] [breadcrumbs]="crumbs.forPage('path')">`.
- **Shared UI (`src/app/shared`):** `appButton` directive, `app-icon`, `section-heading`, `badge` (tone `demo` for demo content), `breadcrumbs`, `modal` (native `<dialog>`), `lightbox`, `accordion`, `tabs`, `pagination`, `search-box`, `skeleton`, `empty-state`, `error-state`, `page-header`, and the `appReveal` directive.
- **Styling:** use Tailwind utilities with the theme tokens in `src/styles.css` (`primary` = logo green, `secondary` = logo blue, `accent` = amber; amber is decorative, never text on white). Component classes: `container-page`, `section`, `card`, `card-interactive`, `prose-content`.
- **Images:** `NgOptimizedImage` with explicit width and height. Files in `public/images/{bqes,demo}` are referenced as `images/...`.

## Conventions

- Strict TypeScript and strict templates; no `any`; `ChangeDetectionStrategy.OnPush`; `input()`/`model()`/`output()`; control flow `@if`/`@for`.
- File names have no suffix (`header.ts` exports `Header`), matching the existing code.
- Every new component or service gets a meaningful spec. User-facing flows get a Playwright test in `e2e/`.
- Don't disable lint rules or tests to pass checks. If an exception is truly needed, scope it to one line and write the reason next to it.
- Run Prettier on changed files (`npx prettier --write <files>`).
- Commit or push only when the owner asks (an autonomous-run prompt counts). Never deploy, force-push, rewrite history, or push to `main`.

# Banasree Quality Education School — Website

Bilingual (বাংলা / English) public website for Banasree Quality Education School (BQES), built with Angular 22, server-side rendering, and Tailwind CSS v4.

- **Plan and progress:** [docs/DEVELOPMENT-PLAN.md](docs/DEVELOPMENT-PLAN.md)
- **Architecture and conventions:** [CLAUDE.md](CLAUDE.md)
- **Verified school data and image sources:** [docs/source-data/](docs/source-data/)

## Getting started

```bash
npm ci
npm start                 # dev server with SSR at http://localhost:4200 (redirects to /bn)
```

## Checks

```bash
npm run check             # typecheck + lint + unit tests + production build
npx playwright test       # end-to-end tests against the built SSR server
```

Playwright uses Google Chrome when it's installed. Otherwise install Chromium once with `npx playwright install --with-deps chromium`.

## Production server

```bash
npm run build
PORT=4000 npm run serve:ssr:quality-school-angular
```

Allowed host names for SSR are set in `angular.json` → `security.allowedHosts`.

## Content status

Much of the school's information (mission, routines, results, fees, testimonials, etc.) has not been published yet. Pages show clearly marked placeholders until the school supplies it. Photos in `public/images/demo/` are public-domain demo images, not photos of BQES.

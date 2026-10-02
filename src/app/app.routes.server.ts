import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'bn', renderMode: RenderMode.Prerender },
  { path: 'en', renderMode: RenderMode.Prerender },
  // Any URL not matched above renders the not-found page with a real 404 status.
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];

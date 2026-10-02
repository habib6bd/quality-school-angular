import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/** Build output with a content hash in its name (`main-GXGH7SKZ.js`) can be cached forever. */
const HASHED_ASSET = /-[A-Za-z0-9_-]{8}\.(?:js|css)$/;

/** Gzip/brotli-compress text responses (HTML, JS, CSS, JSON, XML, SVG). */
app.use(compression());

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    // Hashed bundles never change; everything else (images, fonts, robots.txt, sitemap.xml) may,
    // so it is revalidated daily instead of being pinned for a year.
    setHeaders: (res, path) => {
      const maxAge = HASHED_ASSET.test(path)
        ? 'public, max-age=31536000, immutable'
        : path.includes('/fonts/')
          ? 'public, max-age=2592000'
          : 'public, max-age=86400';
      res.setHeader('Cache-Control', maxAge);
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

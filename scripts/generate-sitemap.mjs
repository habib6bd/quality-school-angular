#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the page registry (`PAGES`) plus the detail pages that exist
 * in the data files (classes, staff, notices, news, events), in both languages with hreflang
 * alternates. The TypeScript sources are read with esbuild (already installed by the Angular
 * build), so the sitemap can never drift from what the app serves.
 *
 *   node scripts/generate-sitemap.mjs            write public/sitemap.xml
 *   node scripts/generate-sitemap.mjs --check    exit 1 if the file is out of date
 *   SITE_URL=https://example.org node scripts/generate-sitemap.mjs
 */
import { transformSync } from 'esbuild';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const LANGS = ['bn', 'en'];
const DEFAULT_LANG = 'bn';

/** Loads a TypeScript module that only has type-only imports. */
async function loadTs(relativePath) {
  const source = readFileSync(join(root, relativePath), 'utf8');
  const { code } = transformSync(source, { loader: 'ts', format: 'esm', target: 'es2022' });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const env = readFileSync(join(root, 'src/environments/environment.ts'), 'utf8');
  const match = /siteUrl:\s*'([^']+)'/.exec(env);
  if (!match) throw new Error('siteUrl not found in src/environments/environment.ts');
  return match[1].replace(/\/+$/, '');
}

const escapeXml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function buildSitemap() {
  const base = siteUrl();
  const { PAGES } = await loadTs('src/app/core/config/pages.ts');
  const { CLASSES } = await loadTs('src/app/core/data/classes.data.ts');
  const { TEACHERS } = await loadTs('src/app/core/data/teachers.data.ts');
  const { NOTICES } = await loadTs('src/app/core/data/notices.data.ts');
  const { NEWS } = await loadTs('src/app/core/data/news.data.ts');
  const { EVENTS } = await loadTs('src/app/core/data/events.data.ts');

  /** @type {{ path: string, lastmod?: string }[]} */
  const entries = [
    ...PAGES.filter((page) => !page.noindex).map((page) => ({ path: page.path })),
    ...CLASSES.map((item) => ({ path: `academics/programs/${item.slug}` })),
    ...TEACHERS.map((item) => ({ path: `teachers/${item.slug}` })),
    ...NOTICES.map((item) => ({ path: `notices/${item.slug}`, lastmod: item.publishedAt })),
    ...NEWS.map((item) => ({ path: `news/${item.slug}`, lastmod: item.publishedAt })),
    ...EVENTS.map((item) => ({ path: `events/${item.slug}` })),
  ];

  const url = (lang, path) => `${base}/${lang}${path ? `/${path}` : ''}`;
  const blocks = entries.flatMap((entry) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(url(l, entry.path))}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(url(DEFAULT_LANG, entry.path))}"/>`,
      ];
      return [
        '  <url>',
        `    <loc>${escapeXml(url(lang, entry.path))}</loc>`,
        ...(entry.lastmod ? [`    <lastmod>${entry.lastmod}</lastmod>`] : []),
        ...alternates,
        '  </url>',
      ].join('\n');
    }),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...blocks,
    '</urlset>',
    '',
  ].join('\n');
}

const outPath = join(root, 'public/sitemap.xml');

if (import.meta.filename === process.argv[1]) {
  const xml = await buildSitemap();
  if (process.argv.includes('--check')) {
    const current = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';
    if (current !== xml) {
      console.error('public/sitemap.xml is out of date. Run: npm run sitemap');
      process.exit(1);
    }
    console.log('public/sitemap.xml is up to date.');
  } else if (process.argv.includes('--stdout')) {
    process.stdout.write(xml);
  } else {
    writeFileSync(outPath, xml);
    console.log(`Wrote ${outPath} (${xml.match(/<url>/g)?.length ?? 0} URLs)`);
  }
}

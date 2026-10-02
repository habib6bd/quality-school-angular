import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const PORT = 4310;

/**
 * Use the locally installed Google Chrome when present; otherwise fall back to Playwright's
 * bundled Chromium (install it with `npx playwright install --with-deps chromium`).
 */
const channel =
  process.env['PW_CHANNEL'] ??
  (existsSync('/usr/bin/google-chrome') || existsSync('/opt/google/chrome/chrome')
    ? 'chrome'
    : undefined);

/**
 * End-to-end checks run against the production SSR build (`npm run build` first).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel } }],
  webServer: {
    command: 'node dist/quality-school-angular/server/server.mjs',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/bn`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});

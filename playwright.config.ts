import { defineConfig, devices } from '@playwright/test';

const PORT = 4310;

/**
 * End-to-end checks run against the production SSR build (`npm run build` first).
 * Uses the locally installed Google Chrome rather than a downloaded browser.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: {
    command: 'node dist/quality-school-angular/server/server.mjs',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/bn`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});

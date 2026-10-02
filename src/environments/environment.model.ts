export interface AppEnvironment {
  production: boolean;
  /** Public origin used for canonical URLs, sitemap and Open Graph tags. */
  siteUrl: string;
  /**
   * Base URL of the school content API. `null` means no backend is connected yet
   * and the app serves clearly-labelled local data from `src/app/core/data`.
   */
  apiBaseUrl: string | null;
}

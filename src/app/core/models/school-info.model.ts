import { Localized } from '../i18n/localized';

export interface SocialLink {
  network: 'facebook' | 'youtube';
  url: string;
}

export interface ExternalLink {
  label: Localized;
  url: string;
}

/**
 * Core facts about the school. `null` means the school has not supplied the value yet;
 * the UI must show a "to be confirmed" placeholder rather than inventing one.
 */
export interface SchoolInfo {
  name: Localized;
  shortName: Localized;
  establishedYear: number;
  logo: { src: string; width: number; height: number };
  address: Localized | null;
  phones: readonly string[];
  emails: readonly string[];
  officeHours: Localized | null;
  eiin: string | null;
  schoolCode: string | null;
  /** Google Maps embed URL. */
  mapEmbedUrl: string;
  social: readonly SocialLink[];
  importantLinks: readonly ExternalLink[];
  stats: { students: number; teachers: number; staff: number; campuses: number } | null;
}

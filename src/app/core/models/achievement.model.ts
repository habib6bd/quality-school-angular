import { Localized } from '../i18n/localized';

export type AchievementCategory = 'academic' | 'sports' | 'cultural';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: Localized;
  description: Localized;
  /** ISO date or year string, when the school supplies one. */
  date?: string;
}

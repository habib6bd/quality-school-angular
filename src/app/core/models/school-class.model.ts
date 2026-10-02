import { Localized } from '../i18n/localized';

export type ClassGroup = 'science' | 'business';

export interface SchoolClass {
  slug: string;
  name: Localized;
  /** Position in the school's published class list (Play = 1). */
  order: number;
  /** Study groups offered in this class; empty when the class has no groups. */
  groups: readonly ClassGroup[];
}

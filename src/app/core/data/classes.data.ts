import { SchoolClass } from '../models/school-class.model';

/**
 * Classes published by the school (API `GetClass`, bqesbd.com): Play to Ten,
 * with Science and Business Studies groups in Nine and Ten.
 */
const GROUPS = ['science', 'business'] as const;

export const CLASSES: readonly SchoolClass[] = [
  { slug: 'play', name: { bn: 'প্লে', en: 'Play' }, order: 1, groups: [] },
  { slug: 'nursery', name: { bn: 'নার্সারি', en: 'Nursery' }, order: 2, groups: [] },
  { slug: 'junior-one', name: { bn: 'জুনিয়র ওয়ান', en: 'Junior One' }, order: 3, groups: [] },
  { slug: 'one', name: { bn: 'প্রথম শ্রেণি', en: 'Class One' }, order: 4, groups: [] },
  { slug: 'two', name: { bn: 'দ্বিতীয় শ্রেণি', en: 'Class Two' }, order: 5, groups: [] },
  { slug: 'three', name: { bn: 'তৃতীয় শ্রেণি', en: 'Class Three' }, order: 6, groups: [] },
  { slug: 'four', name: { bn: 'চতুর্থ শ্রেণি', en: 'Class Four' }, order: 7, groups: [] },
  { slug: 'five', name: { bn: 'পঞ্চম শ্রেণি', en: 'Class Five' }, order: 8, groups: [] },
  { slug: 'six', name: { bn: 'ষষ্ঠ শ্রেণি', en: 'Class Six' }, order: 9, groups: [] },
  { slug: 'seven', name: { bn: 'সপ্তম শ্রেণি', en: 'Class Seven' }, order: 10, groups: [] },
  { slug: 'eight', name: { bn: 'অষ্টম শ্রেণি', en: 'Class Eight' }, order: 11, groups: [] },
  { slug: 'nine', name: { bn: 'নবম শ্রেণি', en: 'Class Nine' }, order: 12, groups: GROUPS },
  { slug: 'ten', name: { bn: 'দশম শ্রেণি', en: 'Class Ten' }, order: 13, groups: GROUPS },
];

import { Announcement } from '../models/announcement.model';

/**
 * Source: scrolling news on bqesbd.com (API `GetScrollingNews`, id 1, active 2025-06-05 → 2026-11-17).
 * English text is a translation of the published Bangla text.
 */
export const ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: 'admission-2026',
    message: {
      bn: 'বনশ্রী কোয়ালিটি এডুকেশন স্কুলে ২০২৬ শিক্ষাবর্ষে ভর্তি চলছে — বাংলা ও ইংরেজি মাধ্যম, প্লে থেকে দশম শ্রেণি পর্যন্ত; বিজ্ঞান ও ব্যবসায় শিক্ষা বিভাগ।',
      en: 'Admission for the 2026 academic year is open at Banasree Quality Education School — Bangla and English medium, Play to Class Ten; Science and Business Studies groups.',
    },
    linkPath: 'admission',
    linkLabel: { bn: 'বিস্তারিত', en: 'Details' },
    startDate: '2025-06-05',
    endDate: '2026-11-17',
  },
];

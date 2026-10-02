import { Notice } from '../models/notice.model';

/**
 * Real notices from bqesbd.com (API `GetNotices`). The English title and summary are
 * translations of the published Bangla text. Add new notices here only when the school
 * publishes them; never invent notices.
 */
export const NOTICES: readonly Notice[] = [
  {
    slug: 'admission-2026',
    title: {
      bn: 'বনশ্রী কোয়ালিটি এডুকেশন স্কুলে ২০২৬ শিক্ষাবর্ষে প্লে-দশম শ্রেণি পর্যন্ত ভর্তি চলছে।',
      en: 'Admission is open for Play to Class Ten for the 2026 academic year at Banasree Quality Education School.',
    },
    summary: {
      bn: 'বাংলা ও ইংরেজি মাধ্যম। প্লে থেকে দশম শ্রেণি পর্যন্ত বিজ্ঞান ও ব্যবসায় শিক্ষা বিভাগে ভর্তি চলছে।',
      en: 'Bangla and English medium. Admission is open from Play to Class Ten, including the Science and Business Studies groups.',
    },
    category: 'admission',
    publishedAt: '2025-11-19',
    expiresAt: '2026-02-28',
    attachments: [
      {
        kind: 'image',
        src: 'images/bqes/notices/admission-2026.webp',
        width: 822,
        height: 1280,
        label: { bn: 'ভর্তি বিজ্ঞপ্তি ২০২৬', en: 'Admission notice 2026' },
      },
    ],
  },
];

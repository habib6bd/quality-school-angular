import { SchoolInfo } from '../models/school-info.model';

/**
 * Verified from the public API behind the existing site bqesbd.com (fetched 2026-10-02):
 * name, 2010 founding (chairman/headmaster messages), logo, map query, social links,
 * important links and student/teacher counts.
 *
 * Address, phone numbers, School Code and EIIN come ONLY from the school's own admission
 * banner (public/images/bqes/banners/banner-2.webp), transcribed by eye with Bangla digits
 * converted (see docs/source-data/bqes-public-data.json → contactFromAdmissionBanner).
 * The school must confirm them before they are treated as final.
 * Email and office hours were not published anywhere and stay empty until supplied.
 */
export const SCHOOL_INFO: SchoolInfo = {
  name: { bn: 'বনশ্রী কোয়ালিটি এডুকেশন স্কুল', en: 'Banasree Quality Education School' },
  shortName: { bn: 'বিকিউইএস', en: 'BQES' },
  establishedYear: 2010,
  logo: { src: 'images/bqes/logo.webp', width: 224, height: 224 },
  address: {
    bn: 'বাড়ি # কে-২৭৮, রোড # ১৬ (জোড়া খাম্বার পাশে), দক্ষিণ বনশ্রী, ঢাকা',
    en: 'House K-278, Road 16 (beside Jora Khamba), South Banasree, Dhaka',
  },
  phones: ['01678708862', '01711732486'],
  emails: [],
  officeHours: null,
  eiin: '134172',
  schoolCode: '424256',
  mapEmbedUrl:
    'https://maps.google.com/maps?width=600&height=400&hl=en&q=Banasree%20Quality%20Education%20School&t=&z=17&ie=UTF8&iwloc=B&output=embed',
  social: [
    { network: 'facebook', url: 'https://www.facebook.com/BanasreeQualityEducationSchool' },
    { network: 'youtube', url: 'https://www.youtube.com/@bqes.' },
  ],
  importantLinks: [
    {
      label: { bn: 'ঢাকা শিক্ষা বোর্ড', en: 'Dhaka Education Board' },
      url: 'https://dhakaeducationboard.gov.bd/',
    },
    {
      label: { bn: 'শিক্ষা মন্ত্রণালয়', en: 'Ministry of Education' },
      url: 'https://moedu.gov.bd/',
    },
    { label: { bn: 'ব্যানবেইস', en: 'BANBEIS' }, url: 'https://banbeis.gov.bd/' },
    { label: { bn: 'এটুআই', en: 'a2i' }, url: 'https://a2i.gov.bd/' },
  ],
  stats: { students: 281, teachers: 27, staff: 1, campuses: 1 },
};

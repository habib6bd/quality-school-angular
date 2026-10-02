import { SchoolInfo } from '../models/school-info.model';

/**
 * Verified from the public API behind the existing site bqesbd.com (fetched 2026-10-03):
 * name, 2010 founding (chairman/headmaster messages), logo, map query, social links,
 * important links and student/teacher counts. Address, phone, email, office hours
 * and EIIN were not published there and must be supplied by the school.
 */
export const SCHOOL_INFO: SchoolInfo = {
  name: { bn: 'বনশ্রী কোয়ালিটি এডুকেশন স্কুল', en: 'Banasree Quality Education School' },
  shortName: { bn: 'বিকিউইএস', en: 'BQES' },
  establishedYear: 2010,
  logo: { src: 'images/bqes/logo.webp', width: 224, height: 224 },
  address: null,
  phones: [],
  emails: [],
  officeHours: null,
  eiin: null,
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

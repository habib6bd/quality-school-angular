import { Facility } from '../models/facility.model';

/**
 * Only facilities the school itself has published: the headmaster's message (bqesbd.com)
 * and the 2026 admission banner. Do not add anything the school has not stated.
 */
export const FACILITIES: readonly Facility[] = [
  {
    id: 'smart-classrooms',
    icon: 'monitor',
    title: { bn: 'স্মার্ট ক্লাসরুম', en: 'Smart classrooms' },
    description: {
      bn: 'প্রতিটি শ্রেণিকক্ষে স্মাটবোর্ড, আইআর বোর্ড ও মাল্টিমিডিয়া প্রজেক্টরের ব্যবস্থা রয়েছে।',
      en: 'Every classroom has a smart board, an IR board and a multimedia projector.',
    },
    highlight: true,
  },
  {
    id: 'air-conditioned',
    icon: 'shield',
    title: { bn: 'শীতাতপ নিয়ন্ত্রিত ক্লাসরুম', en: 'Air-conditioned classrooms' },
    description: {
      bn: 'সকল ক্লাসরুম শীতাতপ নিয়ন্ত্রিত।',
      en: 'All classrooms are air-conditioned.',
    },
    highlight: true,
  },
  {
    id: 'play-zone',
    icon: 'heart',
    title: { bn: 'আধুনিক প্লে জোন', en: 'Modern play zone' },
    description: {
      bn: 'নতুন আঙ্গিকে সুপরিসর আধুনিক প্লে জোন।',
      en: 'A spacious, newly designed modern play zone.',
    },
    highlight: true,
  },
  {
    id: 'clubs',
    icon: 'award',
    title: { bn: 'ক্লাব ও প্রতিযোগিতা', en: 'Clubs and competitions' },
    description: {
      bn: 'সাংস্কৃতিক, বিতর্ক, বিজ্ঞান ও গণিত ক্লাব স্থানীয় ও জাতীয় পর্যায়ের প্রতিযোগিতায় অংশগ্রহণ করে।',
      en: 'Cultural, debate, science and math clubs take part in local and national competitions.',
    },
    highlight: true,
  },
  {
    id: 'school-banking',
    icon: 'graduation',
    title: { bn: 'অনলাইন স্কুল ব্যাংকিং', en: 'Online school banking' },
    description: {
      bn: 'শিক্ষার্থীরা অনলাইনে স্কুল ব্যাংকিং সুবিধা ব্যবহার করতে পারে।',
      en: 'Students can use school banking online.',
    },
    highlight: false,
  },
  {
    id: 'prayer',
    icon: 'users',
    title: { bn: 'ক্যাম্পাসে নামাজের ব্যবস্থা', en: 'Prayer on campus' },
    description: {
      bn: 'শিক্ষার্থীরা ক্যাম্পাসে নামাজ আদায় করতে পারে।',
      en: 'Students can offer prayers on campus.',
    },
    highlight: false,
  },
  {
    id: 'canteen',
    icon: 'book',
    title: { bn: 'ক্যান্টিন, স্টোর ও ভেন্ডিং মেশিন', en: 'Canteen, store and vending machine' },
    description: {
      bn: 'স্কুল ক্যান্টিন, স্টোর ও ভেন্ডিং মেশিন থেকে টিফিন ও শিক্ষাসামগ্রী সংগ্রহ করা যায়।',
      en: 'Snacks and school supplies are available from the school canteen, store and vending machine.',
    },
    highlight: false,
  },
];

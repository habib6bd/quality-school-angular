import { GalleryItem } from '../models/gallery.model';

/**
 * Photos published in the gallery of bqesbd.com (all titled "BQES" there). The school filed
 * the first two under "Annual Sports"; the rest had no group, so they are "School events".
 * Alt text describes only what is visible in each photo; no dates or event names are claimed
 * beyond what is printed on banners in the photos.
 */
export const GALLERY: readonly GalleryItem[] = [
  {
    id: 'annual-sports-1',
    category: 'annual-sports',
    image: {
      src: 'images/bqes/gallery/annual-sports-1.webp',
      width: 594,
      height: 430,
      alt: {
        bn: 'পুরস্কার বিতরণ অনুষ্ঠানে একজন শিক্ষার্থী অতিথির হাত থেকে পুরস্কার নিচ্ছে; টেবিলে ট্রফি ও ক্রেস্ট সাজানো',
        en: 'A student receiving a prize from a guest at a prize-giving ceremony, with trophies and crests on the table',
      },
    },
  },
  {
    id: 'annual-sports-2',
    category: 'annual-sports',
    image: {
      src: 'images/bqes/gallery/annual-sports-2.webp',
      width: 1600,
      height: 1200,
      alt: {
        bn: 'একজন শিক্ষিকা ও তিনজন শিক্ষার্থী বাইরে একসাথে দাঁড়িয়ে আছেন',
        en: 'A teacher and three students standing together outdoors',
      },
    },
  },
  {
    id: 'school-events-3',
    category: 'school-events',
    image: {
      src: 'images/bqes/gallery/annual-sports-3.webp',
      width: 1296,
      height: 972,
      alt: {
        bn: 'ফুটবল মাঠের সামনে ট্রফি হাতে তিনজন',
        en: 'Three people with a trophy in front of a football ground',
      },
    },
  },
  {
    id: 'school-events-4',
    category: 'school-events',
    image: {
      src: 'images/bqes/gallery/annual-sports-4.webp',
      width: 1500,
      height: 1125,
      alt: {
        bn: 'টেবিলে সাজানো মডেল প্রকল্পের সামনে একজন শিক্ষিকা ও পাঁচজন শিক্ষার্থী',
        en: 'A teacher and five students behind model projects displayed on a table',
      },
    },
  },
  {
    id: 'school-events-5',
    category: 'school-events',
    image: {
      src: 'images/bqes/gallery/annual-sports-5.webp',
      width: 1500,
      height: 1125,
      alt: {
        bn: 'পদক গলায় ফুটবল পোশাকের শিক্ষার্থীরা ট্রফি ধরে আছে; পেছনে অতিথিরা ব্যানার ধরে দাঁড়িয়ে',
        en: 'Students in football kits wearing medals and holding a trophy, with guests holding a banner behind them',
      },
    },
  },
  {
    id: 'school-events-6',
    category: 'school-events',
    image: {
      src: 'images/bqes/gallery/annual-sports-6.webp',
      width: 1500,
      height: 1125,
      alt: {
        bn: 'সাদা তাঁবুর সামনে মাঠে সারি বেঁধে দাঁড়ানো শিক্ষার্থী ও শিক্ষক-শিক্ষিকারা',
        en: 'Students and teachers lined up in two rows on a field in front of white tents',
      },
    },
  },
  {
    id: 'school-events-7',
    category: 'school-events',
    image: {
      src: 'images/bqes/gallery/annual-sports-7.webp',
      width: 1500,
      height: 1125,
      alt: {
        bn: '“Motivation Program” লেখা ব্যানারের সামনে মঞ্চে দাঁড়ানো নয়জন',
        en: 'Nine people standing on a stage in front of a “Motivation Program” banner',
      },
    },
  },
];

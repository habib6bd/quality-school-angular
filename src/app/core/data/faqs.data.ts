import { FaqItem } from '../models/faq.model';

/**
 * Generic and website-usage answers only. Answers about fees, dates, age limits or policies
 * must come from the school (see docs/CONTENT-INTEGRATION.md) and are deliberately absent.
 */
export const FAQS: readonly FaqItem[] = [
  {
    id: 'switch-language',
    category: 'website',
    question: {
      bn: 'ওয়েবসাইটের ভাষা কীভাবে পরিবর্তন করব?',
      en: 'How do I change the website language?',
    },
    answer: {
      bn: 'পৃষ্ঠার উপরের ডান পাশে “বাংলা” ও “English” বোতাম আছে। যেকোনো একটিতে চাপ দিলে আপনি একই পৃষ্ঠার অন্য ভাষার সংস্করণে যাবেন।',
      en: 'Use the “বাংলা” and “English” buttons at the top right of the page. Choosing one takes you to the same page in the other language.',
    },
  },
  {
    id: 'admission-info',
    category: 'admission',
    question: {
      bn: 'ভর্তি সম্পর্কে তথ্য কোথায় পাব?',
      en: 'Where can I find information about admission?',
    },
    answer: {
      bn: 'ভর্তির সাধারণ তথ্য “ভর্তি তথ্য” পৃষ্ঠায় এবং সর্বশেষ বিজ্ঞপ্তি “নোটিশ” পৃষ্ঠায় পাওয়া যাবে। নির্দিষ্ট তারিখ, ফি বা শর্তের জন্য সরাসরি বিদ্যালয়ের সঙ্গে যোগাযোগ করুন।',
      en: 'General admission information is on the Admission page and the latest announcement is on the Notices page. For specific dates, fees or requirements, please contact the school directly.',
    },
  },
  {
    id: 'apply-online',
    category: 'admission',
    question: {
      bn: 'অনলাইন আবেদন ফরম কি সরাসরি আবেদন জমা নেয়?',
      en: 'Does the online application form submit my application?',
    },
    answer: {
      bn: 'না। বর্তমানে ফরমটি কেবল একটি প্রোটোটাইপ; এটি কোনো তথ্য কোথাও পাঠায় না বা সংরক্ষণ করে না। আবেদনের জন্য বিদ্যালয়ের সঙ্গে যোগাযোগ করুন।',
      en: 'No. For now the form is only a prototype; it does not send or store any information. Please contact the school to apply.',
    },
  },
  {
    id: 'contact-school',
    category: 'contact',
    question: { bn: 'বিদ্যালয়ের সঙ্গে কীভাবে যোগাযোগ করব?', en: 'How can I contact the school?' },
    answer: {
      bn: 'ঠিকানা ও ফোন নম্বর “যোগাযোগ” পৃষ্ঠা এবং পৃষ্ঠার নিচের অংশে দেওয়া আছে।',
      en: 'The address and phone numbers are on the Contact page and in the footer of every page.',
    },
  },
  {
    id: 'find-notices',
    category: 'website',
    question: {
      bn: 'নোটিশ ও বিজ্ঞপ্তি কোথায় দেখব?',
      en: 'Where can I see notices and announcements?',
    },
    answer: {
      bn: 'সব নোটিশ “নোটিশ” পৃষ্ঠায় প্রকাশ করা হয়। পৃষ্ঠার উপরের ঘোষণা বারেও গুরুত্বপূর্ণ ঘোষণা দেখানো হয়।',
      en: 'All notices are published on the Notices page. Important announcements also appear in the bar at the top of the page.',
    },
  },
];

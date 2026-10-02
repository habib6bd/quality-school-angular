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
  {
    id: 'pending-info',
    category: 'website',
    question: {
      bn: 'কিছু তথ্যের পাশে “বিদ্যালয় কর্তৃক নিশ্চিত করা হবে” লেখা কেন?',
      en: 'Why do some items say “To be confirmed by the school”?',
    },
    answer: {
      bn: 'এই লেখা দিয়ে বোঝানো হয়েছে যে বিদ্যালয় ওই তথ্য এখনো সরবরাহ করেনি। যাচাই করা তথ্য পাওয়ার পরই সেটি যোগ করা হবে; অনুমান করে কিছু লেখা হয় না।',
      en: 'It means the school has not supplied that information yet. It will be added once the school provides verified details; nothing is guessed.',
    },
  },
  {
    id: 'find-teachers',
    category: 'website',
    question: { bn: 'শিক্ষকদের তালিকা কোথায় পাব?', en: 'Where can I find the list of teachers?' },
    answer: {
      bn: '“শিক্ষকমণ্ডলী” পৃষ্ঠায় বিদ্যালয়ের প্রকাশিত শিক্ষক ও কর্মচারীদের নাম ও পদবি আছে। পদবি অনুযায়ী ফিল্টার করা এবং নাম দিয়ে খোঁজা যায়।',
      en: 'The Teachers page lists the names and designations the school has published. You can filter by designation and search by name.',
    },
  },
  {
    id: 'find-classes',
    category: 'academics',
    question: { bn: 'বিদ্যালয়ে কোন কোন শ্রেণি আছে?', en: 'Which classes does the school have?' },
    answer: {
      bn: 'প্লে থেকে দশম শ্রেণি পর্যন্ত। নবম ও দশম শ্রেণিতে বিজ্ঞান ও ব্যবসায় শিক্ষা বিভাগ আছে। বিস্তারিত “শ্রেণি ও কার্যক্রম” পৃষ্ঠায় দেখুন।',
      en: 'From Play to Class Ten, with Science and Business Studies groups in Classes Nine and Ten. See the Classes & Programs page for details.',
    },
  },
  {
    id: 'medium',
    category: 'academics',
    question: {
      bn: 'বিদ্যালয়ে কোন কোন মাধ্যমে পড়ানো হয়?',
      en: 'In which medium are classes taught?',
    },
    answer: {
      bn: 'বিদ্যালয়ের ভর্তি ব্যানার অনুযায়ী বাংলা মাধ্যম ও ইংলিশ ভার্সন রয়েছে।',
      en: 'According to the school’s admission banner, there are both Bangla medium and an English version.',
    },
  },
  {
    id: 'find-results',
    category: 'academics',
    question: { bn: 'ফলাফল কোথায় দেখব?', en: 'Where can I see results?' },
    answer: {
      bn: '“ফলাফল” পৃষ্ঠায় অনুসন্ধানের ব্যবস্থা রাখা হয়েছে, তবে অনলাইন ফলাফল এখনো চালু হয়নি। ফলাফলের জন্য বিদ্যালয়ের সঙ্গে সরাসরি যোগাযোগ করুন।',
      en: 'The Results page has a lookup, but online results are not live yet. For results, please contact the school directly.',
    },
  },
  {
    id: 'contact-form',
    category: 'contact',
    question: {
      bn: 'যোগাযোগ ফরম থেকে কি বার্তা পাঠানো যায়?',
      en: 'Can I send a message through the contact form?',
    },
    answer: {
      bn: 'না। ফরমটি এখনো প্রোটোটাইপ; কোনো বার্তা পাঠানো বা সংরক্ষণ করা হয় না। সরাসরি ফোনে যোগাযোগ করুন।',
      en: 'No. The form is still a prototype; no message is sent or stored. Please contact the school by phone.',
    },
  },
];

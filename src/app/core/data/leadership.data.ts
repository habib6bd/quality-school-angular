import { LeaderMessage } from '../models/leader-message.model';

/**
 * Messages published on bqesbd.com (API `GetMessages`). The Bangla text is the school's own;
 * the English text is a faithful translation prepared for this website and should be reviewed
 * by the school. Names are published in Bangla only, so no English spelling is invented.
 */
export const LEADER_MESSAGES: readonly LeaderMessage[] = [
  {
    id: 'chairman',
    name: { bn: 'কবির আহমদ' },
    role: { bn: 'চেয়ারম্যান', en: 'Chairman' },
    paragraphs: {
      bn: [
        'প্রিয় অভিভাবক,',
        'আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ। মানসম্পন্ন শিক্ষা প্রতিষ্ঠানের প্রয়োজনীয়তা অনুভব করেই ২০১০ সালে কোয়ালিটি এডুকেশন স্কুল বনশ্রী ক্যাম্পাস প্রতিষ্ঠিত হয়। প্রতিযোগিতামূলক বিশ্বে জ্ঞান ও প্রশিক্ষণের মাধ্যমে শিক্ষার্থীদের যোগ্য ও দক্ষ নাগরিক হিসাবে গড়ে তোলা অপরিহার্য। আর এসবকিছু বাস্তবায়নের জন্য সচেতন অভিভাবক ও সম্মানিত সুধীবৃন্দের সহযোগিতা একান্ত কাম্য।',
      ],
      en: [
        'Dear guardians,',
        'Assalamu Alaikum wa Rahmatullah. Feeling the need for a quality educational institution, the Quality Education School Banasree campus was established in 2010. In a competitive world, it is essential to prepare students as capable and skilled citizens through knowledge and training. To achieve all of this, the cooperation of conscious guardians and respected well-wishers is greatly desired.',
      ],
    },
    photo: {
      src: 'images/bqes/leaders/chairman.webp',
      width: 223,
      height: 274,
      alt: { bn: 'চেয়ারম্যানের ছবি', en: 'Portrait of the Chairman' },
    },
  },
  {
    id: 'headmaster',
    name: { bn: 'ড. আব্দুল্লাহ আল মিজান' },
    role: { bn: 'প্রধান শিক্ষক', en: 'Headmaster' },
    paragraphs: {
      bn: [
        'আধুনিক বিশ্বের চ্যালেঞ্জকে সামনে রেখে জাতীয় উন্নতি ও অগ্রগতির প্রয়াসে একদল মননশীল, নৈতিক মূল্যবোধসম্পন্ন এবং যোগ্য নাগরিক তৈরীর প্রত্যয়ে ২০১০ সালে বনশ্রীতে আমাদের যাত্রা শুরু। সময়ের সাথে তাল মিলিয়ে ইতোমধ্যে সহজবোধ্য ও নান্দনিক পাঠদানের জন্য প্রতিটি শ্রেণিকক্ষে স্মাটবোড, আইআর বোড ও মাল্টিমিডিয়া প্রজেক্টরের ব্যবস্থা করা হয়েছে। শিক্ষার্থীরা অনলাইনে স্কুল ব্যাংকিং, ক্যাম্পাসে নামাজ আদায় করার পাশাপাশি স্কুল ক্যান্টিন, স্টোর ও ভেন্ডিং মেশিনের মাধ্যমে টিফিন ও শিক্ষাসামগ্রী সংগ্রহ করতে পারে। প্রসঙ্গত, বিদ্যালয়ের সাংস্কৃতিক, বিতর্ক, বিজ্ঞান ও গণিত ক্লাব বিভিন্ন TV চ্যানেলসহ স্থানীয় ও জাতীয় পর্যায়ের প্রতিযোগিতায় অংশগ্রহণ এবং অর্জনসমূহ বেশ সুখকর সুখ্যাতি বয়ে আনছে।',
        'আমাদের স্বপ্নের গন্তব্য ও ভবিষ্যতের স্বর্ণশিখরে পৌছাতে সম্মানিত অভিজ্ঞজন, অভিভাবক, সুধী ও সুভানুধ্যায়ীদের আন্তরিক দিকনির্দেশনা ও মূল্যবান পরামর্শ সাদরে প্রশংসিত হবে, ইনশাআল্লাহ।',
      ],
      en: [
        'Keeping the challenges of the modern world in view, and in an effort towards national progress, our journey began in Banasree in 2010 with the resolve to build thoughtful, morally grounded and capable citizens. Keeping pace with the times, every classroom now has a smart board, an IR board and a multimedia projector for clear and engaging teaching. Students can use school banking online and pray on campus, and can buy snacks and school supplies through the school canteen, store and vending machine. The school’s cultural, debate, science and math clubs take part in local and national competitions, including on TV channels, and their achievements are bringing a pleasing reputation.',
        'To reach our dream destination and the golden peaks of the future, the sincere guidance and valuable advice of respected experienced people, guardians, well-wishers and supporters will be warmly welcomed, insha’Allah.',
      ],
    },
    photo: {
      src: 'images/bqes/leaders/headmaster.webp',
      width: 157,
      height: 197,
      alt: { bn: 'প্রধান শিক্ষকের ছবি', en: 'Portrait of the Headmaster' },
    },
  },
];

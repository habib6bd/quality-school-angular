import { Localized } from '../i18n/localized';

export type FaqCategory = 'website' | 'admission' | 'academics' | 'contact';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: Localized;
  answer: Localized;
}

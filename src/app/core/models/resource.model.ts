import { Localized } from '../i18n/localized';

export type ResourceType =
  'class-routine' | 'exam-routine' | 'syllabus' | 'study-material' | 'form' | 'policy';

export interface ResourceFile {
  /** Site-relative path of a file shipped with the site; checked by `safeAttachmentPath`. */
  src: string;
  kind: 'pdf' | 'image';
}

export interface ResourceItem {
  id: string;
  type: ResourceType;
  title: Localized;
  description?: Localized;
  /** Slug of the class it belongs to, when it is class-specific. */
  classSlug?: string;
  subject?: Localized;
  year?: number;
  exam?: Localized;
  /** Missing until the school supplies the file. */
  file?: ResourceFile;
}

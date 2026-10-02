import { Localized } from '../i18n/localized';
import { ImageAsset } from './media.model';

export interface LeaderMessage {
  id: 'chairman' | 'headmaster';
  name: Localized;
  role: Localized;
  /** Paragraphs of the published message. */
  paragraphs: Localized<readonly string[]>;
  photo: ImageAsset;
}

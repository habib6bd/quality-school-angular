import { Localized } from '../i18n/localized';
import type { IconName } from '../../shared/components/icon/icon';

export interface Facility {
  id: string;
  icon: IconName;
  title: Localized;
  description: Localized;
  /** Shown in the homepage "why choose" highlights. */
  highlight: boolean;
}

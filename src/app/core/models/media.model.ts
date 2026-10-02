import { Localized } from '../i18n/localized';

/** An image shipped with the site. Width and height are required so layout never shifts. */
export interface ImageAsset {
  /** Path relative to the site root, e.g. `images/bqes/logo.webp`. */
  src: string;
  width: number;
  height: number;
  alt: Localized;
  /** `true` for stand-in photos that are not from BQES; the UI marks them as demo images. */
  isDemo?: boolean;
}

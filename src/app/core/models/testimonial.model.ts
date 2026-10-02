import { Localized } from '../i18n/localized';

/** A guardian review. Only approved, real reviews may be added; none are published yet. */
export interface Testimonial {
  id: string;
  quote: Localized;
  /** How the guardian wishes to be shown, e.g. "Parent of a Class Five student". */
  attribution: Localized;
}

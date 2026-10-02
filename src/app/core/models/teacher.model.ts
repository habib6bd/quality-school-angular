import { ImageAsset } from './media.model';

export type Designation = 'principal' | 'teacher' | 'staff';

/**
 * A staff member as published by the school. Names are published in English only, so the
 * Bangla pages show the same English name. No contact or private fields are held here.
 */
export interface Teacher {
  slug: string;
  name: string;
  designation: Designation;
  /** Display order from the school's list; `0` means "not ordered". */
  serial: number;
  /** Approved photo; `null` until the school supplies one (the UI shows an initial avatar). */
  photo: ImageAsset | null;
}

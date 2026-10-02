import { ImageLoader } from '@angular/common';
import { IMAGE_VARIANTS } from './image-variants.generated';

/** Path of the `width`-pixel copy of an image (`photo.webp` → `photo-480.webp`). */
export function variantPath(src: string, width: number): string {
  return src.replace(/\.webp$/, `-${width}.webp`);
}

/**
 * Image loader for `NgOptimizedImage`: returns the smaller copy when one exists for the requested
 * width, otherwise the original. Provide it (as `IMAGE_LOADER`) only on components whose images
 * have variants — a loader makes `NgOptimizedImage` build a `srcset` for every image it serves.
 */
export const responsiveLoader: ImageLoader = ({ src, width }) => {
  const widths = IMAGE_VARIANTS[src];
  return width !== undefined && widths?.includes(width) ? variantPath(src, width) : src;
};

/**
 * `ngSrcset` value for an image (`"480w, 960w, 1500w"`): the variants plus the original's own
 * width, or `null` when the image has no variants.
 */
export function srcsetFor(src: string, originalWidth: number): string | null {
  const widths = IMAGE_VARIANTS[src];
  return widths?.length ? [...widths, originalWidth].map((w) => `${w}w`).join(', ') : null;
}

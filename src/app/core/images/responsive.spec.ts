import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { IMAGE_VARIANTS } from './image-variants.generated';
import { responsiveLoader, srcsetFor, variantPath } from './responsive';

const SRC = 'images/bqes/gallery/annual-sports-2.webp';

describe('responsive images', () => {
  it('builds the variant path next to the original', () => {
    expect(variantPath(SRC, 480)).toBe('images/bqes/gallery/annual-sports-2-480.webp');
  });

  it('loader returns the variant for a known width and the original otherwise', () => {
    expect(responsiveLoader({ src: SRC, width: 960 })).toBe(variantPath(SRC, 960));
    expect(responsiveLoader({ src: SRC, width: 1234 })).toBe(SRC);
    expect(responsiveLoader({ src: SRC })).toBe(SRC);
    expect(responsiveLoader({ src: 'images/other.webp', width: 480 })).toBe('images/other.webp');
  });

  it('srcset lists the variants plus the original width, or null without variants', () => {
    expect(srcsetFor(SRC, 1500)).toBe('480w, 960w, 1440w, 1500w');
    expect(srcsetFor('images/other.webp', 800)).toBeNull();
  });

  it('every generated variant file exists in public/', () => {
    for (const [src, widths] of Object.entries(IMAGE_VARIANTS)) {
      expect(existsSync(join('public', src)), src).toBe(true);
      for (const w of widths) {
        expect(existsSync(join('public', variantPath(src, w))), `${src} @${w}`).toBe(true);
      }
    }
  });
});

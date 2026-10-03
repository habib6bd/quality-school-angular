import { loadGsap, prefersReducedMotion } from './gsap';

describe('loadGsap', () => {
  it('loads GSAP once and reuses it', async () => {
    const first = await loadGsap();
    expect(typeof first.to).toBe('function');
    expect(await loadGsap()).toBe(first);
  });
});

describe('prefersReducedMotion', () => {
  const viewWith = (matches: boolean) =>
    ({ matchMedia: (query: string) => ({ matches, media: query }) }) as unknown as Window;

  it('follows the reduced-motion media query', () => {
    expect(prefersReducedMotion(viewWith(true))).toBe(true);
    expect(prefersReducedMotion(viewWith(false))).toBe(false);
  });

  it('is false without a window', () => {
    expect(prefersReducedMotion(null)).toBe(false);
  });
});

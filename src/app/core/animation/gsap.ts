import type { gsap as GsapInstance } from 'gsap';

export type Gsap = typeof GsapInstance;

let loading: Promise<Gsap> | null = null;

/**
 * Loads GSAP on demand. Call it only in the browser (inside `afterNextRender`): the dynamic import
 * keeps GSAP out of the server bundle and out of the initial client bundle.
 */
export function loadGsap(): Promise<Gsap> {
  loading ??= import('gsap').then((module) => module.gsap);
  return loading;
}

/** Whether the visitor asked the system to reduce motion. */
export function prefersReducedMotion(view: Window | null | undefined): boolean {
  return view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

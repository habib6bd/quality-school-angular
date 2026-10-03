import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { loadGsap, prefersReducedMotion } from '../../core/animation/gsap';

/** What is revealed one by one inside a wrapper: grid cells, cards and prose blocks. */
const ITEMS = '.grid > *, .card, .prose-content > *';

/**
 * The elements a reveal wrapper animates: its items (outermost only, and not those of a nested
 * wrapper), or the wrapper itself when it has none.
 */
export function revealTargets(root: HTMLElement): HTMLElement[] {
  const items = Array.from(root.querySelectorAll<HTMLElement>(ITEMS)).filter(
    (el) => el.parentElement?.closest('[data-reveal]') === root,
  );
  const set = new Set(items);
  const outermost = items.filter((el) => {
    for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
      if (set.has(p)) return false;
    }
    return true;
  });
  return outermost.length ? outermost : [root];
}

/**
 * Gentle GSAP fade-up as content scrolls into view, staggered when several items enter
 * together. Put it on a wrapper (section body, page body, footer). Content is never hidden in
 * the server-rendered HTML, items already on screen are left untouched, and nothing moves with
 * reduced motion. Inline styles are cleared once an item has appeared, so hover effects and CSS
 * transitions keep working.
 */
@Directive({ selector: '[appReveal]', host: { 'data-reveal': '' } })
export class RevealDirective {
  constructor() {
    const root = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let destroyed = false;
    let cleanup: (() => void) | undefined;

    afterNextRender(() => {
      const view = root.ownerDocument.defaultView;
      if (!view || !('IntersectionObserver' in view) || prefersReducedMotion(view)) return;

      void loadGsap().then((gsap) => {
        if (destroyed) return;
        // Collected after GSAP has loaded, so content that rendered just after this wrapper counts.
        const targets = revealTargets(root).filter(
          (el) => el.getBoundingClientRect().top >= view.innerHeight,
        );
        if (!targets.length) return;

        gsap.set(targets, { opacity: 0, y: 16, transition: 'none' });
        // An observer (rather than scroll positions) still fires after filters or late content
        // move things around.
        const observer = new view.IntersectionObserver(
          (entries) => {
            const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
            if (!batch.length) return;
            batch.forEach((el) => observer.unobserve(el));
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.08,
              clearProps: 'opacity,transform,transition',
            });
          },
          { rootMargin: '0px 0px -8% 0px' },
        );
        targets.forEach((el) => observer.observe(el));

        cleanup = () => {
          observer.disconnect();
          gsap.killTweensOf(targets);
          gsap.set(targets, { clearProps: 'opacity,transform,transition' });
        };
      });
    });

    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      cleanup?.();
    });
  }
}

import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Subtle fade-up when an element scrolls into view. Content is never hidden in the
 * server-rendered HTML, and elements already on screen are left untouched, so there is
 * no flash for above-the-fold content or for users with reduced motion.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const view = el.ownerDocument.defaultView;
      if (!view || !('IntersectionObserver' in view)) return;
      if (view.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      if (el.getBoundingClientRect().top < view.innerHeight) return;

      el.style.opacity = '0';
      const observer = new view.IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          el.style.opacity = '';
          el.classList.add('animate-fade-up');
          observer.disconnect();
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

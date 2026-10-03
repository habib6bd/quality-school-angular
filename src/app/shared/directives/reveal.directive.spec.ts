import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { loadGsap } from '../../core/animation/gsap';
import { RevealDirective, revealTargets } from './reveal.directive';

@Component({
  imports: [RevealDirective],
  template: `
    <div appReveal id="root">
      <ul class="grid">
        <li class="item">One</li>
        <li class="item">Two</li>
      </ul>
    </div>
  `,
})
class Host {}

function dom(html: string): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-reveal', '');
  root.innerHTML = html;
  return root;
}

describe('revealTargets', () => {
  it('returns grid cells, cards and prose blocks', () => {
    const root = dom(`
      <ul class="grid"><li id="a"></li><li id="b"></li></ul>
      <article class="card" id="c"></article>
      <div class="prose-content"><p id="d"></p></div>
    `);
    expect(revealTargets(root).map((el) => el.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps only the outermost items', () => {
    const root = dom(`<ul class="grid"><li id="a"><div class="card" id="inner"></div></li></ul>`);
    expect(revealTargets(root).map((el) => el.id)).toEqual(['a']);
  });

  it('leaves the items of a nested wrapper to that wrapper', () => {
    const root = dom(`
      <div class="card" id="own"></div>
      <div data-reveal><ul class="grid"><li id="nested"></li></ul></div>
    `);
    expect(revealTargets(root).map((el) => el.id)).toEqual(['own']);
  });

  it('falls back to the wrapper itself', () => {
    const root = dom('<p>Text</p>');
    expect(revealTargets(root)).toEqual([root]);
  });
});

describe('RevealDirective', () => {
  let observed: Element[];
  let notify: ((entries: Partial<IntersectionObserverEntry>[]) => void) | undefined;

  beforeEach(async () => {
    await loadGsap();
    observed = [];
    notify = undefined;
    window.IntersectionObserver = class {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        notify = callback;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  async function render(): Promise<HTMLElement[]> {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    await loadGsap();
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('li'));
  }

  const belowTheFold = () =>
    vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: window.innerHeight + 100 } as DOMRect);

  it('leaves content that is already on screen alone', async () => {
    const items = await render();
    expect(observed).toEqual([]);
    expect(items.every((li) => li.style.opacity === '')).toBe(true);
  });

  it('hides content below the fold until it scrolls in, then clears its inline styles', async () => {
    belowTheFold();
    const items = await render();
    expect(observed).toEqual(items);
    expect(items.map((li) => li.style.opacity)).toEqual(['0', '0']);

    notify!(items.map((target) => ({ target, isIntersecting: true })));
    await vi.waitFor(() => expect(items.every((li) => li.style.opacity === '')).toBe(true), {
      timeout: 3000,
    });
    expect(items.every((li) => li.style.transform === '')).toBe(true);
  });

  it('does nothing when the visitor prefers reduced motion', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
    })) as unknown as typeof window.matchMedia;
    belowTheFold();
    const items = await render();
    expect(observed).toEqual([]);
    expect(items.every((li) => li.style.opacity === '')).toBe(true);
  });
});

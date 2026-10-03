import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../../core/i18n/language.service';
import { GalleryItem } from '../../../core/models/gallery.model';
import { GalleryFeature, GalleryGrid } from './gallery-grid';

const photo = (id: string, isDemo = false): GalleryItem => ({
  id,
  category: 'school-events',
  image: {
    src: `images/test/${id}.webp`,
    width: 800,
    height: 600,
    alt: { bn: `ছবি ${id}`, en: `Photo ${id}` },
    isDemo,
  },
});

const FEATURE: GalleryFeature = {
  eyebrow: 'Explore',
  title: 'Photo Gallery',
  linkLabel: 'View all photos',
  link: ['/en', 'gallery'],
};

function render(items: GalleryItem[], feature?: GalleryFeature) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(LanguageService).setLang('en');
  const fixture = TestBed.createComponent(GalleryGrid);
  fixture.componentRef.setInput('items', items);
  if (feature) fixture.componentRef.setInput('feature', feature);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('GalleryGrid', () => {
  it('renders one labelled button per photo, sized by the mosaic', () => {
    const { el } = render([photo('a'), photo('b'), photo('c')]);
    const buttons = el.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute('aria-label')).toBe('View larger image: Photo a');
    const first = buttons[0].closest('li')!;
    expect(first.className).toContain('lg:col-span-2');
    expect(el.querySelector('[data-feature]')).toBeNull();
  });

  it('leads with the feature card, which takes the wide tile and links onward', () => {
    const { el } = render([photo('a'), photo('b')], FEATURE);
    const card = el.querySelector<HTMLElement>('li[data-feature]')!;
    expect(el.querySelector('ul')!.firstElementChild).toBe(card);
    expect(card.className).toContain('col-span-2');
    expect(card.className).toContain('lg:col-span-2');
    expect(card.textContent).toContain('Explore');
    expect(card.textContent).toContain('Photo Gallery');
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/en/gallery');
    // The photos follow as single-column tiles.
    expect(el.querySelector('button')!.closest('li')!.className).toContain('lg:col-span-1');
  });

  it('emits the index of the chosen photo, not counting the feature card', () => {
    const { fixture, el } = render([photo('a'), photo('b')], FEATURE);
    const chosen: number[] = [];
    fixture.componentInstance.choose.subscribe((i) => chosen.push(i));
    el.querySelectorAll('button')[1].click();
    expect(chosen).toEqual([1]);
  });

  it('marks demo photos', () => {
    const { el } = render([photo('a', true), photo('b')]);
    expect(el.querySelectorAll('app-badge')).toHaveLength(1);
  });
});

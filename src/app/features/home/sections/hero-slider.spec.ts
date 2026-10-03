import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../../../core/i18n/language.service';
import { GalleryItem } from '../../../core/models/gallery.model';
import { HeroSlider } from './hero-slider';

const slides: GalleryItem[] = ['a', 'b', 'c'].map((id) => ({
  id,
  category: 'school-events',
  image: { src: `images/${id}.webp`, width: 800, height: 600, alt: { bn: id, en: `Photo ${id}` } },
}));

async function render() {
  TestBed.inject(LanguageService).setLang('en');
  const fixture = TestBed.createComponent(HeroSlider);
  fixture.componentRef.setInput('slides', slides);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const groups = () => Array.from(el.querySelectorAll<HTMLElement>('[role="group"]'));
  const shown = () => groups().findIndex((g) => !g.hasAttribute('aria-hidden'));
  const button = (label: string) => el.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
  const click = async (label: string) => {
    button(label).click();
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { fixture, el, groups, shown, button, click };
}

describe('HeroSlider', () => {
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('renders every slide but only loads the shown photo and the next one', async () => {
    const { el, groups, shown } = await render();
    expect(groups()).toHaveLength(3);
    expect(groups()[0].getAttribute('aria-label')).toBe('Image 1 of 3');
    expect(shown()).toBe(0);
    expect(Array.from(el.querySelectorAll('img')).map((img) => img.alt)).toEqual([
      'Photo a',
      'Photo b',
    ]);
  });

  it('keeps hidden slides out of the accessibility tree and tab order', async () => {
    const { groups } = await render();
    const [first, second] = groups();
    expect(first.hasAttribute('inert')).toBe(false);
    expect(second.getAttribute('aria-hidden')).toBe('true');
    expect(second.hasAttribute('inert')).toBe(true);
  });

  it('moves with next and previous, wrapping around at both ends', async () => {
    const { shown, click } = await render();
    await click('Previous');
    expect(shown()).toBe(2);
    await click('Next');
    expect(shown()).toBe(0);
    await click('Next');
    expect(shown()).toBe(1);
  });

  it('jumps to a photo from its dot and marks the dot as current', async () => {
    const { el, shown, button, click } = await render();
    await click('Show image 3');
    expect(shown()).toBe(2);
    expect(button('Show image 3').getAttribute('aria-current')).toBe('true');
    expect(button('Show image 1').hasAttribute('aria-current')).toBe(false);
    expect(el.querySelectorAll('img')).toHaveLength(3);
  });

  it('follows the arrow keys', async () => {
    const { fixture, el, shown } = await render();
    const region = el.querySelector('[role="region"]')!;
    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(shown()).toBe(1);
    region.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(shown()).toBe(0);
  });

  it('toggles autoplay with the pause button', async () => {
    const { button, click } = await render();
    expect(button('Pause')).not.toBeNull();
    await click('Pause');
    expect(button('Play')).not.toBeNull();
    await click('Play');
    expect(button('Pause')).not.toBeNull();
  });

  it('does not autoplay when the visitor prefers reduced motion', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
    })) as unknown as typeof window.matchMedia;
    const { button } = await render();
    expect(button('Play')).not.toBeNull();
    expect(button('Pause')).toBeNull();
  });

  it('shows no controls for a single photo', async () => {
    TestBed.inject(LanguageService).setLang('en');
    const fixture = TestBed.createComponent(HeroSlider);
    fixture.componentRef.setInput('slides', slides.slice(0, 1));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('button')).toHaveLength(0);
  });
});

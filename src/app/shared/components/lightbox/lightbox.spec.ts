import { TestBed } from '@angular/core/testing';
import { Lightbox } from './lightbox';

describe('Lightbox', () => {
  const images = [
    { src: 'a.jpg', alt: 'A' },
    { src: 'b.jpg', alt: 'B', caption: 'Bee' },
    { src: 'c.jpg', alt: 'C' },
  ];

  function render(index: number | null) {
    const fixture = TestBed.createComponent(Lightbox);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('index', index);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the selected image with its position', () => {
    const el: HTMLElement = render(1).nativeElement;
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('B');
    expect(el.querySelector('[aria-live]')?.textContent?.trim()).toBe('ছবি 2 / 3');
  });

  it('wraps around with next/previous', () => {
    const fixture = render(2);
    fixture.componentInstance.step(1);
    expect(fixture.componentInstance.index()).toBe(0);
    fixture.componentInstance.step(-1);
    expect(fixture.componentInstance.index()).toBe(2);
  });

  it('responds to arrow keys only while open', () => {
    const fixture = render(0);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(fixture.componentInstance.index()).toBe(1);
    fixture.componentRef.setInput('index', null);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(fixture.componentInstance.index()).toBeNull();
  });
});

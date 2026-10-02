import { TestBed } from '@angular/core/testing';
import { Avatar, initialOf } from './avatar';

describe('initialOf', () => {
  it('uses the first letter, upper-cased, skipping punctuation', () => {
    expect(initialOf('salma alam sonia')).toBe('S');
    expect(initialOf('  "Md. Ibrahim')).toBe('M');
    expect(initialOf('কবির আহমদ')).toBe('ক');
  });

  it('falls back to a question mark when there is no letter', () => {
    expect(initialOf('123')).toBe('?');
    expect(initialOf('')).toBe('?');
  });
});

describe('Avatar', () => {
  it('is decorative and shows the initial', () => {
    const fixture = TestBed.createComponent(Avatar);
    fixture.componentRef.setInput('name', 'Latifa Akter Rina');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('L');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('gives the same person the same colour every time', () => {
    const colour = (name: string) => {
      const fixture = TestBed.createComponent(Avatar);
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).className;
    };
    expect(colour('Nasrin Akter')).toBe(colour('Nasrin Akter'));
  });
});

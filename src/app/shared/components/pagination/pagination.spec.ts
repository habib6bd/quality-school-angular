import { TestBed } from '@angular/core/testing';
import { Pagination, pageSlots } from './pagination';

describe('pageSlots', () => {
  it('shows every page when there are few', () => {
    expect(pageSlots(2, 3)).toEqual([1, 2, 3]);
  });

  it('collapses distant ranges into gaps', () => {
    expect(pageSlots(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
    expect(pageSlots(1, 10)).toEqual([1, 2, 'gap', 10]);
  });

  it('returns nothing for zero pages', () => {
    expect(pageSlots(1, 0)).toEqual([]);
  });
});

describe('Pagination', () => {
  function render(page: number, total: number) {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', total);
    fixture.detectChanges();
    return fixture;
  }

  it('renders nothing for a single page', () => {
    expect(render(1, 1).nativeElement.querySelector('nav')).toBeNull();
  });

  it('marks the current page and disables Previous on the first page', () => {
    const el: HTMLElement = render(1, 3).nativeElement;
    const buttons = el.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true);
    expect(el.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('1');
  });

  it('moves to the clicked page and clamps out-of-range requests', () => {
    const fixture = render(2, 3);
    const component = fixture.componentInstance;
    const pageButtons = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      'button[aria-label]',
    );
    pageButtons[2].click();
    expect(component.page()).toBe(3);
    component.go(99);
    expect(component.page()).toBe(3);
  });
});

import { TestBed } from '@angular/core/testing';
import { Tabs } from './tabs';

describe('Tabs', () => {
  function render() {
    const fixture = TestBed.createComponent(Tabs);
    fixture.componentRef.setInput('tabs', [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ]);
    fixture.componentRef.setInput('label', 'Example');
    fixture.componentRef.setInput('selected', 'one');
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const tabs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    return { fixture, tabs };
  }

  it('uses roving tabindex and aria-selected', () => {
    const { tabs } = render();
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('activates tabs on click', () => {
    const { fixture, tabs } = render();
    tabs[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('three');
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
  });

  it('moves selection and focus with arrow keys, wrapping around', () => {
    const { fixture, tabs } = render();
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('three');
    expect(document.activeElement).toBe(tabs[2]);
    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('one');
  });
});

import { TestBed } from '@angular/core/testing';
import { Accordion } from './accordion';

describe('Accordion', () => {
  const items = [
    { id: 'a', title: 'First', content: 'One' },
    { id: 'b', title: 'Second', content: 'Two' },
    { id: 'c', title: 'Third', content: 'Three' },
  ];

  function render(multiple = false) {
    const fixture = TestBed.createComponent(Accordion);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('multiple', multiple);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const el = fixture.nativeElement as HTMLElement;
    const triggers = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[role="region"]'));
    return { fixture, triggers, panels };
  }

  it('starts collapsed with correct ARIA wiring', () => {
    const { triggers, panels } = render();
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(triggers[0].id);
    expect(panels[0].hidden).toBe(true);
  });

  it('opens one panel at a time by default', () => {
    const { fixture, triggers, panels } = render();
    triggers[0].click();
    fixture.detectChanges();
    expect(panels[0].hidden).toBe(false);
    triggers[1].click();
    fixture.detectChanges();
    expect(panels[0].hidden).toBe(true);
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('allows several open panels in multiple mode', () => {
    const { fixture, triggers, panels } = render(true);
    triggers[0].click();
    triggers[1].click();
    fixture.detectChanges();
    expect(panels.filter((p) => !p.hidden).length).toBe(2);
  });

  it('moves focus between headers with arrow, Home and End keys', () => {
    const { triggers } = render();
    triggers[0].focus();
    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);
    triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(triggers[2]);
    triggers[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(triggers[0]);
  });
});

import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

describe('Modal', () => {
  function render() {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('title', 'Details');
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    return { fixture, dialog };
  }

  it('is labelled by its title', () => {
    const { dialog } = render();
    const titleId = dialog.getAttribute('aria-labelledby')!;
    expect(document.getElementById(titleId)?.textContent?.trim()).toBe('Details');
  });

  it('opens, locks page scroll, and closes from the close button', () => {
    const { fixture, dialog } = render();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(document.documentElement.classList.contains('overflow-hidden')).toBe(true);

    dialog.querySelector<HTMLButtonElement>('button[aria-label]')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(document.documentElement.classList.contains('overflow-hidden')).toBe(false);
  });

  it('returns focus to the element that opened it', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { fixture } = render();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    fixture.componentInstance.close();
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
  });
});

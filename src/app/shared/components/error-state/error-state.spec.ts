import { TestBed } from '@angular/core/testing';
import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('announces itself and emits retry', () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    el.querySelector('button')!.click();
    expect(retried).toBe(true);
  });
});

describe('EmptyState', () => {
  it('uses translated defaults when no text is given', () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('কিছু পাওয়া যায়নি');
  });
});

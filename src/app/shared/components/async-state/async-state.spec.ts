import { ResourceStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AsyncState } from './async-state';

function render(status: ResourceStatus, empty = false) {
  const fixture = TestBed.createComponent(AsyncState);
  fixture.componentRef.setInput('status', status);
  fixture.componentRef.setInput('empty', empty);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('AsyncState', () => {
  it('shows a skeleton that announces loading', () => {
    const { el } = render('loading');
    expect(el.querySelector('app-skeleton [role="status"]')).not.toBeNull();
    expect(el.textContent).toContain('লোড হচ্ছে');
  });

  it('shows an alert with a retry button on error', () => {
    const { fixture, el } = render('error');
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    el.querySelector('button')!.click();
    expect(retried).toBe(true);
  });

  it('shows the empty state with custom text when resolved but empty', () => {
    const { fixture, el } = render('resolved', true);
    fixture.componentRef.setInput('emptyTitle', 'Nothing here');
    fixture.detectChanges();
    expect(el.textContent).toContain('Nothing here');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it.each<ResourceStatus>(['resolved', 'local', 'reloading'])(
    'keeps content visible while %s',
    (status) => {
      const { el } = render(status);
      expect(el.querySelector('app-skeleton')).toBeNull();
      expect(el.querySelector('app-empty-state')).toBeNull();
      expect(el.querySelector('app-error-state')).toBeNull();
    },
  );
});

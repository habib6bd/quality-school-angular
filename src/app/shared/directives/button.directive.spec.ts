import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonDirective, ButtonVariant } from './button.directive';

@Component({
  imports: [ButtonDirective],
  template: `<button appButton class="extra" [variant]="variant()" size="lg">Go</button>`,
})
class Host {
  readonly variant = signal<ButtonVariant>('primary');
}

describe('ButtonDirective', () => {
  it('applies variant and size classes while keeping static classes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.classList).toContain('extra');
    expect(button.classList).toContain('bg-primary-700');
    expect(button.classList).toContain('min-h-12');

    fixture.componentInstance.variant.set('outline');
    fixture.detectChanges();
    expect(button.classList).not.toContain('bg-primary-700');
    expect(button.classList).toContain('border-primary-700');
    expect(button.classList).toContain('extra');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { DesktopNav } from './desktop-nav';
import { Header } from './header';

describe('Header', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('shows the school name in the active language', () => {
    TestBed.inject(LanguageService).setLang('en');
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Banasree Quality Education School',
    );
  });

  it('opens the mobile menu from the menu button', () => {
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('app-mobile-menu dialog')?.hasAttribute('open')).toBe(true);
  });
});

describe('DesktopNav', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('toggles dropdowns and closes them with Escape, returning focus', () => {
    const fixture = TestBed.createComponent(DesktopNav);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>('[data-nav-trigger]')!;
    const submenu = document.getElementById(trigger.getAttribute('aria-controls')!)!;

    expect(submenu.hidden).toBe(true);
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(submenu.hidden).toBe(false);

    submenu.querySelector('a')!.focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(submenu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes an open dropdown when clicking elsewhere', () => {
    const fixture = TestBed.createComponent(DesktopNav);
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[data-nav-trigger]',
    )!;
    trigger.click();
    fixture.detectChanges();
    document.body.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});

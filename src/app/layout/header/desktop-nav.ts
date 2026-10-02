import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { MAIN_NAV, navCommands, NavItem } from '../../core/config/navigation';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon } from '../../shared/components/icon/icon';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Desktop menubar with disclosure dropdowns (button + list of links). */
@Component({
  selector: 'app-desktop-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, TranslatePipe],
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'closeAndFocus()',
  },
  template: `
    <nav [attr.aria-label]="'common.mainNavigation' | t">
      <ul class="flex items-center gap-0.5">
        @for (item of items; track item.labelKey; let i = $index) {
          <li class="relative" (focusout)="onFocusOut($event, i)">
            @if (item.children) {
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[0.95rem] font-medium whitespace-nowrap transition-colors hover:bg-primary-50 hover:text-primary-800"
                [class.text-primary-700]="isSectionActive(item)"
                [attr.aria-expanded]="openIndex() === i"
                [attr.aria-controls]="'nav-sub-' + i"
                [attr.data-nav-trigger]="i"
                (click)="toggle(i)"
              >
                {{ item.labelKey | t }}
                <app-icon
                  name="chevronDown"
                  [size]="16"
                  class="transition-transform"
                  [class.rotate-180]="openIndex() === i"
                />
              </button>
              <ul
                [id]="'nav-sub-' + i"
                [hidden]="openIndex() !== i"
                class="absolute top-full left-0 z-50 mt-2 min-w-60 rounded-xl border border-stone-200 bg-white p-2 shadow-xl"
              >
                @for (child of item.children; track child.path) {
                  <li>
                    <a
                      [routerLink]="link(child.path)"
                      routerLinkActive="bg-primary-50 text-primary-800"
                      [routerLinkActiveOptions]="{ exact: true }"
                      ariaCurrentWhenActive="page"
                      class="block rounded-lg px-3 py-2 text-[0.95rem] hover:bg-primary-50 hover:text-primary-800"
                      >{{ child.labelKey | t }}</a
                    >
                  </li>
                }
              </ul>
            } @else {
              <a
                [routerLink]="link(item.path)"
                routerLinkActive="text-primary-700"
                [routerLinkActiveOptions]="{ exact: item.path === '' }"
                ariaCurrentWhenActive="page"
                class="block rounded-lg px-3 py-2 text-[0.95rem] font-medium whitespace-nowrap transition-colors hover:bg-primary-50 hover:text-primary-800"
                >{{ item.labelKey | t }}</a
              >
            }
          </li>
        }
      </ul>
    </nav>
  `,
})
export class DesktopNav {
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly language = inject(LanguageService);

  protected readonly items = MAIN_NAV;
  protected readonly openIndex = signal<number | null>(null);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  private readonly lang = this.language.lang;

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.openIndex.set(null));
  }

  protected link(path: string): string[] {
    return navCommands(this.lang(), path);
  }

  protected isSectionActive(item: NavItem): boolean {
    const path = this.url().split(/[?#]/)[0];
    return (item.children ?? []).some((child) => {
      const target = '/' + navCommands(this.lang(), child.path).slice(1).join('/');
      return path === target || path.startsWith(target + '/');
    });
  }

  protected toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }

  protected closeAndFocus(): void {
    const index = this.openIndex();
    if (index === null) return;
    this.openIndex.set(null);
    this.host.nativeElement.querySelector<HTMLElement>(`[data-nav-trigger="${index}"]`)?.focus();
  }

  protected onFocusOut(event: FocusEvent, index: number): void {
    const next = event.relatedTarget as Node | null;
    const item = event.currentTarget as HTMLElement;
    if (this.openIndex() === index && next && !item.contains(next)) this.openIndex.set(null);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.openIndex() === null) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.openIndex.set(null);
  }
}

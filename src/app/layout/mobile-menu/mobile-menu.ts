import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { MAIN_NAV, navCommands } from '../../core/config/navigation';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon } from '../../shared/components/icon/icon';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { Modal } from '../../shared/components/modal/modal';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Off-canvas navigation for small screens, built on the accessible modal. */
@Component({
  selector: 'app-mobile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal, RouterLink, RouterLinkActive, Icon, LanguageSwitcher, TranslatePipe],
  template: `
    <app-modal [(open)]="open" [title]="'common.menu' | t" placement="end">
      <nav [attr.aria-label]="'common.mainNavigation' | t">
        <ul class="space-y-1">
          @for (item of items; track item.labelKey; let i = $index) {
            <li>
              @if (item.children) {
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-medium hover:bg-primary-50"
                  [attr.aria-expanded]="expanded() === i"
                  [attr.aria-controls]="'mobile-sub-' + i"
                  (click)="expanded.set(expanded() === i ? null : i)"
                >
                  {{ item.labelKey | t }}
                  <app-icon
                    name="chevronDown"
                    class="transition-transform"
                    [class.rotate-180]="expanded() === i"
                  />
                </button>
                <ul
                  [id]="'mobile-sub-' + i"
                  [hidden]="expanded() !== i"
                  class="mb-2 ml-3 border-l-2 border-primary-100 pl-2"
                >
                  @for (child of item.children; track child.path) {
                    <li>
                      <a
                        [routerLink]="link(child.path)"
                        routerLinkActive="bg-primary-50 text-primary-800"
                        [routerLinkActiveOptions]="{ exact: true }"
                        ariaCurrentWhenActive="page"
                        class="block rounded-lg px-3 py-2.5 hover:bg-primary-50"
                        >{{ child.labelKey | t }}</a
                      >
                    </li>
                  }
                </ul>
              } @else {
                <a
                  [routerLink]="link(item.path)"
                  routerLinkActive="bg-primary-50 text-primary-800"
                  [routerLinkActiveOptions]="{ exact: true }"
                  ariaCurrentWhenActive="page"
                  class="block rounded-lg px-3 py-3 font-medium hover:bg-primary-50"
                  >{{ item.labelKey | t }}</a
                >
              }
            </li>
          }
          <li>
            <a
              [routerLink]="link('search')"
              class="flex items-center gap-2 rounded-lg px-3 py-3 font-medium hover:bg-primary-50"
            >
              <app-icon name="search" />
              {{ 'nav.search' | t }}
            </a>
          </li>
        </ul>
      </nav>
      <div class="mt-6 border-t border-stone-200 pt-6">
        <p class="mb-2 text-sm text-ink-muted">{{ 'common.language' | t }}</p>
        <app-language-switcher />
      </div>
    </app-modal>
  `,
})
export class MobileMenu {
  private readonly language = inject(LanguageService);

  readonly open = model(false);
  protected readonly items = MAIN_NAV;
  protected readonly expanded = signal<number | null>(null);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.open.set(false));
  }

  protected link(path: string): string[] {
    return navCommands(this.language.lang(), path);
  }
}

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { navCommands } from '../../core/config/navigation';
import { LanguageService } from '../../core/i18n/language.service';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { Icon } from '../../shared/components/icon/icon';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { DesktopNav } from './desktop-nav';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgOptimizedImage,
    Icon,
    LanguageSwitcher,
    DesktopNav,
    MobileMenu,
    TranslatePipe,
    LocalizePipe,
  ],
  host: { class: 'sticky top-0 z-30 block' },
  template: `
    <header>
      <!-- Utility bar -->
      <div class="bg-secondary-950 text-white">
        <div class="container-page flex min-h-11 items-center justify-between gap-3 text-sm">
          <ul class="hidden items-center gap-1 sm:flex">
            @for (social of info().social; track social.url) {
              <li>
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="grid size-8 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
                >
                  <app-icon [name]="social.network" [size]="16" />
                  <span class="sr-only"
                    >{{ social.network === 'facebook' ? 'Facebook' : 'YouTube' }}
                    {{ 'common.externalLink' | t }}</span
                  >
                </a>
              </li>
            }
          </ul>
          <div class="ml-auto flex items-center gap-2">
            <a
              [routerLink]="link('search')"
              class="grid size-9 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
              [attr.aria-label]="'nav.search' | t"
            >
              <app-icon name="search" [size]="18" />
            </a>
            <app-language-switcher [inverse]="true" />
          </div>
        </div>
      </div>

      <!-- Brand + navigation -->
      <div
        class="border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
      >
        <div class="container-page flex min-h-18 items-center justify-between gap-4 py-2">
          <a [routerLink]="link('')" class="flex min-w-0 items-center gap-3">
            <img
              [ngSrc]="info().logo.src"
              width="52"
              height="52"
              priority
              alt=""
              class="size-11 shrink-0 rounded-full bg-white sm:size-13"
            />
            <span class="min-w-0">
              <span
                class="line-clamp-2 font-display text-[0.95rem] leading-tight font-bold text-primary-800 sm:text-lg"
              >
                {{ info().name | localize }}
              </span>
              <span class="block text-xs text-ink-muted sm:text-sm">
                {{ 'common.tagline' | t }}
              </span>
            </span>
          </a>
          <div class="hidden xl:block">
            <app-desktop-nav />
          </div>
          <button
            type="button"
            class="grid size-11 shrink-0 place-items-center rounded-lg text-primary-800 hover:bg-primary-50 xl:hidden"
            [attr.aria-label]="'common.openMenu' | t"
            aria-haspopup="dialog"
            [attr.aria-expanded]="menuOpen()"
            (click)="menuOpen.set(true)"
          >
            <app-icon name="menu" [size]="26" />
          </button>
        </div>
      </div>
    </header>
    <app-mobile-menu [(open)]="menuOpen" />
  `,
})
export class Header {
  private readonly language = inject(LanguageService);

  protected readonly info = inject(SchoolInfoService).info;
  protected readonly lang = this.language.lang;
  protected readonly menuOpen = signal(false);

  protected link(path: string): string[] {
    return navCommands(this.lang(), path);
  }
}

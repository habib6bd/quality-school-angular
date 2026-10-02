import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FOOTER_QUICK_LINKS, navCommands } from '../../core/config/navigation';
import { LanguageService } from '../../core/i18n/language.service';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { Icon } from '../../shared/components/icon/icon';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, Icon, TranslatePipe, LocalizePipe, LocaleNumberPipe],
  template: `
    <footer class="bg-secondary-950 text-secondary-100">
      <div
        aria-hidden="true"
        class="h-1 bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-600"
      ></div>
      <div
        class="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]"
      >
        <section>
          <div class="flex items-center gap-3">
            <img
              [ngSrc]="info().logo.src"
              width="56"
              height="56"
              alt=""
              class="size-14 rounded-full bg-white"
            />
            <p class="font-display text-lg leading-snug font-semibold text-white">
              {{ info().name | localize }}
            </p>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-secondary-200">{{ 'footer.about' | t }}</p>
          <h2 class="mt-6 text-sm font-semibold text-white">{{ 'footer.followUs' | t }}</h2>
          <ul class="mt-3 flex gap-2">
            @for (social of info().social; track social.url) {
              <li>
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary-600"
                >
                  <app-icon [name]="social.network" [size]="18" />
                  <span class="sr-only"
                    >{{ social.network === 'facebook' ? 'Facebook' : 'YouTube' }}
                    {{ 'common.externalLink' | t }}</span
                  >
                </a>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="text-base font-semibold text-white">{{ 'footer.quickLinks' | t }}</h2>
          <ul class="mt-4 space-y-2 text-sm">
            @for (item of quickLinks; track item.path) {
              <li>
                <a
                  [routerLink]="link(item.path)"
                  class="text-secondary-200 hover:text-white hover:underline"
                  >{{ item.labelKey | t }}</a
                >
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="text-base font-semibold text-white">{{ 'footer.importantLinks' | t }}</h2>
          <ul class="mt-4 space-y-2 text-sm">
            @for (item of info().importantLinks; track item.url) {
              <li>
                <a
                  [href]="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-secondary-200 hover:text-white hover:underline"
                >
                  {{ item.label | localize }}
                  <app-icon name="external" [size]="12" />
                  <span class="sr-only">{{ 'common.externalLink' | t }}</span>
                </a>
              </li>
            }
          </ul>
        </section>

        <section>
          <h2 class="text-base font-semibold text-white">{{ 'footer.contact' | t }}</h2>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex gap-3">
              <dt>
                <app-icon name="mapPin" [size]="18" class="mt-0.5 text-accent-400" /><span
                  class="sr-only"
                  >{{ 'footer.address' | t }}</span
                >
              </dt>
              <dd class="text-secondary-200">
                @if (info().address; as address) {
                  {{ address | localize }}
                } @else {
                  <span class="text-secondary-300"
                    >{{ 'footer.address' | t }}: {{ 'common.toBeConfirmed' | t }}</span
                  >
                }
              </dd>
            </div>
            <div class="flex gap-3">
              <dt>
                <app-icon name="phone" [size]="18" class="mt-0.5 text-accent-400" /><span
                  class="sr-only"
                  >{{ 'footer.phone' | t }}</span
                >
              </dt>
              <dd class="text-secondary-200">
                @for (phone of info().phones; track phone) {
                  <a [href]="'tel:' + phone" class="block hover:text-white">{{ phone }}</a>
                } @empty {
                  <span class="text-secondary-300"
                    >{{ 'footer.phone' | t }}: {{ 'common.toBeConfirmed' | t }}</span
                  >
                }
              </dd>
            </div>
            <div class="flex gap-3">
              <dt>
                <app-icon name="mail" [size]="18" class="mt-0.5 text-accent-400" /><span
                  class="sr-only"
                  >{{ 'footer.email' | t }}</span
                >
              </dt>
              <dd class="text-secondary-200">
                @for (email of info().emails; track email) {
                  <a [href]="'mailto:' + email" class="block break-all hover:text-white">{{
                    email
                  }}</a>
                } @empty {
                  <span class="text-secondary-300"
                    >{{ 'footer.email' | t }}: {{ 'common.toBeConfirmed' | t }}</span
                  >
                }
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <div class="border-t border-white/10">
        <p class="container-page py-5 text-center text-xs text-secondary-300 sm:text-sm">
          © {{ year | localeNumber: false }} {{ info().name | localize }} ·
          {{ 'footer.rights' | t }}
        </p>
      </div>
    </footer>
  `,
})
export class Footer {
  private readonly language = inject(LanguageService);

  protected readonly info = inject(SchoolInfoService).info;
  protected readonly quickLinks = FOOTER_QUICK_LINKS;
  protected readonly year = new Date().getFullYear();

  protected link(path: string): string[] {
    return navCommands(this.language.lang(), path);
  }
}

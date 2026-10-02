import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { Lang, SUPPORTED_LANGS } from '../../../core/i18n/lang';
import { LanguageService } from '../../../core/i18n/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

const LABELS: Record<Lang, string> = { bn: 'বাংলা', en: 'English' };

/** Replaces (or adds) the language prefix of a URL, keeping path, query and fragment. */
export function swapLangInUrl(url: string, lang: Lang): string {
  const match = /^\/(bn|en)(?=[/?#]|$)/.exec(url);
  if (match) return `/${lang}${url.slice(match[0].length)}`;
  return `/${lang}`;
}

@Component({
  selector: 'app-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <nav [attr.aria-label]="'common.switchLanguage' | t">
      <ul
        class="flex items-center rounded-full p-0.5 text-sm font-semibold"
        [class]="inverse() ? 'bg-white/15' : 'bg-stone-100'"
      >
        @for (option of options(); track option.lang) {
          <li>
            <a
              [routerLink]="option.url"
              [attr.lang]="option.lang"
              [attr.hreflang]="option.lang"
              [attr.aria-current]="option.active ? 'true' : null"
              class="block rounded-full px-3 py-1.5 transition-colors"
              [class]="
                option.active
                  ? 'bg-primary-700 text-white'
                  : inverse()
                    ? 'text-white hover:bg-white/15'
                    : 'text-ink-muted hover:text-primary-700'
              "
              >{{ option.label }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
})
export class LanguageSwitcher {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  readonly inverse = input(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly options = computed(() =>
    SUPPORTED_LANGS.map((lang) => ({
      lang,
      label: LABELS[lang],
      active: lang === this.language.lang(),
      url: this.router.parseUrl(swapLangInUrl(this.url(), lang)),
    })),
  );
}

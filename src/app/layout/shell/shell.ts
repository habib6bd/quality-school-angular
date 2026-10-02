import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { DEFAULT_LANG, isLang, Lang } from '../../core/i18n/lang';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

/** Page chrome shared by every route: skip link, header, main landmark and footer. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <a class="skip-link" href="#main-content">{{
      lang() === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'
    }}</a>
    <div class="flex min-h-dvh flex-col">
      <app-header [lang]="lang()" />
      <main id="main-content" tabindex="-1" class="flex-1 focus:outline-none">
        <router-outlet />
      </main>
      <app-footer [lang]="lang()" />
    </div>
  `,
})
export class Shell {
  private readonly document = inject(DOCUMENT);
  private readonly routeData = toSignal(inject(ActivatedRoute).data.pipe(map((d) => d['lang'])));

  protected readonly lang = computed<Lang>(() => {
    const value = this.routeData();
    return isLang(value) ? value : DEFAULT_LANG;
  });

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.lang();
    });
  }
}

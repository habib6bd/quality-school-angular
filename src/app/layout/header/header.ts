import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Lang } from '../../core/i18n/lang';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="border-b border-stone-200 bg-white">
      <div class="container-page flex h-16 items-center justify-between gap-4">
        <a [routerLink]="['/', lang()]" class="font-display text-lg font-semibold text-primary-700">
          {{
            lang() === 'bn' ? 'বনশ্রী কোয়ালিটি এডুকেশন স্কুল' : 'Banasree Quality Education School'
          }}
        </a>
        <nav aria-label="Language">
          <a routerLink="/bn" class="px-2 hover:underline" hreflang="bn" lang="bn">বাংলা</a>
          <span aria-hidden="true" class="text-stone-400">|</span>
          <a routerLink="/en" class="px-2 hover:underline" hreflang="en" lang="en">English</a>
        </nav>
      </div>
    </header>
  `,
})
export class Header {
  readonly lang = input.required<Lang>();
}

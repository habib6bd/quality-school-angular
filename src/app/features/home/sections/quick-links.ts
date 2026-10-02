import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationKey } from '../../../core/i18n/translation.service';
import { Icon, IconName } from '../../../shared/components/icon/icon';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface QuickLink {
  path: string;
  labelKey: TranslationKey;
  icon: IconName;
}

const QUICK_LINKS: readonly QuickLink[] = [
  { path: 'admission', labelKey: 'nav.admissionInfo', icon: 'graduation' },
  { path: 'notices', labelKey: 'nav.notices', icon: 'bell' },
  { path: 'results', labelKey: 'nav.results', icon: 'award' },
  { path: 'teachers', labelKey: 'nav.teachers', icon: 'users' },
  { path: 'academics/calendar', labelKey: 'nav.calendar', icon: 'calendar' },
  { path: 'gallery', labelKey: 'nav.gallery', icon: 'image' },
  { path: 'faq', labelKey: 'nav.faq', icon: 'info' },
  { path: 'contact', labelKey: 'nav.contact', icon: 'phone' },
];

@Component({
  selector: 'app-home-quick-links',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, PagePathPipe, TranslatePipe],
  template: `
    <nav class="bg-white py-8 shadow-sm" [attr.aria-label]="'home.quickLinks' | t">
      <div class="container-page">
        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          @for (item of links; track item.path) {
            <li>
              <a
                [routerLink]="item.path | pagePath"
                class="flex h-full flex-col items-center gap-2 rounded-xl border border-stone-200 bg-surface-muted px-2 py-4 text-center text-sm font-semibold text-secondary-950 transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50"
              >
                <span
                  class="grid size-11 place-items-center rounded-full bg-primary-100 text-primary-800"
                >
                  <app-icon [name]="item.icon" [size]="22" />
                </span>
                {{ item.labelKey | t }}
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
})
export class HomeQuickLinks {
  protected readonly links = QUICK_LINKS;
}

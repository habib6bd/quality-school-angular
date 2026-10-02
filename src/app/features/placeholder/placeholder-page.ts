import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { navCommands } from '../../core/config/navigation';
import { findPage, PAGES } from '../../core/config/pages';
import { LanguageService } from '../../core/i18n/language.service';
import { TranslationService } from '../../core/i18n/translation.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/**
 * Temporary page for sections whose content is built in later phases. It is honest
 * about missing content instead of showing invented information.
 */
@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, EmptyState, RouterLink, TranslatePipe],
  template: `
    <app-page-header [title]="title()" [breadcrumbs]="breadcrumbs()" />
    <div class="container-page section">
      <app-empty-state
        icon="info"
        [title]="'page.preparingTitle' | t"
        [message]="'page.preparingMessage' | t"
      />
      @if (siblings().length) {
        <nav class="mt-10" [attr.aria-label]="'page.related' | t">
          <h2 class="text-xl">{{ 'page.related' | t }}</h2>
          <ul class="mt-4 flex flex-wrap gap-2">
            @for (page of siblings(); track page.path) {
              <li>
                <a
                  [routerLink]="link(page.path)"
                  class="inline-block rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50"
                  >{{ page.titleKey | t }}</a
                >
              </li>
            }
          </ul>
        </nav>
      }
    </div>
  `,
})
export class PlaceholderPage {
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService);
  private readonly crumbs = inject(BreadcrumbService);

  /** Bound from route data via `withComponentInputBinding`. */
  readonly page = input.required<string>();

  private readonly def = computed(() => findPage(this.page()));
  protected readonly title = computed(() => {
    const def = this.def();
    return def ? this.i18n.t(def.titleKey) : '';
  });
  protected readonly breadcrumbs = computed(() => this.crumbs.forPage(this.page()));
  protected readonly siblings = computed(() => {
    const def = this.def();
    const group = def?.parent ?? def?.path;
    return PAGES.filter(
      (p) => p.path !== this.page() && p.path !== '' && (p.parent === group || p.path === group),
    );
  });

  protected link(path: string): string[] {
    return navCommands(this.language.lang(), path);
  }
}

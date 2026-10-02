import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findPage, PageDef } from '../../../core/config/pages';
import { PagePathPipe } from '../../pipes/page-path.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

/** Cards linking to related registered pages, with the page's own description as the blurb. */
@Component({
  selector: 'app-related-links',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, PagePathPipe, TranslatePipe],
  template: `
    <nav [attr.aria-labelledby]="headingId">
      <h2 [id]="headingId" class="text-xl sm:text-2xl">{{ 'page.related' | t }}</h2>
      <ul class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (page of pages(); track page.path) {
          <li class="relative card card-interactive p-5">
            <h3 class="text-lg">
              <a
                [routerLink]="page.path | pagePath"
                class="after:absolute after:inset-0 hover:text-primary-700"
                >{{ page.titleKey | t }}</a
              >
            </h3>
            <p class="mt-1 text-sm text-ink-muted">{{ page.descriptionKey | t }}</p>
            <app-icon name="arrowRight" [size]="18" class="mt-3 text-primary-700" />
          </li>
        }
      </ul>
    </nav>
  `,
})
export class RelatedLinks {
  /** Paths of registered pages to link to. */
  readonly paths = input.required<readonly string[]>();

  protected readonly headingId = 'related-links-title';
  protected readonly pages = computed(() =>
    this.paths()
      .map((path) => findPage(path))
      .filter((page): page is PageDef => page !== undefined),
  );
}

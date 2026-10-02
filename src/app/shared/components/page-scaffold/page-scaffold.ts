import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { findPage } from '../../../core/config/pages';
import { TranslationService } from '../../../core/i18n/translation.service';
import { SeoService } from '../../../core/seo/seo.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { PageHeader } from '../page-header/page-header';

/**
 * The frame every inner page shares: title banner with breadcrumbs, then a padded content
 * container. Pass `page` (a path from the page registry); detail pages also pass `detailTitle`,
 * which becomes the heading, the last breadcrumb and the document title.
 */
@Component({
  selector: 'app-page-scaffold',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader],
  template: `
    <app-page-header [title]="heading()" [intro]="intro()" [breadcrumbs]="breadcrumbs()" />
    <div class="container-page section"><ng-content /></div>
  `,
})
export class PageScaffold {
  private readonly i18n = inject(TranslationService);
  private readonly crumbs = inject(BreadcrumbService);
  private readonly seo = inject(SeoService);

  /** Path of a registered page, e.g. `about/history`. */
  readonly page = input.required<string>();
  readonly intro = input<string>();
  /** Title of the item shown on a detail page (class, teacher, notice…). */
  readonly detailTitle = input<string>();
  /** Meta description for a detail page; the page's own description is used when omitted. */
  readonly detailDescription = input<string>();

  protected readonly heading = computed(() => {
    const detail = this.detailTitle();
    if (detail) return detail;
    const def = findPage(this.page());
    return def ? this.i18n.t(def.titleKey) : '';
  });
  protected readonly breadcrumbs = computed(() =>
    this.crumbs.forPage(this.page(), this.detailTitle()),
  );

  constructor() {
    effect(() => {
      const title = this.detailTitle();
      if (title) this.seo.setPage({ title, description: this.detailDescription() });
    });
  }
}

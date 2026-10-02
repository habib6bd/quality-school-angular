import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BreadcrumbItem, Breadcrumbs } from '../breadcrumbs/breadcrumbs';

/** Title banner used at the top of every inner page. */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumbs],
  template: `
    <header
      class="relative isolate overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white"
    >
      <div
        aria-hidden="true"
        class="absolute inset-0 -z-10 opacity-15 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]"
      ></div>
      <div
        aria-hidden="true"
        class="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-accent-500/25 blur-3xl"
      ></div>
      <div class="container-page py-10 sm:py-14">
        @if (breadcrumbs().length) {
          <app-breadcrumbs [items]="breadcrumbs()" [inverse]="true" />
        }
        <h1 class="mt-3 text-3xl text-white sm:text-4xl lg:text-5xl">{{ title() }}</h1>
        @if (intro()) {
          <p class="mt-4 max-w-3xl text-base text-white/85 sm:text-lg">{{ intro() }}</p>
        }
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly intro = input<string>();
  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
}

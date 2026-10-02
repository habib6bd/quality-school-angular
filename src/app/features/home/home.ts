import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Temporary home page; replaced by the full homepage in Phase 4. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <section class="container-page py-20">
      <h1 class="text-3xl text-primary-700 sm:text-4xl">{{ 'common.schoolName' | t }}</h1>
      <p class="mt-4 max-w-prose text-ink-muted">{{ 'common.tagline' | t }}</p>
    </section>
  `,
})
export class Home {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../shared/components/icon/icon';
import { ButtonDirective } from '../../../shared/directives/button.directive';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-admission-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonDirective, Icon, PagePathPipe, TranslatePipe],
  template: `
    <section
      class="relative isolate overflow-hidden bg-gradient-to-r from-primary-800 to-secondary-800 py-14 text-white sm:py-16"
      aria-labelledby="admission-cta-title"
    >
      <div
        aria-hidden="true"
        class="absolute -top-20 -left-20 -z-10 size-72 rounded-full bg-accent-500/25 blur-3xl"
      ></div>
      <div
        class="container-page flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
      >
        <div class="max-w-2xl">
          <h2 id="admission-cta-title" class="text-2xl text-white sm:text-3xl">
            {{ 'home.ctaTitle' | t }}
          </h2>
          <p class="mt-2 text-white/90">{{ 'home.ctaText' | t }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a appButton variant="accent" size="lg" [routerLink]="'admission' | pagePath">
            {{ 'nav.admissionInfo' | t }} <app-icon name="arrowRight" [size]="20" />
          </a>
          <a appButton variant="light" size="lg" [routerLink]="'contact' | pagePath">
            {{ 'nav.contact' | t }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeAdmissionCta {}

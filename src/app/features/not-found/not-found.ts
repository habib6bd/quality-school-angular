import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleNumberPipe } from '../../shared/pipes/locale-format.pipes';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonDirective, TranslatePipe, LocaleNumberPipe],
  template: `
    <section class="container-page py-20 text-center sm:py-28">
      <p class="font-display text-7xl font-bold text-primary-700" aria-hidden="true">
        {{ 404 | localeNumber: false }}
      </p>
      <h1 class="mt-4 text-2xl sm:text-3xl">{{ 'notFound.title' | t }}</h1>
      <p class="mx-auto mt-3 max-w-md text-ink-muted">{{ 'notFound.message' | t }}</p>
      <a appButton [routerLink]="['/', lang()]" class="mt-8">{{ 'notFound.backHome' | t }}</a>
    </section>
  `,
})
export class NotFound {
  protected readonly lang = inject(LanguageService).lang;
}

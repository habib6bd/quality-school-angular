import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective } from '../../directives/button.directive';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ButtonDirective, TranslatePipe],
  template: `
    <div
      role="alert"
      class="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <span class="mb-4 grid size-14 place-items-center rounded-full bg-white text-red-700">
        <app-icon name="alert" [size]="26" />
      </span>
      <p class="font-display text-lg font-semibold text-red-900">
        {{ title() ?? ('common.errorTitle' | t) }}
      </p>
      <p class="mt-1 max-w-md text-red-800">{{ message() ?? ('common.errorMessage' | t) }}</p>
      @if (retryable()) {
        <button type="button" appButton variant="outline" class="mt-5" (click)="retry.emit()">
          {{ 'common.retry' | t }}
        </button>
      }
    </div>
  `,
})
export class ErrorState {
  readonly title = input<string>();
  readonly message = input<string>();
  readonly retryable = input(true);
  readonly retry = output<void>();
}

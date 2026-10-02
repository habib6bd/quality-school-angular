import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Icon } from '../components/icon/icon';

export interface SummaryError {
  /** DOM id of the field the message belongs to. */
  fieldId: string;
  label: string;
  message: string;
}

/**
 * List of everything wrong on a step. It is announced as an alert and takes focus when the
 * visitor tries to continue, and each entry jumps to its field.
 */
@Component({
  selector: 'app-error-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  template: `
    @if (errors().length) {
      <div
        #box
        role="alert"
        tabindex="-1"
        class="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-900 focus:outline-2 focus:outline-offset-2 focus:outline-red-700"
      >
        <h3 class="flex items-center gap-2 text-base font-semibold text-red-900">
          <app-icon name="alert" [size]="20" /> {{ 'forms.errorSummary' | t }}
        </h3>
        <ul class="mt-3 list-disc space-y-1 ps-6">
          @for (error of errors(); track error.fieldId) {
            <li>
              <a
                [href]="'#' + error.fieldId"
                class="font-medium underline"
                (click)="goTo($event, error.fieldId)"
                >{{ error.label }}: {{ error.message }}</a
              >
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class ErrorSummary {
  private readonly document = inject(DOCUMENT);
  private readonly box = viewChild<ElementRef<HTMLElement>>('box');

  readonly errors = input.required<readonly SummaryError[]>();

  /** Moves focus to the summary (after it has rendered). */
  focus(): void {
    this.box()?.nativeElement.focus();
  }

  protected goTo(event: Event, fieldId: string): void {
    event.preventDefault();
    this.document.getElementById(fieldId)?.focus();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  TranslationKey,
  TranslationParams,
  TranslationService,
} from '../../core/i18n/translation.service';
import { Icon } from '../components/icon/icon';

export interface FieldError {
  key: TranslationKey;
  params?: TranslationParams;
}

/** Maps Angular validation errors to a translated message (first error wins). */
export function fieldError(errors: ValidationErrors | null): FieldError | null {
  if (!errors) return null;
  if (errors['required']) return { key: 'forms.error.required' };
  if (errors['minlength'])
    return {
      key: 'forms.error.minlength',
      params: { min: (errors['minlength'] as { requiredLength: number }).requiredLength },
    };
  if (errors['email']) return { key: 'forms.error.email' };
  if (errors['phone']) return { key: 'forms.error.phone' };
  if (errors['rollNumber']) return { key: 'forms.error.rollNumber' };
  if (errors['futureDate']) return { key: 'forms.error.futureDate' };
  if (errors['invalidDate']) return { key: 'forms.error.invalidDate' };
  return { key: 'forms.error.invalid' };
}

let nextId = 0;

/**
 * Label, hint and error message around one form control. The control inside carries
 * `appFieldControl`, which wires `id`, `aria-describedby`, `aria-invalid` and `aria-required`,
 * so screen readers hear the hint and the error when the field is focused. Errors appear once
 * the field has been touched or the step was submitted (which touches every field).
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <div class="space-y-1.5">
      <label [for]="controlId()" class="block font-semibold text-secondary-950">
        {{ label() }}
        @if (required()) {
          <span aria-hidden="true" class="text-red-700">*</span>
        }
      </label>
      @if (hint()) {
        <p [id]="controlId() + '-hint'" class="text-sm text-ink-muted">{{ hint() }}</p>
      }
      <ng-content />
      <div aria-live="polite">
        @if (message(); as text) {
          <p
            [id]="controlId() + '-error'"
            class="flex items-start gap-1.5 text-sm font-medium text-red-700"
          >
            <app-icon name="alert" [size]="16" class="mt-0.5" />
            <span>{{ text }}</span>
          </p>
        }
      </div>
    </div>
  `,
})
export class FormField {
  private readonly i18n = inject(TranslationService);
  /** Bumped on every control event so the computed state below re-reads the (non-signal) control. */
  private readonly tick = signal(0);

  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly control = input.required<AbstractControl>();
  readonly required = input(false);
  /** Stable DOM id shared with the control; pass it in when a summary must link to the field. */
  readonly fieldId = input<string>();

  protected readonly id = `field-${nextId++}`;

  readonly controlId = computed(() => this.fieldId() ?? this.id);
  readonly showError = computed(() => {
    this.tick();
    const control = this.control();
    return control.invalid && control.touched;
  });
  protected readonly message = computed(() => {
    // Read the tick directly: `showError` stays `true` while the error changes (required → format).
    this.tick();
    if (!this.showError()) return null;
    const error = fieldError(this.control().errors);
    return error ? this.i18n.t(error.key, error.params) : null;
  });
  /** Ids of the hint and error elements, for `aria-describedby`. */
  readonly describedBy = computed(
    () =>
      [
        this.hint() ? `${this.controlId()}-hint` : null,
        this.message() ? `${this.controlId()}-error` : null,
      ]
        .filter(Boolean)
        .join(' ') || null,
  );

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control().events.subscribe(() => this.tick.update((n) => n + 1));
      onCleanup(() => subscription.unsubscribe());
    });
  }
}

/** Put on the `<input>`, `<select>` or `<textarea>` inside an `<app-form-field>`. */
@Directive({
  selector: '[appFieldControl]',
  host: {
    '[id]': 'field.controlId()',
    '[attr.aria-describedby]': 'field.describedBy()',
    '[attr.aria-invalid]': 'field.showError() ? "true" : null',
    '[attr.aria-required]': 'field.required() ? "true" : null',
    class:
      'block min-h-12 w-full rounded-xl border border-stone-400 bg-white px-4 py-2 text-base focus:border-primary-600 focus:ring-2 focus:ring-primary-200 focus:outline-none aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50',
  },
})
export class FieldControl {
  protected readonly field = inject(FormField);
}

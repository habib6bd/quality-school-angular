import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorSummary } from './error-summary';
import { FieldControl, fieldError, FormField } from './form-field';
import {
  normalizeDigits,
  notBlankValidator,
  pastDateValidator,
  phoneValidator,
} from './validators';

describe('validators', () => {
  const run = (validator: (c: FormControl) => unknown, value: string) =>
    validator(new FormControl(value));

  it('normalizes Bangla digits', () => {
    expect(normalizeDigits('০১৭১১-৭৩২৪৮৬')).toBe('01711-732486');
  });

  it.each(['01711732486', '01678 708862', '+8801711732486', '8801711-732486', '০১৭১১৭৩২৪৮৬'])(
    'accepts the mobile number %s',
    (value) => expect(run(phoneValidator, value)).toBeNull(),
  );

  it.each(['01011732486', '0171173248', '017117324861', 'abc', '+44 7911 123456'])(
    'rejects the mobile number %s',
    (value) => expect(run(phoneValidator, value)).toEqual({ phone: true }),
  );

  it('leaves an empty phone to the required validator', () => {
    expect(run(phoneValidator, '')).toBeNull();
  });

  describe('pastDateValidator', () => {
    const validator = pastDateValidator(() => new Date('2026-10-02T00:00:00Z'));

    it('accepts today and earlier dates', () => {
      expect(run(validator, '2026-10-02')).toBeNull();
      expect(run(validator, '2015-03-04')).toBeNull();
    });

    it('rejects future dates', () => {
      expect(run(validator, '2026-10-03')).toEqual({ futureDate: true });
    });

    it('rejects impossible and malformed dates', () => {
      expect(run(validator, '2025-02-30')).toEqual({ invalidDate: true });
      expect(run(validator, '04/03/2015')).toEqual({ invalidDate: true });
    });
  });

  it('treats whitespace-only text as empty', () => {
    expect(run(notBlankValidator, '   ')).toEqual({ required: true });
    expect(run(notBlankValidator, 'a')).toBeNull();
    expect(run(notBlankValidator, '')).toBeNull();
  });
});

describe('fieldError', () => {
  it('maps validation errors to translation keys, required first', () => {
    expect(fieldError(null)).toBeNull();
    expect(fieldError({ required: true, minlength: {} })?.key).toBe('forms.error.required');
    expect(fieldError({ minlength: { requiredLength: 3, actualLength: 1 } })).toEqual({
      key: 'forms.error.minlength',
      params: { min: 3 },
    });
    expect(fieldError({ phone: true })?.key).toBe('forms.error.phone');
    expect(fieldError({ something: true })?.key).toBe('forms.error.invalid');
  });
});

@Component({
  imports: [ReactiveFormsModule, FormField, FieldControl],
  template: `
    <app-form-field
      label="Full name"
      hint="As on the birth certificate"
      [control]="control"
      [required]="true"
      fieldId="name-field"
    >
      <input appFieldControl [formControl]="control" />
    </app-form-field>
  `,
})
class Host {
  readonly control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
}

describe('FormField + FieldControl', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    return { fixture, el, input, control: fixture.componentInstance.control };
  }

  it('links label, hint and required state to the input', () => {
    const { el, input } = setup();
    expect(input.id).toBe('name-field');
    expect(el.querySelector('label')?.getAttribute('for')).toBe('name-field');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('name-field-hint');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(el.querySelector('#name-field-error')).toBeNull();
  });

  it('shows no error until the field is touched', () => {
    const { fixture, el } = setup();
    expect(el.querySelector('#name-field-error')).toBeNull();
    fixture.detectChanges();
    expect(el.querySelector('#name-field-error')).toBeNull();
  });

  it('announces the error and points to it once the field is touched', () => {
    const { fixture, el, input, control } = setup();
    control.markAsTouched();
    fixture.detectChanges();
    expect(el.querySelector('#name-field-error')?.textContent).toContain('আবশ্যক');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('name-field-hint name-field-error');
    expect(el.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it('clears the error when the value becomes valid', () => {
    const { fixture, el, input, control } = setup();
    control.markAsTouched();
    control.setValue('Sonia');
    fixture.detectChanges();
    expect(el.querySelector('#name-field-error')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBe('name-field-hint');
  });

  it('updates the message when the error changes while the field stays invalid', () => {
    const { fixture, el, control } = setup();
    control.markAsTouched();
    fixture.detectChanges();
    expect(el.querySelector('#name-field-error')?.textContent).toContain('আবশ্যক');
    control.setValue('ab'); // required → too short, still invalid
    fixture.detectChanges();
    expect(el.querySelector('#name-field-error')?.textContent).not.toContain('আবশ্যক');
    expect(el.querySelector('#name-field-error')?.textContent).toContain('৩');
  });

  it('reports the length rule with the required number', () => {
    const { fixture, el, control } = setup();
    control.setValue('ab');
    control.markAsTouched();
    fixture.detectChanges();
    expect(el.querySelector('#name-field-error')?.textContent).toContain('৩');
  });
});

describe('ErrorSummary', () => {
  it('renders nothing without errors', () => {
    const fixture = TestBed.createComponent(ErrorSummary);
    fixture.componentRef.setInput('errors', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).toBeNull();
  });

  it('lists errors as an alert and focuses the field behind a link', () => {
    document.body.insertAdjacentHTML('beforeend', '<input id="field-x" />');
    const fixture = TestBed.createComponent(ErrorSummary);
    fixture.componentRef.setInput('errors', [
      { fieldId: 'field-x', label: 'Name', message: 'Required' },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    el.querySelector<HTMLAnchorElement>('a')!.click();
    expect(document.activeElement?.id).toBe('field-x');
    fixture.componentInstance.focus();
    expect(document.activeElement).toBe(el.querySelector('[role="alert"]'));
    document.getElementById('field-x')?.remove();
  });
});

describe('rollNumberValidator', () => {
  it('accepts 1–8 digits in either script and rejects the rest', async () => {
    const { rollNumberValidator } = await import('./validators');
    const check = (value: string) => rollNumberValidator(new FormControl(value));
    for (const ok of ['7', '042', '12345678', '১২৩', '']) expect(check(ok)).toBeNull();
    for (const bad of ['123456789', '12a', '1 2', '-5'])
      expect(check(bad)).toEqual({ rollNumber: true });
  });
});

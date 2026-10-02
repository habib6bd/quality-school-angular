import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯';

/** Rewrites Bangla digits as ASCII digits so people can type either. */
export function normalizeDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));
}

/** Bangladeshi mobile number: `01XXXXXXXXX`, optionally with `+88`/`88`, spaces or dashes. */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = String(control.value ?? '').trim();
  if (!raw) return null;
  const compact = normalizeDigits(raw).replace(/[\s-]/g, '');
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(compact) ? null : { phone: true };
};

/** A real calendar date (`YYYY-MM-DD`) that is not in the future. */
export function pastDateValidator(now: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return { invalidDate: true };
    const [, y, m, d] = match.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const real =
      date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
    if (!real) return { invalidDate: true };
    return date.getTime() > now().getTime() ? { futureDate: true } : null;
  };
}

/** Whitespace-only text counts as empty for required fields. */
export const notBlankValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.length > 0 && !control.value.trim()
    ? { required: true }
    : null;

/** Roll number: 1–8 digits (ASCII or Bangla). */
export const rollNumberValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const raw = String(control.value ?? '').trim();
  return !raw || /^\d{1,8}$/.test(normalizeDigits(raw)) ? null : { rollNumber: true };
};

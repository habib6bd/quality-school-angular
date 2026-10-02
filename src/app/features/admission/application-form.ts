import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { TranslationKey } from '../../core/i18n/translation.service';
import {
  notBlankValidator,
  pastDateValidator,
  phoneValidator,
} from '../../shared/forms/validators';

export type StepId = 'student' | 'guardian' | 'academic' | 'documents' | 'review' | 'done';

/** Steps in order. `review` and `done` have no inputs of their own. */
export const STEP_ORDER: readonly StepId[] = [
  'student',
  'guardian',
  'academic',
  'documents',
  'review',
  'done',
];

export const STEP_TITLES: Record<StepId, TranslationKey> = {
  student: 'apply.stepStudent',
  guardian: 'apply.stepGuardian',
  academic: 'apply.stepAcademic',
  documents: 'apply.stepDocuments',
  review: 'apply.stepReview',
  done: 'apply.stepDone',
};

/** Field id → label key, per step; drives the error summary. */
export const STEP_FIELDS: Partial<Record<StepId, Record<string, TranslationKey>>> = {
  student: {
    fullName: 'apply.studentName',
    dateOfBirth: 'apply.dateOfBirth',
    gender: 'apply.gender',
  },
  guardian: {
    guardianName: 'apply.guardianName',
    relationship: 'apply.relationship',
    phone: 'apply.phone',
    email: 'apply.email',
    address: 'apply.address',
  },
  academic: {
    classSlug: 'apply.classApplying',
    group: 'apply.group',
    medium: 'apply.medium',
    previousSchool: 'apply.previousSchool',
  },
  documents: { acknowledged: 'apply.acknowledge' },
};

const text = (...validators: ValidatorFn[]) =>
  new FormControl('', { nonNullable: true, validators });

/**
 * Typed form model for the application prototype. It lives only in memory: nothing is sent,
 * stored or logged, and it disappears with the page.
 */
export class ApplicationForm {
  readonly student = new FormGroup({
    fullName: text(Validators.required, notBlankValidator, Validators.minLength(2)),
    dateOfBirth: text(Validators.required, pastDateValidator()),
    gender: text(Validators.required),
  });

  readonly guardian = new FormGroup({
    guardianName: text(Validators.required, notBlankValidator, Validators.minLength(2)),
    relationship: text(Validators.required),
    phone: text(Validators.required, phoneValidator),
    email: text(Validators.email),
    address: text(Validators.required, notBlankValidator, Validators.minLength(5)),
  });

  readonly academic = new FormGroup({
    classSlug: text(Validators.required),
    group: text(),
    medium: text(Validators.required),
    previousSchool: text(),
  });

  readonly documents = new FormGroup({
    acknowledged: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  readonly all = new FormGroup({
    student: this.student,
    guardian: this.guardian,
    academic: this.academic,
    documents: this.documents,
  });

  groupFor(step: StepId): FormGroup | null {
    switch (step) {
      case 'student':
        return this.student;
      case 'guardian':
        return this.guardian;
      case 'academic':
        return this.academic;
      case 'documents':
        return this.documents;
      default:
        return null;
    }
  }

  /** Classes with study groups (Nine, Ten) require a group; the others must not carry one. */
  setClassHasGroups(hasGroups: boolean): void {
    const group = this.academic.controls.group;
    if (hasGroups) group.addValidators(Validators.required);
    else {
      group.removeValidators(Validators.required);
      group.setValue('', { emitEvent: false });
    }
    group.updateValueAndValidity({ emitEvent: false });
  }

  /** Touches every field of a step so its errors become visible. Returns whether it is valid. */
  validateStep(step: StepId): boolean {
    const group = this.groupFor(step);
    if (!group) return true;
    group.markAllAsTouched();
    return group.valid;
  }

  /** First step (before review) that still has an invalid field, or `null` when all are valid. */
  firstInvalidStep(): StepId | null {
    return (
      (['student', 'guardian', 'academic', 'documents'] as const).find(
        (step) => this.groupFor(step)?.invalid,
      ) ?? null
    );
  }

  reset(): void {
    this.all.reset();
    this.setClassHasGroups(false);
  }
}

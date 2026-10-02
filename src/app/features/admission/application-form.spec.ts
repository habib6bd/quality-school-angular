import { ApplicationForm } from './application-form';

function fillValid(form: ApplicationForm) {
  form.student.setValue({ fullName: 'Test Student', dateOfBirth: '2015-03-04', gender: 'female' });
  form.guardian.setValue({
    guardianName: 'Test Guardian',
    relationship: 'mother',
    phone: '01711732486',
    email: '',
    address: 'Some road, Dhaka',
  });
  form.academic.setValue({ classSlug: 'five', group: '', medium: 'bangla', previousSchool: '' });
  form.documents.setValue({ acknowledged: true });
}

describe('ApplicationForm', () => {
  it('starts invalid with every required field empty', () => {
    const form = new ApplicationForm();
    expect(form.all.valid).toBe(false);
    expect(form.firstInvalidStep()).toBe('student');
  });

  it('is valid once all required fields are filled, with optional fields empty', () => {
    const form = new ApplicationForm();
    fillValid(form);
    expect(form.all.valid).toBe(true);
    expect(form.firstInvalidStep()).toBeNull();
  });

  it('validates a step and reveals its errors by touching every field', () => {
    const form = new ApplicationForm();
    expect(form.validateStep('student')).toBe(false);
    expect(form.student.controls.fullName.touched).toBe(true);
    expect(form.student.controls.dateOfBirth.touched).toBe(true);
    expect(form.guardian.controls.phone.touched).toBe(false);
  });

  it('treats review and done as always valid', () => {
    const form = new ApplicationForm();
    expect(form.validateStep('review')).toBe(true);
    expect(form.validateStep('done')).toBe(true);
  });

  it('rejects whitespace-only names and a one-letter name', () => {
    const form = new ApplicationForm();
    form.student.controls.fullName.setValue('   ');
    expect(form.student.controls.fullName.hasError('required')).toBe(true);
    form.student.controls.fullName.setValue('A');
    expect(form.student.controls.fullName.hasError('minlength')).toBe(true);
  });

  it('rejects a future date of birth and an invalid phone or e-mail', () => {
    const form = new ApplicationForm();
    form.student.controls.dateOfBirth.setValue('2999-01-01');
    expect(form.student.controls.dateOfBirth.hasError('futureDate')).toBe(true);
    form.guardian.controls.phone.setValue('12345');
    expect(form.guardian.controls.phone.hasError('phone')).toBe(true);
    form.guardian.controls.email.setValue('not-an-email');
    expect(form.guardian.controls.email.hasError('email')).toBe(true);
    form.guardian.controls.email.setValue('');
    expect(form.guardian.controls.email.valid).toBe(true);
  });

  it('requires a study group only for classes that have groups', () => {
    const form = new ApplicationForm();
    fillValid(form);
    form.academic.controls.classSlug.setValue('nine');
    form.setClassHasGroups(true);
    expect(form.academic.controls.group.hasError('required')).toBe(true);
    expect(form.firstInvalidStep()).toBe('academic');
    form.academic.controls.group.setValue('science');
    expect(form.academic.valid).toBe(true);

    form.academic.controls.classSlug.setValue('five');
    form.setClassHasGroups(false);
    expect(form.academic.controls.group.value).toBe('');
    expect(form.academic.valid).toBe(true);
  });

  it('requires the prototype acknowledgement', () => {
    const form = new ApplicationForm();
    fillValid(form);
    form.documents.setValue({ acknowledged: false });
    expect(form.firstInvalidStep()).toBe('documents');
  });

  it('resets every value', () => {
    const form = new ApplicationForm();
    fillValid(form);
    form.reset();
    expect(form.student.controls.fullName.value).toBe('');
    expect(form.documents.controls.acknowledged.value).toBe(false);
  });
});

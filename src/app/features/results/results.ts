import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { ResultLookup, ResultOptions } from '../../core/models/result.model';
import { SchoolClass } from '../../core/models/school-class.model';
import { ResultService } from '../../core/services/result.service';
import { SchoolClassService } from '../../core/services/school-class.service';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { ErrorSummary, SummaryError } from '../../shared/forms/error-summary';
import { FieldControl, fieldError, FormField } from '../../shared/forms/form-field';
import { normalizeDigits, rollNumberValidator } from '../../shared/forms/validators';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

type LookupState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'done'; result: ResultLookup };

/**
 * Results lookup, ready to be connected to the school's results system. Until then the exam and
 * year lists are empty and every lookup answers "not available online yet". Whatever is typed is
 * only used for the lookup call: it is never stored or logged, and only the rows the service
 * returns are shown.
 */
@Component({
  selector: 'app-results-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonDirective,
    ErrorState,
    ErrorSummary,
    FieldControl,
    FormField,
    Icon,
    PageScaffold,
    PendingNote,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="results" [intro]="'results.intro' | t">
      <app-pending-note class="mb-8 block max-w-3xl" [message]="'results.pending' | t" />

      <form
        class="card max-w-3xl space-y-6 p-6"
        novalidate
        [formGroup]="form"
        (ngSubmit)="search()"
        [attr.aria-labelledby]="'lookup-title'"
      >
        <h2 id="lookup-title" class="text-xl sm:text-2xl">{{ 'results.formTitle' | t }}</h2>
        <p class="text-sm text-ink-muted">{{ 'forms.requiredLegend' | t }}</p>
        <app-error-summary [errors]="summary()" />

        <div class="grid gap-6 sm:grid-cols-2">
          <app-form-field
            [label]="'results.class' | t"
            [control]="form.controls.classSlug"
            [required]="true"
            fieldId="results-classSlug"
          >
            <select appFieldControl formControlName="classSlug">
              <option value="">{{ 'apply.choose' | t }}</option>
              @for (item of classes.value(); track item.slug) {
                <option [value]="item.slug">{{ item.name | localize }}</option>
              }
            </select>
          </app-form-field>
          <app-form-field
            [label]="'results.exam' | t"
            [hint]="hasOptions() ? undefined : ('results.noExams' | t)"
            [control]="form.controls.examId"
            [required]="hasOptions()"
            fieldId="results-examId"
          >
            <select appFieldControl formControlName="examId">
              <option value="">{{ 'apply.choose' | t }}</option>
              @for (exam of options.value().exams; track exam.id) {
                <option [value]="exam.id">{{ exam.name | localize }}</option>
              }
            </select>
          </app-form-field>
          <app-form-field
            [label]="'results.year' | t"
            [control]="form.controls.year"
            [required]="hasOptions()"
            fieldId="results-year"
          >
            <select appFieldControl formControlName="year">
              <option value="">{{ 'apply.choose' | t }}</option>
              @for (year of options.value().years; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </app-form-field>
          <app-form-field
            [label]="'results.roll' | t"
            [control]="form.controls.roll"
            [required]="true"
            fieldId="results-roll"
          >
            <input
              appFieldControl
              type="text"
              inputmode="numeric"
              formControlName="roll"
              autocomplete="off"
            />
          </app-form-field>
        </div>
        <button type="submit" appButton [disabled]="state().kind === 'loading'">
          <app-icon name="search" [size]="18" /> {{ 'results.search' | t }}
        </button>
      </form>

      <div class="mt-8 max-w-3xl" aria-live="polite">
        @switch (state().kind) {
          @case ('loading') {
            <p role="status">{{ 'common.loading' | t }}</p>
          }
          @case ('error') {
            <app-error-state (retry)="search()" />
          }
          @case ('done') {
            @if (result(); as r) {
              @switch (r.status) {
                @case ('unavailable') {
                  <div role="status" class="rounded-2xl border border-accent-600 bg-accent-50 p-5">
                    <p class="font-semibold">{{ 'results.unavailableTitle' | t }}</p>
                    <p class="mt-1">{{ 'results.unavailableText' | t }}</p>
                    <a
                      appButton
                      variant="outline"
                      size="sm"
                      class="mt-4"
                      [routerLink]="'contact' | pagePath"
                      >{{ 'nav.contact' | t }}</a
                    >
                  </div>
                }
                @case ('not-found') {
                  <div role="status" class="rounded-2xl border border-stone-300 bg-white p-5">
                    <p class="font-semibold">{{ 'results.notFoundTitle' | t }}</p>
                    <p class="mt-1 text-ink-muted">{{ 'results.notFoundText' | t }}</p>
                  </div>
                }
                @case ('found') {
                  <section class="card p-5" aria-labelledby="result-title">
                    <h2 id="result-title" class="text-lg">{{ 'results.resultTitle' | t }}</h2>
                    <dl class="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[14rem_1fr]">
                      @for (row of r.rows; track $index) {
                        <dt class="font-semibold">{{ row.label | localize }}</dt>
                        <dd class="text-ink-muted">{{ row.value }}</dd>
                      }
                    </dl>
                  </section>
                }
              }
            }
          }
        }
      </div>

      <p class="mt-8 max-w-3xl text-sm text-ink-muted">{{ 'results.privacy' | t }}</p>
    </app-page-scaffold>
  `,
})
export class ResultsPage {
  private readonly results = inject(ResultService);
  private readonly classService = inject(SchoolClassService);
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService);
  private readonly injector = inject(Injector);
  private readonly errorSummary = viewChild(ErrorSummary);

  protected readonly form = new FormGroup({
    classSlug: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    examId: new FormControl('', { nonNullable: true }),
    year: new FormControl('', { nonNullable: true }),
    roll: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, rollNumberValidator],
    }),
  });

  protected readonly classes = rxResource({
    stream: () => this.classService.list(),
    defaultValue: [] as readonly SchoolClass[],
  });
  protected readonly options = rxResource({
    stream: () => this.results.options(),
    defaultValue: { exams: [], years: [] } as ResultOptions,
  });
  /** Exam and year are required only when the school has published choices for them. */
  protected readonly hasOptions = computed(
    () => this.options.value().exams.length > 0 && this.options.value().years.length > 0,
  );

  protected readonly state = signal<LookupState>({ kind: 'idle' });
  protected readonly summary = signal<readonly SummaryError[]>([]);
  protected readonly result = computed(() => {
    const state = this.state();
    return state.kind === 'done' ? state.result : null;
  });

  protected search(): void {
    this.applyOptionValidators();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.state.set({ kind: 'idle' });
      this.summary.set(this.errors());
      afterNextRender(() => this.errorSummary()?.focus(), { injector: this.injector });
      return;
    }
    this.summary.set([]);
    const value = this.form.getRawValue();
    this.state.set({ kind: 'loading' });
    this.results
      .lookup({
        classSlug: value.classSlug,
        examId: value.examId,
        year: value.year ? Number(value.year) : null,
        roll: normalizeDigits(value.roll.trim()),
      })
      .subscribe({
        next: (result) => this.state.set({ kind: 'done', result }),
        error: () => this.state.set({ kind: 'error' }),
      });
  }

  private applyOptionValidators(): void {
    for (const control of [this.form.controls.examId, this.form.controls.year]) {
      if (this.hasOptions()) control.addValidators(Validators.required);
      else control.removeValidators(Validators.required);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private errors(): SummaryError[] {
    const fields = {
      classSlug: 'results.class',
      examId: 'results.exam',
      year: 'results.year',
      roll: 'results.roll',
    } as const;
    void this.language.lang();
    return (Object.keys(fields) as (keyof typeof fields)[]).flatMap((name) => {
      const control = this.form.controls[name];
      const error = control.invalid ? fieldError(control.errors) : null;
      return error
        ? [
            {
              fieldId: `results-${name}`,
              label: this.i18n.t(fields[name]),
              message: this.i18n.t(error.key, error.params),
            },
          ]
        : [];
    });
  }
}

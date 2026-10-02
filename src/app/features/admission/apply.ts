import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { pickLocalized } from '../../core/i18n/localized';
import { LanguageService } from '../../core/i18n/language.service';
import { TranslationService } from '../../core/i18n/translation.service';
import { SchoolClass } from '../../core/models/school-class.model';
import { SchoolClassService } from '../../core/services/school-class.service';
import { Badge } from '../../shared/components/badge/badge';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { ErrorSummary, SummaryError } from '../../shared/forms/error-summary';
import { fieldError, FieldControl, FormField } from '../../shared/forms/form-field';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ApplicationForm, STEP_FIELDS, STEP_ORDER, STEP_TITLES, StepId } from './application-form';

const INPUT_STEP_COUNT = 5; // student, guardian, academic, documents, review

/**
 * Admission application — a frontend PROTOTYPE. It validates and walks through the steps,
 * but never sends, stores or logs what is typed (there is no HTTP client and no storage here).
 */
@Component({
  selector: 'app-apply-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
    Badge,
    ButtonDirective,
    ErrorSummary,
    FieldControl,
    FormField,
    Icon,
    PageScaffold,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="admission/apply" [intro]="'apply.intro' | t">
      <aside
        class="flex gap-4 rounded-2xl border-2 border-dashed border-accent-600 bg-accent-50 p-5"
        aria-labelledby="prototype-title"
      >
        <app-icon name="info" [size]="24" class="mt-0.5 shrink-0 text-accent-700" />
        <div>
          <p id="prototype-title" class="flex flex-wrap items-center gap-2 font-semibold">
            <app-badge tone="demo">{{ 'apply.prototypeBadge' | t }}</app-badge>
            {{ 'apply.prototypeTitle' | t }}
          </p>
          <p class="mt-1 text-secondary-950">{{ 'apply.prototypeText' | t }}</p>
        </div>
      </aside>

      <div class="mx-auto mt-10 max-w-3xl">
        @if (step() !== 'done') {
          <ol class="mb-8 grid grid-cols-5 gap-1.5" [attr.aria-label]="'apply.progress' | t">
            @for (id of progressSteps; track id; let i = $index) {
              <li
                class="h-2 rounded-full"
                [class]="i <= stepIndex() ? 'bg-primary-700' : 'bg-stone-300'"
                [attr.aria-current]="i === stepIndex() ? 'step' : null"
              >
                <span class="sr-only">{{ titles[id] | t }}</span>
              </li>
            }
          </ol>
        }

        <h2 #heading tabindex="-1" class="text-2xl focus:outline-none sm:text-3xl">
          @if (step() !== 'done') {
            {{ 'apply.stepOf' | t: { current: stepIndex() + 1, total: totalSteps } }}:
          }
          {{ titles[step()] | t }}
        </h2>
        <p class="mt-2 text-sm text-ink-muted">{{ 'forms.requiredLegend' | t }}</p>

        <app-error-summary class="mt-6 block" [errors]="summary()" />

        @switch (step()) {
          @case ('student') {
            <form class="mt-6 space-y-6" novalidate [formGroup]="app.student" (ngSubmit)="next()">
              <app-form-field
                [label]="'apply.studentName' | t"
                [control]="app.student.controls.fullName"
                [required]="true"
                fieldId="apply-student-fullName"
              >
                <input appFieldControl type="text" formControlName="fullName" autocomplete="off" />
              </app-form-field>
              <app-form-field
                [label]="'apply.dateOfBirth' | t"
                [control]="app.student.controls.dateOfBirth"
                [required]="true"
                fieldId="apply-student-dateOfBirth"
              >
                <input
                  appFieldControl
                  type="date"
                  formControlName="dateOfBirth"
                  autocomplete="off"
                />
              </app-form-field>
              <app-form-field
                [label]="'apply.gender' | t"
                [control]="app.student.controls.gender"
                [required]="true"
                fieldId="apply-student-gender"
              >
                <select appFieldControl formControlName="gender">
                  <option value="">{{ 'apply.choose' | t }}</option>
                  <option value="male">{{ 'apply.male' | t }}</option>
                  <option value="female">{{ 'apply.female' | t }}</option>
                </select>
              </app-form-field>
              <ng-container [ngTemplateOutlet]="actions" />
            </form>
          }
          @case ('guardian') {
            <form class="mt-6 space-y-6" novalidate [formGroup]="app.guardian" (ngSubmit)="next()">
              <app-form-field
                [label]="'apply.guardianName' | t"
                [control]="app.guardian.controls.guardianName"
                [required]="true"
                fieldId="apply-guardian-guardianName"
              >
                <input
                  appFieldControl
                  type="text"
                  formControlName="guardianName"
                  autocomplete="off"
                />
              </app-form-field>
              <app-form-field
                [label]="'apply.relationship' | t"
                [control]="app.guardian.controls.relationship"
                [required]="true"
                fieldId="apply-guardian-relationship"
              >
                <select appFieldControl formControlName="relationship">
                  <option value="">{{ 'apply.choose' | t }}</option>
                  <option value="father">{{ 'apply.father' | t }}</option>
                  <option value="mother">{{ 'apply.mother' | t }}</option>
                  <option value="other">{{ 'apply.otherGuardian' | t }}</option>
                </select>
              </app-form-field>
              <app-form-field
                [label]="'apply.phone' | t"
                [hint]="'apply.phoneHint' | t"
                [control]="app.guardian.controls.phone"
                [required]="true"
                fieldId="apply-guardian-phone"
              >
                <input
                  appFieldControl
                  type="tel"
                  inputmode="tel"
                  formControlName="phone"
                  autocomplete="off"
                />
              </app-form-field>
              <app-form-field
                [label]="'apply.email' | t"
                [control]="app.guardian.controls.email"
                fieldId="apply-guardian-email"
              >
                <input appFieldControl type="email" formControlName="email" autocomplete="off" />
              </app-form-field>
              <app-form-field
                [label]="'apply.address' | t"
                [control]="app.guardian.controls.address"
                [required]="true"
                fieldId="apply-guardian-address"
              >
                <textarea
                  appFieldControl
                  rows="3"
                  formControlName="address"
                  autocomplete="off"
                ></textarea>
              </app-form-field>
              <ng-container [ngTemplateOutlet]="actions" />
            </form>
          }
          @case ('academic') {
            <form class="mt-6 space-y-6" novalidate [formGroup]="app.academic" (ngSubmit)="next()">
              <app-form-field
                [label]="'apply.classApplying' | t"
                [control]="app.academic.controls.classSlug"
                [required]="true"
                fieldId="apply-academic-classSlug"
              >
                <select appFieldControl formControlName="classSlug">
                  <option value="">{{ 'apply.choose' | t }}</option>
                  @for (item of classes.value(); track item.slug) {
                    <option [value]="item.slug">{{ className(item) }}</option>
                  }
                </select>
              </app-form-field>
              @if (showGroup()) {
                <app-form-field
                  [label]="'apply.group' | t"
                  [control]="app.academic.controls.group"
                  [required]="true"
                  fieldId="apply-academic-group"
                >
                  <select appFieldControl formControlName="group">
                    <option value="">{{ 'apply.choose' | t }}</option>
                    <option value="science">{{ 'programs.group.science' | t }}</option>
                    <option value="business">{{ 'programs.group.business' | t }}</option>
                  </select>
                </app-form-field>
              }
              <app-form-field
                [label]="'apply.medium' | t"
                [control]="app.academic.controls.medium"
                [required]="true"
                fieldId="apply-academic-medium"
              >
                <select appFieldControl formControlName="medium">
                  <option value="">{{ 'apply.choose' | t }}</option>
                  <option value="bangla">{{ 'apply.mediumBangla' | t }}</option>
                  <option value="english">{{ 'apply.mediumEnglish' | t }}</option>
                </select>
              </app-form-field>
              <app-form-field
                [label]="'apply.previousSchool' | t"
                [control]="app.academic.controls.previousSchool"
                fieldId="apply-academic-previousSchool"
              >
                <input
                  appFieldControl
                  type="text"
                  formControlName="previousSchool"
                  autocomplete="off"
                />
              </app-form-field>
              <ng-container [ngTemplateOutlet]="actions" />
            </form>
          }
          @case ('documents') {
            <form class="mt-6 space-y-6" novalidate [formGroup]="app.documents" (ngSubmit)="next()">
              <p class="text-ink-muted">{{ 'apply.documentsText' | t }}</p>
              <div>
                <label class="flex items-start gap-3 font-medium">
                  <input
                    type="checkbox"
                    id="apply-documents-acknowledged"
                    formControlName="acknowledged"
                    class="mt-1 size-5 shrink-0 accent-primary-700"
                    [attr.aria-required]="'true'"
                    [attr.aria-invalid]="
                      app.documents.controls.acknowledged.touched &&
                      app.documents.controls.acknowledged.invalid
                        ? 'true'
                        : null
                    "
                    [attr.aria-describedby]="
                      app.documents.controls.acknowledged.touched &&
                      app.documents.controls.acknowledged.invalid
                        ? 'apply-documents-acknowledged-error'
                        : null
                    "
                  />
                  <span
                    >{{ 'apply.acknowledge' | t }}
                    <span aria-hidden="true" class="text-red-700">*</span></span
                  >
                </label>
                <div aria-live="polite">
                  @if (
                    app.documents.controls.acknowledged.touched &&
                    app.documents.controls.acknowledged.invalid
                  ) {
                    <p
                      id="apply-documents-acknowledged-error"
                      class="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-red-700"
                    >
                      <app-icon name="alert" [size]="16" class="mt-0.5" />
                      {{ 'forms.error.requiredTrue' | t }}
                    </p>
                  }
                </div>
              </div>
              <ng-container [ngTemplateOutlet]="actions" />
            </form>
          }
          @case ('review') {
            <form class="mt-6 space-y-6" novalidate (submit)="$event.preventDefault(); submit()">
              <p class="text-ink-muted">{{ 'apply.reviewText' | t }}</p>
              @for (section of reviewSections(); track section.step) {
                <section class="card p-5" [attr.aria-labelledby]="'review-' + section.step">
                  <div class="flex items-center justify-between gap-4">
                    <h3 [id]="'review-' + section.step" class="text-lg">{{ section.title | t }}</h3>
                    <button
                      type="button"
                      appButton
                      variant="ghost"
                      size="sm"
                      (click)="goTo(section.step)"
                    >
                      {{ 'apply.edit' | t }}<span class="sr-only">: {{ section.title | t }}</span>
                    </button>
                  </div>
                  <dl class="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[12rem_1fr]">
                    @for (row of section.rows; track row.label) {
                      <dt class="font-semibold text-secondary-950">{{ row.label | t }}</dt>
                      <dd class="break-words text-ink-muted">{{ row.value }}</dd>
                    }
                  </dl>
                </section>
              }
              <div class="flex flex-wrap justify-between gap-3">
                <button type="button" appButton variant="outline" (click)="back()">
                  <app-icon name="chevronLeft" [size]="18" /> {{ 'apply.back' | t }}
                </button>
                <button type="submit" appButton>
                  {{ 'apply.complete' | t }} <app-icon name="check" [size]="18" />
                </button>
              </div>
            </form>
          }
          @case ('done') {
            <section class="mt-6 rounded-2xl bg-primary-50 p-6" role="status">
              <app-icon name="check" [size]="32" class="text-primary-700" />
              <h3 class="mt-3 text-xl">{{ 'apply.doneTitle' | t }}</h3>
              <p class="mt-2 text-ink-muted">{{ 'apply.doneText' | t }}</p>
              <div class="mt-6 flex flex-wrap gap-3">
                <a appButton [routerLink]="'contact' | pagePath">{{ 'nav.contact' | t }}</a>
                <button type="button" appButton variant="outline" (click)="startOver()">
                  {{ 'apply.startOver' | t }}
                </button>
              </div>
            </section>
          }
        }
      </div>

      <ng-template #actions>
        <div class="flex flex-wrap justify-between gap-3">
          @if (stepIndex() > 0) {
            <button type="button" appButton variant="outline" (click)="back()">
              <app-icon name="chevronLeft" [size]="18" /> {{ 'apply.back' | t }}
            </button>
          } @else {
            <span></span>
          }
          <button type="submit" appButton>
            {{ 'apply.next' | t }} <app-icon name="chevronRight" [size]="18" />
          </button>
        </div>
      </ng-template>
    </app-page-scaffold>
  `,
})
export class ApplyPage {
  private readonly i18n = inject(TranslationService);
  private readonly language = inject(LanguageService);
  private readonly classService = inject(SchoolClassService);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly errorSummary = viewChild(ErrorSummary);

  protected readonly app = new ApplicationForm();
  protected readonly titles = STEP_TITLES;
  protected readonly totalSteps = INPUT_STEP_COUNT;
  protected readonly progressSteps = STEP_ORDER.slice(0, INPUT_STEP_COUNT);

  protected readonly step = signal<StepId>('student');
  protected readonly stepIndex = computed(() => STEP_ORDER.indexOf(this.step()));
  /** Errors shown in the summary; filled when the visitor tries to continue, cleared on success. */
  protected readonly summary = signal<readonly SummaryError[]>([]);

  protected readonly classes = rxResource({
    stream: () => this.classService.list(),
    defaultValue: [] as readonly SchoolClass[],
  });
  private readonly classSlug = toSignal(
    this.app.academic.controls.classSlug.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  protected readonly selectedClass = computed(
    () => this.classes.value().find((c) => c.slug === this.classSlug()) ?? null,
  );
  protected readonly showGroup = computed(() => (this.selectedClass()?.groups.length ?? 0) > 0);

  constructor() {
    // Study groups are required only for classes that have them.
    this.app.academic.controls.classSlug.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((slug) => {
        const hasGroups =
          (this.classes.value().find((c) => c.slug === slug)?.groups.length ?? 0) > 0;
        this.app.setClassHasGroups(hasGroups);
      });
  }

  protected className(item: SchoolClass): string {
    return pickLocalized(item.name, this.language.lang());
  }

  protected next(): void {
    const current = this.step();
    if (!this.app.validateStep(current)) {
      this.summary.set(this.errorsFor(current));
      afterNextRender(() => this.errorSummary()?.focus(), { injector: this.injector });
      return;
    }
    this.summary.set([]);
    this.go(STEP_ORDER[STEP_ORDER.indexOf(current) + 1]);
  }

  protected back(): void {
    this.summary.set([]);
    this.go(STEP_ORDER[Math.max(0, this.stepIndex() - 1)]);
  }

  protected goTo(step: StepId): void {
    this.summary.set([]);
    this.go(step);
  }

  /** Review → done. Nothing is sent anywhere: the prototype only shows the confirmation. */
  protected submit(): void {
    const invalid = this.app.firstInvalidStep();
    if (invalid) {
      this.app.validateStep(invalid);
      this.go(invalid);
      this.summary.set(this.errorsFor(invalid));
      return;
    }
    this.go('done');
  }

  protected startOver(): void {
    this.app.reset();
    this.summary.set([]);
    this.go('student');
  }

  private go(step: StepId): void {
    this.step.set(step);
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }

  private errorsFor(step: StepId): SummaryError[] {
    const group = this.app.groupFor(step);
    const labels = STEP_FIELDS[step] ?? {};
    if (!group) return [];
    return Object.entries(group.controls).flatMap(([name, control]) => {
      const error = control.invalid ? fieldError(control.errors) : null;
      return error && labels[name]
        ? [
            {
              fieldId: `apply-${step}-${name}`,
              label: this.i18n.t(labels[name]),
              message: this.i18n.t(error.key, error.params),
            },
          ]
        : [];
    });
  }

  protected readonly reviewSections = computed(() => {
    // Re-read when the language changes so labels and class names follow.
    this.language.lang();
    const student = this.app.student.getRawValue();
    const guardian = this.app.guardian.getRawValue();
    const academic = this.app.academic.getRawValue();
    const optional = (value: string) => value.trim() || this.i18n.t('apply.notGiven');
    const cls = this.classes.value().find((c) => c.slug === academic.classSlug);
    return [
      {
        step: 'student' as const,
        title: STEP_TITLES.student,
        rows: [
          { label: 'apply.studentName' as const, value: student.fullName },
          { label: 'apply.dateOfBirth' as const, value: student.dateOfBirth },
          { label: 'apply.gender' as const, value: this.option(student.gender) },
        ],
      },
      {
        step: 'guardian' as const,
        title: STEP_TITLES.guardian,
        rows: [
          { label: 'apply.guardianName' as const, value: guardian.guardianName },
          {
            label: 'apply.relationship' as const,
            value: this.option(guardian.relationship),
          },
          { label: 'apply.phone' as const, value: guardian.phone },
          { label: 'apply.email' as const, value: optional(guardian.email) },
          { label: 'apply.address' as const, value: guardian.address },
        ],
      },
      {
        step: 'academic' as const,
        title: STEP_TITLES.academic,
        rows: [
          { label: 'apply.classApplying' as const, value: cls ? this.className(cls) : '' },
          ...(cls?.groups.length
            ? [{ label: 'apply.group' as const, value: this.option(academic.group) }]
            : []),
          { label: 'apply.medium' as const, value: this.option(academic.medium) },
          { label: 'apply.previousSchool' as const, value: optional(academic.previousSchool) },
        ],
      },
    ];
  });

  private option(value: string): string {
    const keys = {
      male: 'apply.male',
      female: 'apply.female',
      father: 'apply.father',
      mother: 'apply.mother',
      other: 'apply.otherGuardian',
      science: 'programs.group.science',
      business: 'programs.group.business',
      bangla: 'apply.mediumBangla',
      english: 'apply.mediumEnglish',
    } as const;
    return value in keys ? this.i18n.t(keys[value as keyof typeof keys]) : value;
  }
}

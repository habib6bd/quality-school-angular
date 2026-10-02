import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslationService } from '../../core/i18n/translation.service';
import { ContactMessage, ContactSubject } from '../../core/models/contact-message.model';
import { ContactService } from '../../core/services/contact.service';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { Badge } from '../../shared/components/badge/badge';
import { Icon } from '../../shared/components/icon/icon';
import { MapEmbed } from '../../shared/components/map-embed/map-embed';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { ErrorSummary, SummaryError } from '../../shared/forms/error-summary';
import { FieldControl, fieldError, FormField } from '../../shared/forms/form-field';
import { notBlankValidator, phoneValidator } from '../../shared/forms/validators';
import { LocaleDigitsPipe } from '../../shared/pipes/locale-format.pipes';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

type SendState = 'idle' | 'sending' | 'sent' | 'failed';

/** Visitors must give at least one way to reach them. */
export function contactMethodValidator(group: AbstractControl): ValidationErrors | null {
  const email = String(group.get('email')?.value ?? '').trim();
  const phone = String(group.get('phone')?.value ?? '').trim();
  return email || phone ? null : { contactMethod: true };
}

const SUBJECTS: readonly {
  value: ContactSubject;
  label:
    | 'contact.subjectGeneral'
    | 'contact.subjectAdmission'
    | 'contact.subjectAcademic'
    | 'contact.subjectOther';
}[] = [
  { value: 'general', label: 'contact.subjectGeneral' },
  { value: 'admission', label: 'contact.subjectAdmission' },
  { value: 'academic', label: 'contact.subjectAcademic' },
  { value: 'other', label: 'contact.subjectOther' },
];

const text = (...validators: ((c: AbstractControl) => ValidationErrors | null)[]) =>
  new FormControl('', { nonNullable: true, validators });

/**
 * Contact details (from `SchoolInfoService`, the same source as the footer and homepage), a map,
 * and a contact form PROTOTYPE: it validates and shows success and error states, but there is no
 * endpoint — the message is not sent, stored or logged.
 */
@Component({
  selector: 'app-contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Badge,
    ButtonDirective,
    ErrorSummary,
    FieldControl,
    FormField,
    Icon,
    MapEmbed,
    PageScaffold,
    LocaleDigitsPipe,
    LocalizePipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="contact" [intro]="'contact.intro' | t">
      <div class="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="contact-details">
          <h2 id="contact-details" class="text-2xl sm:text-3xl">
            {{ 'contact.detailsTitle' | t }}
          </h2>
          <dl class="mt-6 space-y-5">
            <div class="flex gap-4">
              <dt class="mt-0.5 text-primary-700">
                <app-icon name="mapPin" [size]="22" /><span class="sr-only">{{
                  'footer.address' | t
                }}</span>
              </dt>
              <dd>
                @if (info().address; as address) {
                  {{ address | localize }}
                } @else {
                  {{ 'common.toBeConfirmed' | t }}
                }
              </dd>
            </div>
            <div class="flex gap-4">
              <dt class="mt-0.5 text-primary-700">
                <app-icon name="phone" [size]="22" /><span class="sr-only">{{
                  'footer.phone' | t
                }}</span>
              </dt>
              <dd>
                @for (phone of info().phones; track phone) {
                  <a [href]="'tel:' + phone" class="block font-medium hover:text-primary-700">{{
                    phone | localeDigits
                  }}</a>
                } @empty {
                  {{ 'common.toBeConfirmed' | t }}
                }
              </dd>
            </div>
            <div class="flex gap-4">
              <dt class="mt-0.5 text-primary-700">
                <app-icon name="mail" [size]="22" /><span class="sr-only">{{
                  'footer.email' | t
                }}</span>
              </dt>
              <dd>
                @for (email of info().emails; track email) {
                  <a [href]="'mailto:' + email" class="block break-all hover:text-primary-700">{{
                    email
                  }}</a>
                } @empty {
                  {{ 'common.toBeConfirmed' | t }}
                }
              </dd>
            </div>
            <div class="flex gap-4">
              <dt class="mt-0.5 text-primary-700">
                <app-icon name="clock" [size]="22" /><span class="sr-only">{{
                  'contact.officeHours' | t
                }}</span>
              </dt>
              <dd>
                @if (info().officeHours; as hours) {
                  {{ hours | localize }}
                } @else {
                  {{ 'contact.officeHours' | t }}: {{ 'common.toBeConfirmed' | t }}
                }
              </dd>
            </div>
            @if (info().schoolCode || info().eiin) {
              <div class="flex gap-4">
                <dt class="mt-0.5 text-primary-700">
                  <app-icon name="info" [size]="22" /><span class="sr-only">{{
                    'contact.identifiers' | t
                  }}</span>
                </dt>
                <dd class="text-ink-muted">
                  @if (info().schoolCode; as code) {
                    {{ 'footer.schoolCode' | t }}: {{ code | localeDigits }}
                  }
                  @if (info().schoolCode && info().eiin) {
                    ·
                  }
                  @if (info().eiin; as eiin) {
                    {{ 'footer.eiin' | t }}: {{ eiin | localeDigits }}
                  }
                </dd>
              </div>
            }
          </dl>
        </section>

        <section aria-labelledby="contact-form-title" class="card p-6">
          <h2
            id="contact-form-title"
            class="flex flex-wrap items-center gap-2 text-2xl sm:text-3xl"
          >
            {{ 'contact.formTitle' | t }}
            <app-badge tone="demo">{{ 'apply.prototypeBadge' | t }}</app-badge>
          </h2>
          <p class="mt-2 rounded-xl bg-accent-50 p-3 text-sm text-secondary-950">
            {{ 'contact.prototypeText' | t }}
          </p>

          @switch (state()) {
            @case ('sent') {
              <div role="status" class="mt-6 rounded-2xl bg-primary-50 p-5">
                <app-icon name="check" [size]="28" class="text-primary-700" />
                <h3 class="mt-2 text-lg">{{ 'contact.sentTitle' | t }}</h3>
                <p class="mt-1 text-ink-muted">{{ 'contact.sentText' | t }}</p>
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="mt-4"
                  (click)="reset()"
                >
                  {{ 'contact.sendAnother' | t }}
                </button>
              </div>
            }
            @default {
              <form class="mt-6 space-y-5" novalidate [formGroup]="form" (ngSubmit)="submit()">
                <p class="text-sm text-ink-muted">{{ 'forms.requiredLegend' | t }}</p>
                <app-error-summary [errors]="summary()" />
                @if (state() === 'failed') {
                  <div
                    role="alert"
                    class="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900"
                  >
                    <p class="font-semibold">{{ 'contact.failedTitle' | t }}</p>
                    <p class="mt-1">{{ 'contact.failedText' | t }}</p>
                  </div>
                }
                <app-form-field
                  [label]="'contact.name' | t"
                  [control]="form.controls.name"
                  [required]="true"
                  fieldId="contact-name"
                >
                  <input appFieldControl type="text" formControlName="name" autocomplete="name" />
                </app-form-field>
                <div class="grid gap-5 sm:grid-cols-2">
                  <app-form-field
                    [label]="'contact.email' | t"
                    [control]="form.controls.email"
                    fieldId="contact-email"
                  >
                    <input
                      appFieldControl
                      type="email"
                      formControlName="email"
                      autocomplete="email"
                    />
                  </app-form-field>
                  <app-form-field
                    [label]="'contact.phone' | t"
                    [hint]="'apply.phoneHint' | t"
                    [control]="form.controls.phone"
                    fieldId="contact-phone"
                  >
                    <input
                      appFieldControl
                      type="tel"
                      inputmode="tel"
                      formControlName="phone"
                      autocomplete="tel"
                    />
                  </app-form-field>
                </div>
                <p class="-mt-2 text-sm text-ink-muted" id="contact-method-hint">
                  {{ 'contact.methodHint' | t }}
                </p>
                @if (methodMissing()) {
                  <p
                    id="contact-method-error"
                    class="flex items-start gap-1.5 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    <app-icon name="alert" [size]="16" class="mt-0.5" />
                    {{ 'forms.error.contactMethod' | t }}
                  </p>
                }
                <app-form-field
                  [label]="'contact.subject' | t"
                  [control]="form.controls.subject"
                  [required]="true"
                  fieldId="contact-subject"
                >
                  <select appFieldControl formControlName="subject">
                    @for (option of subjects; track option.value) {
                      <option [value]="option.value">{{ option.label | t }}</option>
                    }
                  </select>
                </app-form-field>
                <app-form-field
                  [label]="'contact.message' | t"
                  [control]="form.controls.message"
                  [required]="true"
                  fieldId="contact-message"
                >
                  <textarea appFieldControl rows="5" formControlName="message"></textarea>
                </app-form-field>
                <button type="submit" appButton [disabled]="state() === 'sending'">
                  {{ (state() === 'failed' ? 'common.retry' : 'contact.send') | t }}
                  <app-icon name="arrowRight" [size]="18" />
                </button>
              </form>
            }
          }
        </section>
      </div>

      <section aria-labelledby="contact-map" class="mt-12">
        <h2 id="contact-map" class="text-2xl sm:text-3xl">{{ 'contact.mapTitle' | t }}</h2>
        <app-map-embed
          class="mt-5 block"
          [url]="info().mapEmbedUrl"
          [title]="'home.mapTitle' | t"
        />
      </section>
    </app-page-scaffold>
  `,
})
export class ContactPage {
  private readonly contact = inject(ContactService);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly errorSummary = viewChild(ErrorSummary);

  protected readonly info = inject(SchoolInfoService).info;
  protected readonly subjects = SUBJECTS;
  protected readonly form = new FormGroup(
    {
      name: text(Validators.required, notBlankValidator, Validators.minLength(2)),
      email: text(Validators.email),
      phone: text(phoneValidator),
      subject: new FormControl<ContactSubject>('general', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      message: text(Validators.required, notBlankValidator, Validators.minLength(10)),
    },
    { validators: [contactMethodValidator] },
  );

  protected readonly state = signal<SendState>('idle');
  protected readonly summary = signal<readonly SummaryError[]>([]);
  /** The "email or phone" rule is shown once both fields have been visited. */
  protected readonly methodMissing = signal(false);

  constructor() {
    // Once shown, the "email or phone" message disappears as soon as one of them is filled in.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.methodMissing()) this.methodMissing.set(this.form.hasError('contactMethod'));
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.methodMissing.set(this.form.hasError('contactMethod'));
    if (this.form.invalid) {
      this.summary.set(this.errors());
      afterNextRender(() => this.errorSummary()?.focus(), { injector: this.injector });
      return;
    }
    this.summary.set([]);
    this.state.set('sending');
    const message: ContactMessage = this.form.getRawValue();
    this.contact.send(message).subscribe({
      next: () => this.state.set('sent'),
      error: () => this.state.set('failed'),
    });
  }

  protected reset(): void {
    this.form.reset({ subject: 'general' });
    this.methodMissing.set(false);
    this.summary.set([]);
    this.state.set('idle');
  }

  private errors(): SummaryError[] {
    const labels = {
      name: 'contact.name',
      email: 'contact.email',
      phone: 'contact.phone',
      subject: 'contact.subject',
      message: 'contact.message',
    } as const;
    const list = (Object.keys(labels) as (keyof typeof labels)[]).flatMap((name) => {
      const control = this.form.controls[name];
      const error = control.invalid ? fieldError(control.errors) : null;
      return error
        ? [
            {
              fieldId: `contact-${name}`,
              label: this.i18n.t(labels[name]),
              message: this.i18n.t(error.key, error.params),
            },
          ]
        : [];
    });
    if (this.form.hasError('contactMethod')) {
      list.unshift({
        fieldId: 'contact-email',
        label: this.i18n.t('contact.email'),
        message: this.i18n.t('forms.error.contactMethod'),
      });
    }
    return list;
  }
}

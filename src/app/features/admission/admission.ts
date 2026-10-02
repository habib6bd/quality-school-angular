import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { FaqItem } from '../../core/models/faq.model';
import { ImageAttachment } from '../../core/models/notice.model';
import { SchoolClass } from '../../core/models/school-class.model';
import { FaqService } from '../../core/services/faq.service';
import { NoticeService } from '../../core/services/notice.service';
import { SchoolClassService } from '../../core/services/school-class.service';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { Accordion, AccordionItem } from '../../shared/components/accordion/accordion';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Icon } from '../../shared/components/icon/icon';
import { Lightbox } from '../../shared/components/lightbox/lightbox';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { PendingNote } from '../../shared/components/pending-note/pending-note';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleDatePipe, LocaleDigitsPipe } from '../../shared/pipes/locale-format.pipes';
import { LocalizedLangPipe, LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

const CALENDAR_ROWS = [
  'admission.calStart',
  'admission.calDeadline',
  'admission.calResult',
  'admission.calClasses',
] as const;

/**
 * Admission overview. The school has published which classes admit and one notice; eligibility,
 * steps, documents and dates are NOT published, so those sections are marked placeholders.
 */
@Component({
  selector: 'app-admission-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    Accordion,
    AsyncState,
    ButtonDirective,
    Icon,
    Lightbox,
    PageScaffold,
    PendingNote,
    RelatedLinks,
    LocaleDatePipe,
    LocaleDigitsPipe,
    LocalizePipe,
    LocalizedLangPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="admission" [intro]="'admission.intro' | t">
      <div class="space-y-14">
        <section aria-labelledby="adm-notice">
          <h2 id="adm-notice" class="text-2xl sm:text-3xl">{{ 'admission.noticeTitle' | t }}</h2>
          <app-async-state
            class="mt-5 block"
            [status]="notice.status()"
            [empty]="!notice.value()"
            [emptyTitle]="'notices.emptyTitle' | t"
            [emptyMessage]="'notices.emptyMessage' | t"
            emptyIcon="bell"
            skeleton="text"
            (retry)="notice.reload()"
          >
            @if (notice.value(); as item) {
              <div class="card grid gap-6 p-5 sm:grid-cols-[12rem_1fr] sm:p-6">
                @if (firstImage(); as attachment) {
                  <button
                    type="button"
                    class="mx-auto block w-40 overflow-hidden rounded-xl border border-stone-200 sm:w-full"
                    [attr.aria-label]="('gallery.open' | t) + ': ' + (attachment.label | localize)"
                    (click)="lightboxIndex.set(0)"
                  >
                    <img
                      [ngSrc]="attachment.src"
                      [width]="attachment.width"
                      [height]="attachment.height"
                      [alt]="attachment.label | localize"
                      class="h-auto w-full"
                    />
                  </button>
                }
                <div>
                  <p class="text-sm font-medium text-ink-muted">
                    <time [attr.datetime]="item.publishedAt">{{
                      item.publishedAt | localeDate
                    }}</time>
                  </p>
                  <h3 class="mt-1 text-xl" [lang]="item.title | localizedLang">
                    {{ item.title | localize }}
                  </h3>
                  <p class="mt-2 text-ink-muted" [lang]="item.summary | localizedLang">
                    {{ item.summary | localize }}
                  </p>
                  <a
                    appButton
                    variant="outline"
                    size="sm"
                    class="mt-4"
                    [routerLink]="'notices' | pagePath"
                  >
                    {{ 'admission.allNotices' | t }}
                  </a>
                </div>
              </div>
              <app-lightbox [images]="lightboxImages()" [(index)]="lightboxIndex" />
            }
          </app-async-state>
        </section>

        <section aria-labelledby="adm-classes">
          <h2 id="adm-classes" class="text-2xl sm:text-3xl">{{ 'admission.classesTitle' | t }}</h2>
          <p class="mt-2 max-w-3xl text-ink-muted">{{ 'admission.classesText' | t }}</p>
          <app-async-state
            class="mt-5 block"
            [status]="classes.status()"
            [empty]="classes.value().length === 0"
            skeleton="list"
            (retry)="classes.reload()"
          >
            <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              @for (item of classes.value(); track item.slug) {
                <li>
                  <a
                    [routerLink]="'academics/programs' | pagePath: item.slug"
                    class="block rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 font-display font-semibold text-primary-900 hover:bg-primary-100"
                    >{{ item.name | localize }}</a
                  >
                </li>
              }
            </ul>
          </app-async-state>
        </section>

        <div class="grid gap-6 md:grid-cols-3">
          @for (block of pendingBlocks; track block.title) {
            <section class="card p-6" [attr.aria-labelledby]="block.title">
              <h2 [id]="block.title" class="text-xl">{{ block.heading | t }}</h2>
              <app-pending-note class="mt-4 block" [message]="block.text | t" />
            </section>
          }
        </div>

        <section aria-labelledby="adm-calendar">
          <h2 id="adm-calendar" class="text-2xl sm:text-3xl">
            {{ 'admission.calendarTitle' | t }}
          </h2>
          <div class="mt-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
            <table class="w-full min-w-[20rem] text-left">
              <caption class="sr-only">
                {{
                  'admission.calendarTitle' | t
                }}
              </caption>
              <thead class="bg-stone-100 text-sm">
                <tr>
                  <th scope="col" class="px-4 py-3">{{ 'admission.calEvent' | t }}</th>
                  <th scope="col" class="px-4 py-3">{{ 'admission.calDate' | t }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200">
                @for (row of calendarRows; track row) {
                  <tr>
                    <th scope="row" class="px-4 py-3 font-medium">{{ row | t }}</th>
                    <td class="px-4 py-3 text-ink-muted">{{ 'common.toBeConfirmed' | t }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-sm text-ink-muted">{{ 'admission.calendarNote' | t }}</p>
        </section>

        <section aria-labelledby="adm-faq">
          <h2 id="adm-faq" class="text-2xl sm:text-3xl">{{ 'nav.faq' | t }}</h2>
          <app-async-state
            class="mt-5 block max-w-3xl"
            [status]="faqs.status()"
            [empty]="faqs.value().length === 0"
            skeleton="list"
            (retry)="faqs.reload()"
          >
            <app-accordion [items]="faqItems()" />
          </app-async-state>
          <p class="mt-4">
            <a
              [routerLink]="'faq' | pagePath"
              class="font-semibold text-primary-700 hover:underline"
              >{{ 'admission.moreFaq' | t }}</a
            >
          </p>
        </section>

        <section
          aria-labelledby="adm-contact"
          class="rounded-3xl bg-primary-900 p-6 text-white sm:p-10"
        >
          <h2 id="adm-contact" class="text-2xl text-white sm:text-3xl">
            {{ 'admission.contactTitle' | t }}
          </h2>
          <p class="mt-2 max-w-2xl text-white/90">{{ 'admission.contactText' | t }}</p>
          <ul class="mt-5 space-y-2">
            @for (phone of info().phones; track phone) {
              <li class="flex items-center gap-3">
                <app-icon name="phone" [size]="20" class="text-accent-300" />
                <a
                  [href]="'tel:' + phone"
                  class="inline-block py-1.5 font-semibold hover:underline"
                  >{{ phone | localeDigits }}</a
                >
              </li>
            }
            @if (info().address; as address) {
              <li class="flex items-start gap-3">
                <app-icon name="mapPin" [size]="20" class="mt-0.5 text-accent-300" />
                <span>{{ address | localize }}</span>
              </li>
            }
          </ul>
          <div class="mt-6 flex flex-wrap gap-3">
            <a appButton variant="accent" [routerLink]="'contact' | pagePath">{{
              'nav.contact' | t
            }}</a>
            <a appButton variant="light" [routerLink]="'admission/apply' | pagePath">
              {{ 'admission.applyCta' | t }}
            </a>
          </div>
        </section>
      </div>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class AdmissionPage {
  private readonly noticeService = inject(NoticeService);
  private readonly classService = inject(SchoolClassService);
  private readonly faqService = inject(FaqService);
  private readonly language = inject(LanguageService);

  protected readonly info = inject(SchoolInfoService).info;
  protected readonly calendarRows = CALENDAR_ROWS;
  protected readonly pendingBlocks = [
    {
      title: 'adm-eligibility',
      heading: 'admission.eligibilityTitle',
      text: 'admission.eligibilityPending',
    },
    { title: 'adm-steps', heading: 'admission.stepsTitle', text: 'admission.stepsPending' },
    {
      title: 'adm-documents',
      heading: 'admission.documentsTitle',
      text: 'admission.documentsPending',
    },
  ] as const;
  protected readonly related = ['admission/apply', 'notices', 'faq', 'contact'] as const;

  protected readonly lightboxIndex = signal<number | null>(null);
  protected readonly notice = rxResource({
    stream: () => this.noticeService.bySlug('admission-2026'),
  });
  protected readonly classes = rxResource({
    stream: () => this.classService.list(),
    defaultValue: [] as readonly SchoolClass[],
  });
  protected readonly faqs = rxResource({
    stream: () => this.faqService.list('admission', 'contact'),
    defaultValue: [] as readonly FaqItem[],
  });

  /** The notice image shown next to the text (its first image attachment). */
  protected readonly firstImage = computed<ImageAttachment | undefined>(() =>
    this.notice.value()?.attachments.find((a): a is ImageAttachment => a.kind === 'image'),
  );
  protected readonly lightboxImages = computed(() => {
    const image = this.firstImage();
    return image ? [{ src: image.src, alt: pickLocalized(image.label, this.language.lang()) }] : [];
  });
  protected readonly faqItems = computed<AccordionItem[]>(() =>
    this.faqs.value().map((faq) => ({
      id: faq.id,
      title: pickLocalized(faq.question, this.language.lang()),
      content: pickLocalized(faq.answer, this.language.lang()),
    })),
  );
}

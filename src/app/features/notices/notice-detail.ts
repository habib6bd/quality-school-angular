import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { TranslationService } from '../../core/i18n/translation.service';
import { NoticeAttachment } from '../../core/models/notice.model';
import { SeoService } from '../../core/seo/seo.service';
import { NoticeService } from '../../core/services/notice.service';
import { ResponseStatusService } from '../../core/services/response-status.service';
import { Badge } from '../../shared/components/badge/badge';
import { Icon } from '../../shared/components/icon/icon';
import { Lightbox, LightboxImage } from '../../shared/components/lightbox/lightbox';
import { NOTICE_CATEGORY_LABELS } from '../../shared/components/notice-card/notice-card';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { LocaleDatePipe } from '../../shared/pipes/locale-format.pipes';
import { LocalizedLangPipe, LocalizePipe } from '../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { safeAttachmentPath } from '../../shared/util/safe-url';
import { NotFound } from '../not-found/not-found';

interface SafeAttachment {
  attachment: NoticeAttachment;
  href: string;
}

/** Notice page. Attachments are linked only when their path passes `safeAttachmentPath`. */
@Component({
  selector: 'app-notice-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    Badge,
    ButtonDirective,
    Icon,
    Lightbox,
    NotFound,
    PageScaffold,
    Skeleton,
    LocaleDatePipe,
    LocalizePipe,
    LocalizedLangPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    @if (detail.value(); as notice) {
      <app-page-scaffold page="notices" [detailTitle]="title()" [detailDescription]="summary()">
        <article class="max-w-3xl">
          <div class="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            <app-badge tone="secondary">{{ categoryLabel() | t }}</app-badge>
            <span class="inline-flex items-center gap-1">
              <app-icon name="calendar" [size]="14" />
              <span class="sr-only">{{ 'notices.published' | t }}: </span>
              <time [attr.datetime]="notice.publishedAt">{{
                notice.publishedAt | localeDate
              }}</time>
            </span>
          </div>
          <p class="mt-5 text-lg text-secondary-950" [lang]="notice.summary | localizedLang">
            {{ notice.summary | localize }}
          </p>

          @if (attachments().length) {
            <section aria-labelledby="attachments-title" class="mt-10">
              <h2 id="attachments-title" class="text-xl sm:text-2xl">
                {{ 'notices.attachments' | t }}
              </h2>
              <ul class="mt-5 space-y-6">
                @for (item of attachments(); track item.href; let i = $index) {
                  <li class="card p-5">
                    <p class="font-semibold">{{ item.attachment.label | localize }}</p>
                    @if (item.attachment.kind === 'image') {
                      <button
                        type="button"
                        class="mt-3 block w-full max-w-md overflow-hidden rounded-xl border border-stone-200"
                        [attr.aria-label]="
                          ('gallery.open' | t) + ': ' + (item.attachment.label | localize)
                        "
                        (click)="open(item)"
                      >
                        <img
                          [ngSrc]="item.href"
                          [width]="item.attachment.width"
                          [height]="item.attachment.height"
                          [alt]="item.attachment.label | localize"
                          class="h-auto w-full"
                        />
                      </button>
                    } @else {
                      <p class="mt-3 inline-flex items-center gap-2 text-ink-muted">
                        <app-icon name="file" [size]="20" /> PDF
                      </p>
                    }
                    <div class="mt-4 flex flex-wrap gap-3">
                      <a
                        appButton
                        variant="outline"
                        size="sm"
                        [href]="item.href"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ 'notices.openAttachment' | t }}
                        <app-icon name="external" [size]="16" />
                        <span class="sr-only">{{ 'common.externalLink' | t }}</span>
                      </a>
                      <a appButton variant="ghost" size="sm" [href]="item.href" download>
                        <app-icon name="download" [size]="16" /> {{ 'notices.download' | t }}
                      </a>
                    </div>
                  </li>
                }
              </ul>
              @if (skipped() > 0) {
                <p class="mt-4 text-sm text-ink-muted" role="note">
                  {{ 'notices.attachmentSkipped' | t }}
                </p>
              }
            </section>
          }

          <p class="mt-10">
            <a
              [routerLink]="'notices' | pagePath"
              class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
            >
              <app-icon name="chevronLeft" [size]="18" /> {{ 'notices.backToList' | t }}
            </a>
          </p>
        </article>
        <app-lightbox [images]="lightboxImages()" [(index)]="lightboxIndex" />
      </app-page-scaffold>
    } @else if (detail.status() === 'resolved') {
      <app-not-found />
    } @else {
      <div class="container-page section"><app-skeleton variant="text" [count]="3" /></div>
    }
  `,
})
export class NoticeDetailPage {
  private readonly service = inject(NoticeService);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);
  private readonly status = inject(ResponseStatusService);

  /** Route parameter, bound by `withComponentInputBinding`. */
  readonly slug = input.required<string>();

  protected readonly lightboxIndex = signal<number | null>(null);
  protected readonly detail = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.service.bySlug(params),
  });
  protected readonly title = computed(() => {
    const notice = this.detail.value();
    return notice ? pickLocalized(notice.title, this.language.lang()) : '';
  });
  protected readonly summary = computed(() => {
    const notice = this.detail.value();
    return notice ? pickLocalized(notice.summary, this.language.lang()) : '';
  });
  protected readonly categoryLabel = computed(
    () => NOTICE_CATEGORY_LABELS[this.detail.value()?.category ?? 'general'],
  );
  /** Attachments whose path is safe to link; the rest are counted, not linked. */
  protected readonly attachments = computed<SafeAttachment[]>(() =>
    (this.detail.value()?.attachments ?? []).flatMap((attachment) => {
      const href = safeAttachmentPath(attachment.src);
      return href ? [{ attachment, href }] : [];
    }),
  );
  protected readonly skipped = computed(
    () => (this.detail.value()?.attachments.length ?? 0) - this.attachments().length,
  );
  protected readonly lightboxImages = computed<LightboxImage[]>(() =>
    this.images().map(({ attachment, href }) => ({
      src: href,
      alt: pickLocalized(attachment.label, this.language.lang()),
    })),
  );
  private readonly images = computed(() =>
    this.attachments().filter(({ attachment }) => attachment.kind === 'image'),
  );

  constructor() {
    effect(() => {
      if (this.detail.status() !== 'resolved' || this.detail.value()) return;
      this.status.notFound();
      this.seo.setPage({ title: this.i18n.t('notFound.title') });
    });
  }

  protected open(item: SafeAttachment): void {
    this.lightboxIndex.set(this.images().indexOf(item));
  }
}

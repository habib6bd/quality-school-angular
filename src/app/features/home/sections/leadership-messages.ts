import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/i18n/language.service';
import { LeaderMessage } from '../../../core/models/leader-message.model';
import { LeadershipService } from '../../../core/services/leadership.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { Icon } from '../../../shared/components/icon/icon';
import { LocalizedLangPipe, LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** The paragraph shown as an excerpt: the main body of each published message. */
function excerptOf(message: LeaderMessage, lang: 'bn' | 'en'): string {
  const paragraphs = (lang === 'en' ? message.paragraphs.en : undefined) ?? message.paragraphs.bn;
  return paragraphs.length > 1 && message.id === 'chairman' ? paragraphs[1] : paragraphs[0];
}

@Component({
  selector: 'app-home-messages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    AsyncState,
    ContentSection,
    Icon,
    LocalizePipe,
    LocalizedLangPipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-content-section [title]="'home.messagesTitle' | t" [eyebrow]="'nav.messages' | t">
      <app-async-state
        [status]="messages.status()"
        [empty]="messages.value().length === 0"
        [skeletonCount]="2"
        (retry)="messages.reload()"
      >
        <div class="grid gap-6 lg:grid-cols-2">
          @for (message of messages.value(); track message.id) {
            <figure class="card flex flex-col gap-5 p-6 sm:flex-row">
              <img
                [ngSrc]="message.photo.src"
                [width]="message.photo.width"
                [height]="message.photo.height"
                [alt]="message.photo.alt | localize"
                class="h-auto w-32 shrink-0 self-start rounded-xl object-cover sm:w-36"
              />
              <div class="min-w-0">
                <blockquote
                  class="line-clamp-6 text-ink-muted"
                  [lang]="message.paragraphs | localizedLang"
                >
                  {{ excerpt(message) }}
                </blockquote>
                <figcaption class="mt-4">
                  <span
                    class="block font-display text-lg font-semibold"
                    [lang]="message.name | localizedLang"
                    >{{ message.name | localize }}</span
                  >
                  <span class="text-sm font-medium text-primary-800">{{
                    message.role | localize
                  }}</span>
                </figcaption>
              </div>
            </figure>
          }
        </div>
        <p class="mt-6">
          <a
            [routerLink]="'about/messages' | pagePath"
            class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
          >
            {{ 'home.messagesMore' | t }} <app-icon name="arrowRight" [size]="16" />
          </a>
        </p>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeMessages {
  private readonly service = inject(LeadershipService);
  private readonly language = inject(LanguageService);

  protected readonly messages = rxResource({
    stream: () => this.service.messages(),
    defaultValue: [] as readonly LeaderMessage[],
  });

  protected excerpt(message: LeaderMessage): string {
    return excerptOf(message, this.language.lang());
  }
}

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../core/i18n/language.service';
import { pickLocalized } from '../../core/i18n/localized';
import { LeaderMessage } from '../../core/models/leader-message.model';
import { LeadershipService } from '../../core/services/leadership.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { RelatedLinks } from '../../shared/components/related-links/related-links';
import { LocalizedLangPipe, LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-messages-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    AsyncState,
    PageScaffold,
    RelatedLinks,
    LocalizePipe,
    LocalizedLangPipe,
    TranslatePipe,
  ],
  template: `
    <app-page-scaffold page="about/messages" [intro]="'messagesPage.intro' | t">
      @if (lang() === 'en') {
        <p class="mb-8 max-w-3xl rounded-xl bg-secondary-50 p-4 text-sm text-secondary-900">
          {{ 'messagesPage.translationNote' | t }}
        </p>
      }
      <app-async-state
        [status]="messages.status()"
        [empty]="messages.value().length === 0"
        skeleton="text"
        (retry)="messages.reload()"
      >
        <div class="space-y-12">
          @for (message of messages.value(); track message.id) {
            <article
              class="grid items-start gap-6 md:grid-cols-[14rem_1fr] md:gap-10"
              [attr.aria-labelledby]="'message-' + message.id"
            >
              <figure class="mx-auto md:mx-0">
                <img
                  [ngSrc]="message.photo.src"
                  [width]="message.photo.width"
                  [height]="message.photo.height"
                  [alt]="message.photo.alt | localize"
                  class="h-auto w-48 rounded-2xl object-cover shadow-[var(--shadow-card)] md:w-56"
                />
              </figure>
              <div>
                <h2 [id]="'message-' + message.id" class="text-xl sm:text-2xl">
                  {{ message.role | localize }}
                </h2>
                <div
                  class="prose-content mt-4 max-w-none text-base sm:text-lg"
                  [lang]="message.paragraphs | localizedLang"
                >
                  @for (paragraph of paragraphs(message); track $index) {
                    <p>{{ paragraph }}</p>
                  }
                </div>
                <p
                  class="mt-5 font-display text-lg font-semibold"
                  [lang]="message.name | localizedLang"
                >
                  {{ message.name | localize }}
                </p>
                <p class="text-sm font-medium text-primary-800">{{ message.role | localize }}</p>
              </div>
            </article>
          }
        </div>
      </app-async-state>
      <app-related-links class="mt-14 block" [paths]="related" />
    </app-page-scaffold>
  `,
})
export class MessagesPage {
  private readonly service = inject(LeadershipService);
  protected readonly lang = inject(LanguageService).lang;

  protected readonly messages = rxResource({
    stream: () => this.service.messages(),
    defaultValue: [] as readonly LeaderMessage[],
  });
  protected readonly related = ['about/philosophy', 'about/mission-vision', 'about'] as const;

  protected paragraphs(message: LeaderMessage): readonly string[] {
    return pickLocalized(message.paragraphs, this.lang());
  }
}

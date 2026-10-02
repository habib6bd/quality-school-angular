import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsArticle } from '../../../core/models/news.model';
import { LocaleDatePipe } from '../../pipes/locale-format.pipes';
import { LocalizedLangPipe, LocalizePipe } from '../../pipes/localize.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-news-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  imports: [
    NgOptimizedImage,
    RouterLink,
    Icon,
    LocaleDatePipe,
    LocalizePipe,
    LocalizedLangPipe,
    TranslatePipe,
  ],
  template: `
    <article class="card card-interactive flex h-full flex-col">
      @if (article().image; as image) {
        <img
          [ngSrc]="image.src"
          [width]="image.width"
          [height]="image.height"
          [alt]="image.alt | localize"
          class="aspect-[16/9] w-full object-cover"
        />
      }
      <div class="flex flex-1 flex-col p-5">
        <time [attr.datetime]="article().publishedAt" class="text-sm text-ink-muted">
          {{ article().publishedAt | localeDate: 'medium' }}
        </time>
        <h3 class="mt-1 text-lg leading-snug" [lang]="article().title | localizedLang">
          <a [routerLink]="link()" class="after:absolute after:inset-0 hover:text-primary-700">{{
            article().title | localize
          }}</a>
        </h3>
        <p class="mt-2 text-sm text-ink-muted" [lang]="article().summary | localizedLang">
          {{ article().summary | localize }}
        </p>
        <span
          class="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-700"
          aria-hidden="true"
        >
          {{ 'common.readMore' | t }} <app-icon name="arrowRight" [size]="16" />
        </span>
      </div>
    </article>
  `,
})
export class NewsCard {
  readonly article = input.required<NewsArticle>();
  readonly link = input.required<readonly string[]>();
}

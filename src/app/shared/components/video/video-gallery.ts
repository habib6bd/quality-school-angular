import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { pickLocalized } from '../../../core/i18n/localized';
import { SchoolVideo } from '../../../core/models/video.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';
import { VideoCard } from './video-card';
import { VideoModal, youtubeWatchUrl } from './video-modal';

/**
 * Grid of video tiles plus one shared player dialog. The dialog stays mounted after the first
 * play so closing it can return focus to the tile that opened it. Each video also links to its
 * YouTube page when the id is valid.
 */
@Component({
  selector: 'app-video-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, VideoCard, VideoModal, TranslatePipe],
  template: `
    <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      @for (video of videos(); track video.id) {
        <li>
          <app-video-card
            [youtubeId]="video.youtubeId"
            [title]="title(video)"
            (watch)="play(video)"
          />
          @if (watchUrl(video); as url) {
            <a
              [href]="url"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
            >
              {{ 'videos.watchOnYoutube' | t }}
              <app-icon name="external" [size]="14" />
              <span class="sr-only">({{ title(video) }}) {{ 'common.externalLink' | t }}</span>
            </a>
          }
        </li>
      }
    </ul>
    @if (current(); as video) {
      <app-video-modal [youtubeId]="video.youtubeId" [title]="title(video)" [(open)]="open" />
    }
  `,
})
export class VideoGallery {
  private readonly language = inject(LanguageService);

  readonly videos = input.required<readonly SchoolVideo[]>();

  protected readonly current = signal<SchoolVideo | null>(null);
  protected readonly open = signal(false);

  protected title(video: SchoolVideo): string {
    return pickLocalized(video.title, this.language.lang());
  }

  protected watchUrl(video: SchoolVideo): string | null {
    return youtubeWatchUrl(video.youtubeId);
  }

  protected play(video: SchoolVideo): void {
    this.current.set(video);
    this.open.set(true);
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../../core/i18n/language.service';
import { pickLocalized } from '../../../core/i18n/localized';
import { SchoolVideo } from '../../../core/models/video.model';
import { VideoService } from '../../../core/services/video.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { VideoCard } from '../../../shared/components/video/video-card';
import { VideoModal } from '../../../shared/components/video/video-modal';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-videos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, VideoCard, VideoModal, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section [title]="'nav.videos' | t" [link]="'videos' | pagePath">
      <app-async-state
        [status]="videos.status()"
        [empty]="videos.value().length === 0"
        emptyIcon="video"
        (retry)="videos.reload()"
      >
        <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (video of videos.value(); track video.id) {
            <li>
              <app-video-card
                [youtubeId]="video.youtubeId"
                [title]="title(video)"
                (watch)="play(video)"
              />
            </li>
          }
        </ul>
        @if (current(); as video) {
          <app-video-modal [youtubeId]="video.youtubeId" [title]="title(video)" [(open)]="open" />
        }
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeVideos {
  private readonly service = inject(VideoService);
  private readonly language = inject(LanguageService);

  /** The last video the visitor chose; the dialog stays mounted so focus returns to its opener. */
  protected readonly current = signal<SchoolVideo | null>(null);
  protected readonly open = signal(false);
  protected readonly videos = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly SchoolVideo[],
  });

  protected play(video: SchoolVideo): void {
    this.current.set(video);
    this.open.set(true);
  }

  protected title(video: SchoolVideo): string {
    return pickLocalized(video.title, this.language.lang());
  }
}

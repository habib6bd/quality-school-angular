import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SchoolVideo } from '../../../core/models/video.model';
import { VideoService } from '../../../core/services/video.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { VideoGallery } from '../../../shared/components/video/video-gallery';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-videos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, VideoGallery, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section [title]="'nav.videos' | t" [link]="'videos' | pagePath">
      <app-async-state
        [status]="videos.status()"
        [empty]="videos.value().length === 0"
        emptyIcon="video"
        (retry)="videos.reload()"
      >
        <app-video-gallery [videos]="videos.value()" />
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeVideos {
  private readonly service = inject(VideoService);

  protected readonly videos = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly SchoolVideo[],
  });
}

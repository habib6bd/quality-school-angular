import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SchoolVideo } from '../../core/models/video.model';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { VideoService } from '../../core/services/video.service';
import { AsyncState } from '../../shared/components/async-state/async-state';
import { Icon } from '../../shared/components/icon/icon';
import { PageScaffold } from '../../shared/components/page-scaffold/page-scaffold';
import { VideoGallery } from '../../shared/components/video/video-gallery';
import { ButtonDirective } from '../../shared/directives/button.directive';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-videos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ButtonDirective, Icon, PageScaffold, VideoGallery, TranslatePipe],
  template: `
    <app-page-scaffold page="videos" [intro]="'videos.intro' | t">
      <app-async-state
        [status]="videos.status()"
        [empty]="videos.value().length === 0"
        emptyIcon="video"
        (retry)="videos.reload()"
      >
        <app-video-gallery [videos]="videos.value()" />
      </app-async-state>
      @if (channel(); as url) {
        <div class="mt-10">
          <a appButton variant="outline" [href]="url" target="_blank" rel="noopener noreferrer">
            <app-icon name="youtube" [size]="18" /> {{ 'videos.channel' | t }}
            <app-icon name="external" [size]="14" />
            <span class="sr-only">{{ 'common.externalLink' | t }}</span>
          </a>
        </div>
      }
    </app-page-scaffold>
  `,
})
export class VideosPage {
  private readonly service = inject(VideoService);
  private readonly info = inject(SchoolInfoService).info;

  protected readonly videos = rxResource({
    stream: () => this.service.list(),
    defaultValue: [] as readonly SchoolVideo[],
  });
  /** The school's YouTube channel, from the verified social links. */
  protected readonly channel = computed(
    () => this.info().social.find((s) => s.network === 'youtube')?.url ?? null,
  );
}

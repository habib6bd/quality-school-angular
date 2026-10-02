import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Notice } from '../../../core/models/notice.model';
import { NoticeService } from '../../../core/services/notice.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { NoticeCard } from '../../../shared/components/notice-card/notice-card';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-notices',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, NoticeCard, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section [title]="'home.noticesTitle' | t" [link]="'notices' | pagePath">
      <app-async-state
        [status]="notices.status()"
        [empty]="notices.value().length === 0"
        [emptyTitle]="'notices.emptyTitle' | t"
        [emptyMessage]="'notices.emptyMessage' | t"
        emptyIcon="bell"
        (retry)="notices.reload()"
      >
        <ul class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (notice of notices.value(); track notice.slug) {
            <li>
              <app-notice-card [notice]="notice" [link]="'notices' | pagePath: notice.slug" />
            </li>
          }
        </ul>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeNotices {
  private readonly service = inject(NoticeService);

  protected readonly notices = rxResource({
    stream: () => this.service.latest(3),
    defaultValue: [] as readonly Notice[],
  });
}

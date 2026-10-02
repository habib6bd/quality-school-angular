import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Teacher } from '../../../core/models/teacher.model';
import { TeacherService } from '../../../core/services/teacher.service';
import { AsyncState } from '../../../shared/components/async-state/async-state';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { TeacherCard } from '../../../shared/components/teacher-card/teacher-card';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-teachers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncState, ContentSection, TeacherCard, PagePathPipe, TranslatePipe],
  template: `
    <app-content-section
      [title]="'nav.teachers' | t"
      [description]="'home.teachersDescription' | t"
      [link]="'teachers' | pagePath"
    >
      <app-async-state
        [status]="teachers.status()"
        [empty]="teachers.value().length === 0"
        [skeletonCount]="4"
        (retry)="teachers.reload()"
      >
        <ul class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          @for (teacher of teachers.value(); track teacher.slug) {
            <li><app-teacher-card [teacher]="teacher" /></li>
          }
        </ul>
      </app-async-state>
    </app-content-section>
  `,
})
export class HomeTeachers {
  private readonly service = inject(TeacherService);

  protected readonly teachers = rxResource({
    stream: () => this.service.preview(4),
    defaultValue: [] as readonly Teacher[],
  });
}

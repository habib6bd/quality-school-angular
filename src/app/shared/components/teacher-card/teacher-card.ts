import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Designation, Teacher } from '../../../core/models/teacher.model';
import { TranslationKey } from '../../../core/i18n/translation.service';
import { LocalizePipe } from '../../pipes/localize.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Avatar } from '../avatar/avatar';

export const DESIGNATION_LABELS: Record<Designation, TranslationKey> = {
  principal: 'teachers.designation.principal',
  teacher: 'teachers.designation.teacher',
  staff: 'teachers.designation.staff',
};

/** Staff card: approved photo when there is one, otherwise an initial-letter avatar. */
@Component({
  selector: 'app-teacher-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, Avatar, LocalizePipe, TranslatePipe],
  template: `
    <article class="card card-interactive flex h-full flex-col items-center p-5 text-center">
      @if (teacher().photo; as photo) {
        <img
          [ngSrc]="photo.src"
          [width]="photo.width"
          [height]="photo.height"
          [alt]="photo.alt | localize"
          class="size-20 rounded-full object-cover"
        />
      } @else {
        <app-avatar [name]="teacher().name" size="lg" />
      }
      <h3 class="mt-4 text-lg" lang="en">
        @if (link(); as commands) {
          <a [routerLink]="commands" class="after:absolute after:inset-0 hover:underline">{{
            teacher().name
          }}</a>
        } @else {
          {{ teacher().name }}
        }
      </h3>
      <p class="mt-1 text-sm font-medium text-primary-800">{{ label() | t }}</p>
    </article>
  `,
  host: { class: 'relative block' },
})
export class TeacherCard {
  readonly teacher = input.required<Teacher>();
  /** Router commands of the detail page; omit for a card without a link. */
  readonly link = input<readonly string[]>();

  protected readonly label = computed(() => DESIGNATION_LABELS[this.teacher().designation]);
}

import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TEACHER_LIST } from '../repositories/content-repositories';
import { Designation, Teacher } from '../models/teacher.model';

export const DESIGNATION_ORDER: readonly Designation[] = ['principal', 'teacher', 'staff'];

/** Principal first, then teachers, then staff; inside a group by the school's serial, unordered last. */
export function compareTeachers(a: Teacher, b: Teacher): number {
  const byDesignation =
    DESIGNATION_ORDER.indexOf(a.designation) - DESIGNATION_ORDER.indexOf(b.designation);
  if (byDesignation) return byDesignation;
  const serial = (t: Teacher) => (t.serial > 0 ? t.serial : Number.MAX_SAFE_INTEGER);
  return serial(a) === serial(b) ? 0 : serial(a) < serial(b) ? -1 : 1;
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly repository = inject(TEACHER_LIST.token);

  list(): Observable<readonly Teacher[]> {
    return this.repository.list().pipe(map((all) => [...all].sort(compareTeachers)));
  }

  /** A few people for the homepage: the principal first, then ordered teachers. */
  preview(count: number): Observable<readonly Teacher[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }

  bySlug(slug: string): Observable<Teacher | undefined> {
    return this.list().pipe(map((all) => all.find((t) => t.slug === slug)));
  }
}

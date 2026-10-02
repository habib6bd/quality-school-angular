import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { CLASSES } from '../data/classes.data';
import { SchoolClass } from '../models/school-class.model';

export interface ClassDetail {
  item: SchoolClass;
  previous?: SchoolClass;
  next?: SchoolClass;
}

@Injectable({ providedIn: 'root' })
export class SchoolClassService {
  /** Classes in the school's published order, Play first. */
  list(): Observable<readonly SchoolClass[]> {
    return of([...CLASSES].sort((a, b) => a.order - b.order));
  }

  /** A class with its neighbours in the school's order, or `undefined` for an unknown slug. */
  bySlug(slug: string): Observable<ClassDetail | undefined> {
    return this.list().pipe(
      map((all) => {
        const index = all.findIndex((c) => c.slug === slug);
        return index < 0
          ? undefined
          : { item: all[index], previous: all[index - 1], next: all[index + 1] };
      }),
    );
  }
}

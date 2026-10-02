import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CLASSES } from '../data/classes.data';
import { SchoolClass } from '../models/school-class.model';

@Injectable({ providedIn: 'root' })
export class SchoolClassService {
  /** Classes in the school's published order, Play first. */
  list(): Observable<readonly SchoolClass[]> {
    return of([...CLASSES].sort((a, b) => a.order - b.order));
  }
}

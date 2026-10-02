import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResourceItem } from '../models/resource.model';

/** The school has not supplied any routines, syllabus, study material, forms or policies yet. */
const RESOURCES: readonly ResourceItem[] = [];

@Injectable({ providedIn: 'root' })
export class ResourceService {
  list(): Observable<readonly ResourceItem[]> {
    return of(RESOURCES);
  }
}

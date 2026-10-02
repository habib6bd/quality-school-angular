import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { NOTICES } from '../data/notices.data';
import { Notice } from '../models/notice.model';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  /** Newest first. */
  list(): Observable<readonly Notice[]> {
    return of([...NOTICES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
  }

  latest(count: number): Observable<readonly Notice[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }

  bySlug(slug: string): Observable<Notice | undefined> {
    return this.list().pipe(map((all) => all.find((n) => n.slug === slug)));
  }
}

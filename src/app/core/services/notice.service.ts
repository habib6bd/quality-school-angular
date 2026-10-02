import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NOTICE_LIST } from '../repositories/content-repositories';
import { Notice } from '../models/notice.model';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  private readonly repository = inject(NOTICE_LIST.token);

  /** Newest first. */
  list(): Observable<readonly Notice[]> {
    return this.repository
      .list()
      .pipe(map((all) => [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))));
  }

  latest(count: number): Observable<readonly Notice[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }

  bySlug(slug: string): Observable<Notice | undefined> {
    return this.list().pipe(map((all) => all.find((n) => n.slug === slug)));
  }
}

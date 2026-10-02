import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EVENT_LIST } from '../repositories/content-repositories';
import { SchoolEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly repository = inject(EVENT_LIST.token);

  /** Soonest first. */
  list(): Observable<readonly SchoolEvent[]> {
    return this.repository
      .list()
      .pipe(map((all) => [...all].sort((a, b) => a.startDate.localeCompare(b.startDate))));
  }

  /** Events that have not ended before `today` (ISO date). */
  upcoming(today: string, count?: number): Observable<readonly SchoolEvent[]> {
    return this.list().pipe(
      map((all) => all.filter((e) => (e.endDate ?? e.startDate) >= today).slice(0, count)),
    );
  }

  /** Events that ended before `today` (ISO date), most recent first. */
  past(today: string): Observable<readonly SchoolEvent[]> {
    return this.list().pipe(
      map((all) =>
        all
          .filter((e) => (e.endDate ?? e.startDate) < today)
          .sort((a, b) => b.startDate.localeCompare(a.startDate)),
      ),
    );
  }

  bySlug(slug: string): Observable<SchoolEvent | undefined> {
    return this.list().pipe(map((all) => all.find((e) => e.slug === slug)));
  }
}

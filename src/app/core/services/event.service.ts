import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { SchoolEvent } from '../models/event.model';

/** No events have been published by the school yet, so the list is honestly empty. */
const EVENTS: readonly SchoolEvent[] = [];

@Injectable({ providedIn: 'root' })
export class EventService {
  /** Soonest first. */
  list(): Observable<readonly SchoolEvent[]> {
    return of([...EVENTS].sort((a, b) => a.startDate.localeCompare(b.startDate)));
  }

  /** Events that have not ended before `today` (ISO date). */
  upcoming(today: string, count?: number): Observable<readonly SchoolEvent[]> {
    return this.list().pipe(
      map((all) => all.filter((e) => (e.endDate ?? e.startDate) >= today).slice(0, count)),
    );
  }

  bySlug(slug: string): Observable<SchoolEvent | undefined> {
    return this.list().pipe(map((all) => all.find((e) => e.slug === slug)));
  }
}

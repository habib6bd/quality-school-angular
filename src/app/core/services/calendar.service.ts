import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CalendarEvent } from '../models/calendar.model';

/** The academic calendar has not been published by the school, so there are no entries. */
const CALENDAR: readonly CalendarEvent[] = [];

@Injectable({ providedIn: 'root' })
export class CalendarService {
  list(): Observable<readonly CalendarEvent[]> {
    return of(CALENDAR);
  }
}

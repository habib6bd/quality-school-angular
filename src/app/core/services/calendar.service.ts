import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CALENDAR_LIST } from '../repositories/content-repositories';
import { CalendarEvent } from '../models/calendar.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly repository = inject(CALENDAR_LIST.token);

  list(): Observable<readonly CalendarEvent[]> {
    return this.repository.list();
  }
}

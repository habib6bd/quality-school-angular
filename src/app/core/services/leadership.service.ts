import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LEADER_MESSAGES } from '../data/leadership.data';
import { LeaderMessage } from '../models/leader-message.model';

@Injectable({ providedIn: 'root' })
export class LeadershipService {
  messages(): Observable<readonly LeaderMessage[]> {
    return of(LEADER_MESSAGES);
  }
}

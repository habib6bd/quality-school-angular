import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LEADER_MESSAGE_LIST } from '../repositories/content-repositories';
import { LeaderMessage } from '../models/leader-message.model';

@Injectable({ providedIn: 'root' })
export class LeadershipService {
  private readonly repository = inject(LEADER_MESSAGE_LIST.token);

  messages(): Observable<readonly LeaderMessage[]> {
    return this.repository.list();
  }
}

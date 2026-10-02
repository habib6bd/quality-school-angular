import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContactMessage } from '../models/contact-message.model';

/**
 * Hands a contact message to the school. There is no endpoint yet, so this is a prototype: the
 * message is not sent, stored or logged anywhere and the call always "succeeds". Phase 15 can
 * replace it with a repository that posts to the school's API; the page already handles an
 * error from `send`.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  send(message: ContactMessage): Observable<void> {
    void message;
    return of(undefined);
  }
}

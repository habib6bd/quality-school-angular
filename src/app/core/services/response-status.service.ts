import { inject, Injectable, RESPONSE_INIT } from '@angular/core';

/**
 * Lets a page tell the server what HTTP status to send. Detail pages (a class, a teacher, a
 * notice…) are matched by the router even for unknown slugs, so they report 404 themselves.
 * A no-op in the browser, where there is no response to change.
 */
@Injectable({ providedIn: 'root' })
export class ResponseStatusService {
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  notFound(): void {
    if (this.responseInit) this.responseInit.status = 404;
  }
}

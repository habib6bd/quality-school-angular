import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResultLookup, ResultOptions, ResultQuery } from '../models/result.model';

/**
 * Results lookup. No results system is connected yet, so options are empty and every lookup is
 * "unavailable"; nothing is read, stored or logged. Phase 15 swaps this for a repository that
 * calls the school's API; only the rows the API returns are ever displayed.
 */
@Injectable({ providedIn: 'root' })
export class ResultService {
  options(): Observable<ResultOptions> {
    return of({ exams: [], years: [] });
  }

  lookup(query: ResultQuery): Observable<ResultLookup> {
    void query;
    return of({ status: 'unavailable' });
  }
}

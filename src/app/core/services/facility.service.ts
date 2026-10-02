import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { FACILITIES } from '../data/facilities.data';
import { Facility } from '../models/facility.model';

@Injectable({ providedIn: 'root' })
export class FacilityService {
  list(): Observable<readonly Facility[]> {
    return of(FACILITIES);
  }

  highlights(): Observable<readonly Facility[]> {
    return this.list().pipe(map((items) => items.filter((item) => item.highlight)));
  }
}

import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FACILITY_LIST } from '../repositories/content-repositories';
import { Facility } from '../models/facility.model';

@Injectable({ providedIn: 'root' })
export class FacilityService {
  private readonly repository = inject(FACILITY_LIST.token);

  list(): Observable<readonly Facility[]> {
    return this.repository.list();
  }

  highlights(): Observable<readonly Facility[]> {
    return this.list().pipe(map((items) => items.filter((item) => item.highlight)));
  }
}

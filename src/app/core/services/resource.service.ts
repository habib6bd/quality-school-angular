import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RESOURCE_LIST } from '../repositories/content-repositories';
import { ResourceItem } from '../models/resource.model';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly repository = inject(RESOURCE_LIST.token);

  list(): Observable<readonly ResourceItem[]> {
    return this.repository.list();
  }
}

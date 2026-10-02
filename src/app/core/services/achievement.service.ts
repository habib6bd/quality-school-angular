import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ACHIEVEMENT_LIST } from '../repositories/content-repositories';
import { Achievement } from '../models/achievement.model';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly repository = inject(ACHIEVEMENT_LIST.token);

  list(): Observable<readonly Achievement[]> {
    return this.repository.list();
  }
}

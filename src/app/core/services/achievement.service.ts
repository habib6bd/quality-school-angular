import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Achievement } from '../models/achievement.model';

/** The school has not published any verified achievements yet, so the list is empty. */
const ACHIEVEMENTS: readonly Achievement[] = [];

@Injectable({ providedIn: 'root' })
export class AchievementService {
  list(): Observable<readonly Achievement[]> {
    return of(ACHIEVEMENTS);
  }
}

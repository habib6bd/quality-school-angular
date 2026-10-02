import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VIDEO_LIST } from '../repositories/content-repositories';
import { SchoolVideo } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly repository = inject(VIDEO_LIST.token);

  list(): Observable<readonly SchoolVideo[]> {
    return this.repository.list();
  }
}

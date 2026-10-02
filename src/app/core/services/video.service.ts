import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VIDEOS } from '../data/videos.data';
import { SchoolVideo } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  list(): Observable<readonly SchoolVideo[]> {
    return of(VIDEOS);
  }
}

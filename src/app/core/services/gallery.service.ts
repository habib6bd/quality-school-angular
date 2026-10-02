import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GALLERY_LIST } from '../repositories/content-repositories';
import { GalleryCategory, GalleryItem } from '../models/gallery.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly repository = inject(GALLERY_LIST.token);

  list(category?: GalleryCategory): Observable<readonly GalleryItem[]> {
    return this.repository
      .list()
      .pipe(map((all) => (category ? all.filter((item) => item.category === category) : all)));
  }

  featured(count: number): Observable<readonly GalleryItem[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }
}

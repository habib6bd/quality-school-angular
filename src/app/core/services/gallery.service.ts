import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { GALLERY } from '../data/gallery.data';
import { GalleryCategory, GalleryItem } from '../models/gallery.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  list(category?: GalleryCategory): Observable<readonly GalleryItem[]> {
    return of(category ? GALLERY.filter((item) => item.category === category) : GALLERY);
  }

  featured(count: number): Observable<readonly GalleryItem[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }
}

import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { NEWS } from '../data/news.data';
import { NewsArticle } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  list(): Observable<readonly NewsArticle[]> {
    return of([...NEWS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
  }

  bySlug(slug: string): Observable<NewsArticle | undefined> {
    return this.list().pipe(map((all) => all.find((n) => n.slug === slug)));
  }
}

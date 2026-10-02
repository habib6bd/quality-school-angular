import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NEWS_LIST } from '../repositories/content-repositories';
import { NewsArticle } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly repository = inject(NEWS_LIST.token);

  list(): Observable<readonly NewsArticle[]> {
    return this.repository
      .list()
      .pipe(map((all) => [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))));
  }

  bySlug(slug: string): Observable<NewsArticle | undefined> {
    return this.list().pipe(map((all) => all.find((n) => n.slug === slug)));
  }
}

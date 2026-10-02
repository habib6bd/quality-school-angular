import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FAQ_LIST } from '../repositories/content-repositories';
import { FaqCategory, FaqItem } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly repository = inject(FAQ_LIST.token);

  list(...categories: FaqCategory[]): Observable<readonly FaqItem[]> {
    return this.repository
      .list()
      .pipe(
        map((all) =>
          categories.length ? all.filter((faq) => categories.includes(faq.category)) : all,
        ),
      );
  }

  preview(count: number): Observable<readonly FaqItem[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }
}

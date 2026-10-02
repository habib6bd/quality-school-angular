import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { FAQS } from '../data/faqs.data';
import { FaqCategory, FaqItem } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  list(...categories: FaqCategory[]): Observable<readonly FaqItem[]> {
    return of(categories.length ? FAQS.filter((faq) => categories.includes(faq.category)) : FAQS);
  }

  preview(count: number): Observable<readonly FaqItem[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }
}

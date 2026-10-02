import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { FAQS } from '../data/faqs.data';
import { FaqItem } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  list(): Observable<readonly FaqItem[]> {
    return of(FAQS);
  }

  preview(count: number): Observable<readonly FaqItem[]> {
    return this.list().pipe(map((all) => all.slice(0, count)));
  }
}

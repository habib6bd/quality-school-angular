import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Testimonial } from '../models/testimonial.model';

/** No guardian review has been verified or approved for publication, so the list is empty. */
const TESTIMONIALS: readonly Testimonial[] = [];

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  list(): Observable<readonly Testimonial[]> {
    return of(TESTIMONIALS);
  }
}

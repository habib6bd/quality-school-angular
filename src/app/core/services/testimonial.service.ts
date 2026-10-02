import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TESTIMONIAL_LIST } from '../repositories/content-repositories';
import { Testimonial } from '../models/testimonial.model';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private readonly repository = inject(TESTIMONIAL_LIST.token);

  list(): Observable<readonly Testimonial[]> {
    return this.repository.list();
  }
}

import { Injectable, signal } from '@angular/core';
import { SCHOOL_INFO } from '../data/school-info.data';
import { SchoolInfo } from '../models/school-info.model';

/** Static school facts. Kept synchronous: they are needed on every page, including the shell. */
@Injectable({ providedIn: 'root' })
export class SchoolInfoService {
  readonly info = signal<SchoolInfo>(SCHOOL_INFO).asReadonly();
}

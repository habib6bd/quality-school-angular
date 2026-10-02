import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AchievementService } from './achievement.service';
import { EventService } from './event.service';
import { FacilityService } from './facility.service';
import { GalleryService } from './gallery.service';
import { NewsService } from './news.service';
import { NoticeService } from './notice.service';
import { SchoolClassService } from './school-class.service';
import { compareTeachers, TeacherService } from './teacher.service';
import { TestimonialService } from './testimonial.service';
import { Teacher } from '../models/teacher.model';

const person = (over: Partial<Teacher>): Teacher => ({
  slug: 'x',
  name: 'X',
  designation: 'teacher',
  serial: 0,
  photo: null,
  ...over,
});

describe('TeacherService', () => {
  it('lists the principal first, then teachers, then staff', async () => {
    const list = await firstValueFrom(TestBed.inject(TeacherService).list());
    expect(list[0].designation).toBe('principal');
    const order = list.map((t) => t.designation);
    expect(order.lastIndexOf('principal')).toBeLessThan(order.indexOf('teacher'));
    expect(order.lastIndexOf('teacher')).toBeLessThan(order.indexOf('staff'));
  });

  it('puts unordered (serial 0) people after ordered ones in the same group', () => {
    const sorted = [
      person({ slug: 'a', serial: 0 }),
      person({ slug: 'b', serial: 3 }),
      person({ slug: 'c', serial: 1 }),
    ].sort(compareTeachers);
    expect(sorted.map((t) => t.slug)).toEqual(['c', 'b', 'a']);
  });

  it('previews a limited number of people and finds one by slug', async () => {
    const service = TestBed.inject(TeacherService);
    expect(await firstValueFrom(service.preview(4))).toHaveLength(4);
    const found = await firstValueFrom(service.bySlug('salma-alam-sonia'));
    expect(found?.name).toBe('Salma Alam Sonia');
    expect(await firstValueFrom(service.bySlug('nobody'))).toBeUndefined();
  });

  it('exposes no private fields', async () => {
    const [first] = await firstValueFrom(TestBed.inject(TeacherService).list());
    expect(Object.keys(first).sort()).toEqual(['designation', 'name', 'photo', 'serial', 'slug']);
  });
});

describe('NoticeService', () => {
  it('returns the real admission notice, newest first, with its attachment', async () => {
    const service = TestBed.inject(NoticeService);
    const [notice] = await firstValueFrom(service.latest(3));
    expect(notice.slug).toBe('admission-2026');
    expect(notice.attachments[0].src).toBe('images/bqes/notices/admission-2026.webp');
    expect(await firstValueFrom(service.bySlug('admission-2026'))).toBe(notice);
  });
});

describe('SchoolClassService', () => {
  it('lists Play to Ten with groups only in Nine and Ten', async () => {
    const classes = await firstValueFrom(TestBed.inject(SchoolClassService).list());
    expect(classes).toHaveLength(13);
    expect(classes[0].name.en).toBe('Play');
    expect(classes.filter((c) => c.groups.length).map((c) => c.slug)).toEqual(['nine', 'ten']);
  });
});

describe('FacilityService', () => {
  it('returns highlights as a subset of the facilities', async () => {
    const service = TestBed.inject(FacilityService);
    const all = await firstValueFrom(service.list());
    const highlights = await firstValueFrom(service.highlights());
    expect(highlights.length).toBeGreaterThan(0);
    expect(highlights.length).toBeLessThan(all.length);
  });
});

describe('GalleryService', () => {
  it('limits featured photos and filters by category', async () => {
    const service = TestBed.inject(GalleryService);
    expect(await firstValueFrom(service.featured(3))).toHaveLength(3);
    const sports = await firstValueFrom(service.list('annual-sports'));
    expect(sports.every((item) => item.category === 'annual-sports')).toBe(true);
  });
});

describe('services without published content', () => {
  it('honestly return empty lists instead of invented items', async () => {
    expect(await firstValueFrom(TestBed.inject(NewsService).list())).toEqual([]);
    expect(await firstValueFrom(TestBed.inject(EventService).list())).toEqual([]);
    expect(await firstValueFrom(TestBed.inject(EventService).upcoming('2026-01-01'))).toEqual([]);
    expect(await firstValueFrom(TestBed.inject(AchievementService).list())).toEqual([]);
    expect(await firstValueFrom(TestBed.inject(TestimonialService).list())).toEqual([]);
  });
});

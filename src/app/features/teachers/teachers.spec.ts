import { Type } from '@angular/core';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { Teacher } from '../../core/models/teacher.model';
import { filterTeachers, isDesignation, TeachersPage } from './teachers';
import { TeacherDetailPage } from './teacher-detail';

const person = (over: Partial<Teacher>): Teacher => ({
  slug: 'x',
  name: 'X',
  designation: 'teacher',
  serial: 0,
  photo: null,
  ...over,
});

describe('filterTeachers', () => {
  const all = [
    person({ slug: 'a', name: 'Salma Alam Sonia' }),
    person({ slug: 'b', name: 'Abu Sufian Bappy', designation: 'staff' }),
    person({ slug: 'c', name: 'Sk. Md. Abdullah Al Mizan', designation: 'principal' }),
  ];

  it('filters by designation', () => {
    expect(filterTeachers(all, 'staff', '').map((t) => t.slug)).toEqual(['b']);
    expect(filterTeachers(all, 'all', '')).toHaveLength(3);
  });

  it('searches names case-insensitively and ignores surrounding spaces', () => {
    expect(filterTeachers(all, 'all', '  SONIA ').map((t) => t.slug)).toEqual(['a']);
  });

  it('combines both filters and can return nothing', () => {
    expect(filterTeachers(all, 'staff', 'sonia')).toEqual([]);
  });

  it('validates designation values from the URL', () => {
    expect(isDesignation('teacher')).toBe(true);
    expect(isDesignation('headmaster')).toBe(false);
    expect(isDesignation(undefined)).toBe(false);
  });
});

async function render(
  component: Type<unknown>,
  lang: Lang,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...(providers as never[])] });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(component);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('TeachersPage', () => {
  it('lists all 28 published people as cards linking to their profiles', async () => {
    const el = await render(TeachersPage, 'en');
    expect(el.querySelectorAll('app-teacher-card')).toHaveLength(28);
    expect(el.querySelector('app-teacher-card a')?.getAttribute('href')).toBe(
      '/en/teachers/md-abdullah-al-mizan',
    );
    expect(el.textContent).toContain('Showing 28 of 28');
  });

  it('puts the principal first and shows English names on the Bangla page', async () => {
    const el = await render(TeachersPage, 'bn');
    const first = el.querySelector('app-teacher-card');
    expect(first?.textContent).toContain('Sk. Md. Abdullah Al Mizan');
    expect(first?.textContent).toContain('প্রধান শিক্ষক');
    expect(el.textContent).toContain('২৮ জনের মধ্যে ২৮ জন');
  });

  it('shows per-designation counts on the filter chips', async () => {
    const el = await render(TeachersPage, 'en');
    const chips = Array.from(el.querySelectorAll('nav[aria-label="Filter by designation"] a')).map(
      (a) => a.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(chips).toEqual(['Everyone 28', 'Principal 1', 'Teacher 23', 'Staff 4']);
  });

  it('applies the designation filter from the URL and marks the active chip', async () => {
    const el = await render(TeachersPage, 'en', { designation: 'staff' });
    expect(el.querySelectorAll('app-teacher-card')).toHaveLength(4);
    expect(
      el.querySelector('nav[aria-label="Filter by designation"] a[aria-current="true"]')
        ?.textContent,
    ).toContain('Staff');
    expect(el.textContent).toContain('Showing 4 of 28');
  });

  it('ignores an invalid designation instead of showing nothing', async () => {
    const el = await render(TeachersPage, 'en', { designation: 'janitor' });
    expect(el.querySelectorAll('app-teacher-card')).toHaveLength(28);
  });

  it('searches by name from the URL', async () => {
    const el = await render(TeachersPage, 'en', { q: 'habibur' });
    expect(el.querySelectorAll('app-teacher-card')).toHaveLength(2);
  });

  it('shows an empty state with a way back when nothing matches', async () => {
    const el = await render(TeachersPage, 'en', { designation: 'principal', q: 'zzz' });
    expect(el.querySelectorAll('app-teacher-card')).toHaveLength(0);
    expect(el.textContent).toContain('No one found');
    expect(el.querySelector('app-empty-state a')?.getAttribute('href')).toBe('/en/teachers');
  });
});

describe('TeacherDetailPage', () => {
  it('shows the published name and designation, an avatar and a pending note', async () => {
    const el = await render(TeacherDetailPage, 'en', { slug: 'salma-alam-sonia' });
    expect(el.querySelector('h1')?.textContent).toContain('Salma Alam Sonia');
    expect(el.querySelector('app-avatar')?.textContent?.trim()).toBe('S');
    expect(el.textContent).toContain('Teacher');
    expect(el.querySelector('app-pending-note')).not.toBeNull();
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Salma Alam Sonia');
  });

  it('publishes nothing private: no phone, e-mail or date of birth', async () => {
    const el = await render(TeacherDetailPage, 'en', { slug: 'salma-alam-sonia' });
    expect(el.querySelector('a[href^="tel:"], a[href^="mailto:"]')).toBeNull();
    expect(el.textContent).not.toMatch(/\d{5,}/);
  });

  it('reports a 404 for an unknown person', async () => {
    const init: ResponseInit = { status: 200 };
    const el = await render(TeacherDetailPage, 'bn', { slug: 'nobody' }, [
      { provide: RESPONSE_INIT, useValue: init },
    ]);
    expect(el.querySelector('h1')?.textContent).toContain('পৃষ্ঠাটি পাওয়া যায়নি');
    expect(init.status).toBe(404);
  });
});

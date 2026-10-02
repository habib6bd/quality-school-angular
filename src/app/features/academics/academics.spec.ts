import { Type } from '@angular/core';
import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { firstValueFrom } from 'rxjs';
import { SchoolClassService } from '../../core/services/school-class.service';
import { ClassDetailPage } from './class-detail';
import { AcademicsPage } from './overview';
import { ProgramsPage } from './programs';

async function render(
  component: Type<unknown>,
  lang: Lang = 'bn',
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

describe('SchoolClassService.bySlug', () => {
  it('returns neighbours in the school order and undefined for unknown slugs', async () => {
    const service = TestBed.inject(SchoolClassService);
    const play = await firstValueFrom(service.bySlug('play'));
    expect(play?.previous).toBeUndefined();
    expect(play?.next?.slug).toBe('nursery');
    const ten = await firstValueFrom(service.bySlug('ten'));
    expect(ten?.previous?.slug).toBe('nine');
    expect(ten?.next).toBeUndefined();
    expect(await firstValueFrom(service.bySlug('eleven'))).toBeUndefined();
  });
});

describe('Academics pages', () => {
  it('overview: counts the classes and states what is still to come', async () => {
    const bn = await render(AcademicsPage, 'bn');
    expect(bn.querySelectorAll('h1')).toHaveLength(1);
    expect(bn.textContent).toContain('প্লে থেকে দশম পর্যন্ত ১৩টি শ্রেণি');
    expect(bn.querySelector('app-pending-note')).not.toBeNull();
    TestBed.resetTestingModule();
    const en = await render(AcademicsPage, 'en');
    expect(en.textContent).toContain('13 classes, from Play to Class Ten');
    expect(en.querySelectorAll('nav a[href^="/en/"]').length).toBeGreaterThanOrEqual(6);
  });

  it('programs: links all 13 classes to their information pages', async () => {
    const el = await render(ProgramsPage, 'en');
    const hrefs = Array.from(
      el.querySelectorAll('section[aria-labelledby="classes-title"] li h3 a'),
    ).map((a) => a.getAttribute('href'));
    expect(hrefs).toHaveLength(13);
    expect(hrefs[0]).toBe('/en/academics/programs/play');
    expect(hrefs[12]).toBe('/en/academics/programs/ten');
    expect(el.textContent?.replace(/\s+/g, ' ')).toContain('Science · Business Studies');
  });

  describe('class detail', () => {
    it('shows the class, its groups and neighbours, with the class as heading and breadcrumb', async () => {
      const el = await render(ClassDetailPage, 'en', { slug: 'nine' });
      expect(el.querySelector('h1')?.textContent).toContain('Class Nine');
      expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('Class Nine');
      expect(el.textContent).toContain('Number 12 counting from Play');
      const groups = Array.from(el.querySelectorAll('#class-groups + ul li')).map((li) =>
        li.textContent?.trim(),
      );
      expect(groups).toEqual(['Science', 'Business Studies']);
      expect(el.querySelector('a[href="/en/academics/programs/eight"]')).not.toBeNull();
      expect(el.querySelector('a[href="/en/academics/programs/ten"]')).not.toBeNull();
      expect(el.querySelector('app-pending-note')).not.toBeNull();
    });

    it('says there are no groups for classes without any', async () => {
      const el = await render(ClassDetailPage, 'bn', { slug: 'five' });
      expect(el.querySelector('h1')?.textContent).toContain('পঞ্চম শ্রেণি');
      expect(el.textContent).toContain('আলাদা বিভাগ নেই');
    });

    it('renders the not-found page and reports a 404 for an unknown class', async () => {
      const init: ResponseInit = { status: 200 };
      const el = await render(ClassDetailPage, 'en', { slug: 'nope' }, [
        { provide: RESPONSE_INIT, useValue: init },
      ]);
      expect(el.querySelector('h1')?.textContent).toContain('Page not found');
      expect(init.status).toBe(404);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { Notice } from '../../core/models/notice.model';
import { Teacher } from '../../core/models/teacher.model';
import { NoticeCard } from './notice-card/notice-card';
import { TeacherCard } from './teacher-card/teacher-card';

const teacher: Teacher = {
  slug: 'nasrin-akter',
  name: 'Nasrin Akter',
  designation: 'teacher',
  serial: 11,
  photo: null,
};

describe('TeacherCard', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('shows an initial avatar, the English name and a localized designation', () => {
    const fixture = TestBed.createComponent(TeacherCard);
    fixture.componentRef.setInput('teacher', teacher);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-avatar')?.textContent?.trim()).toBe('N');
    expect(el.querySelector('h3')?.getAttribute('lang')).toBe('en');
    expect(el.textContent).toContain('Nasrin Akter');
    expect(el.textContent).toContain('শিক্ষক');
  });

  it('links the name only when a detail link is given', () => {
    const fixture = TestBed.createComponent(TeacherCard);
    fixture.componentRef.setInput('teacher', teacher);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a')).toBeNull();
    fixture.componentRef.setInput('link', ['/', 'bn', 'teachers', teacher.slug]);
    fixture.detectChanges();
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/bn/teachers/nasrin-akter');
  });
});

describe('NoticeCard', () => {
  const notice: Notice = {
    slug: 'n1',
    title: { bn: 'শিরোনাম', en: 'Title' },
    summary: { bn: 'সারাংশ' },
    category: 'admission',
    publishedAt: '2025-11-19',
    attachments: [],
  };

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('shows category, a machine-readable date and the title as a link', () => {
    const fixture = TestBed.createComponent(NoticeCard);
    fixture.componentRef.setInput('notice', notice);
    fixture.componentRef.setInput('link', ['/', 'bn', 'notices']);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('ভর্তি');
    expect(el.querySelector('time')?.getAttribute('datetime')).toBe('2025-11-19');
    expect(el.querySelector('time')?.textContent).toContain('২০২৫');
    expect(el.querySelector('h3 a')?.textContent).toContain('শিরোনাম');
  });

  it('marks Bangla fallback text on the English page', () => {
    TestBed.inject(LanguageService).setLang('en');
    const fixture = TestBed.createComponent(NoticeCard);
    fixture.componentRef.setInput('notice', notice);
    fixture.componentRef.setInput('link', ['/', 'en', 'notices']);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h3')?.getAttribute('lang')).toBe('en');
    expect(el.querySelector('p')?.getAttribute('lang')).toBe('bn');
  });
});

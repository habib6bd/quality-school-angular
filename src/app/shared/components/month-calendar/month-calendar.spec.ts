import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../../core/i18n/language.service';
import { CalendarEvent } from '../../../core/models/calendar.model';
import { todayIso } from '../../../core/util/today';
import {
  monthKey,
  MonthCalendar,
  monthWeeks,
  occursOn,
  parseMonth,
  shiftMonth,
} from './month-calendar';

describe('month helpers', () => {
  it('parses only valid YYYY-MM values', () => {
    expect(parseMonth('2026-10')).toEqual({ year: 2026, month: 10 });
    for (const bad of ['2026-13', '2026-00', '2026-1', '26-10', 'abc', '', undefined, 5]) {
      expect(parseMonth(bad)).toBeNull();
    }
  });

  it('formats and shifts months across year boundaries', () => {
    expect(monthKey({ year: 2026, month: 3 })).toBe('2026-03');
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2026, month: 5 }, 14)).toEqual({ year: 2027, month: 7 });
  });

  it('builds whole Sunday-first weeks padded with neighbouring days', () => {
    const october = monthWeeks({ year: 2026, month: 10 }); // 1 Oct 2026 is a Thursday
    expect(october[0].map((c) => c.iso)).toEqual([
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
    expect(october[0].map((c) => c.inMonth)).toEqual([
      false,
      false,
      false,
      false,
      true,
      true,
      true,
    ]);
    expect(october.every((w) => w.length === 7)).toBe(true);
    expect(october.flat().filter((c) => c.inMonth)).toHaveLength(31);
  });

  it('uses four weeks for a February that starts on a Sunday', () => {
    const february = monthWeeks({ year: 2026, month: 2 }); // 1 Feb 2026 is a Sunday
    expect(february).toHaveLength(4);
    expect(february.flat().filter((c) => c.inMonth)).toHaveLength(28);
  });

  it('knows which days an event covers', () => {
    const event: CalendarEvent = {
      id: 'e',
      title: { bn: 'ক' },
      category: 'exam',
      startDate: '2026-10-05',
      endDate: '2026-10-07',
    };
    expect(occursOn(event, '2026-10-04')).toBe(false);
    expect(occursOn(event, '2026-10-05')).toBe(true);
    expect(occursOn(event, '2026-10-07')).toBe(true);
    expect(occursOn(event, '2026-10-08')).toBe(false);
    expect(occursOn({ ...event, endDate: undefined }, '2026-10-05')).toBe(true);
  });
});

describe('todayIso', () => {
  it('uses the calendar date in Dhaka, not UTC', () => {
    expect(todayIso(new Date('2026-10-02T20:30:00Z'))).toBe('2026-10-03'); // already 02:30 next day in Dhaka
    expect(todayIso(new Date('2026-10-02T10:00:00Z'))).toBe('2026-10-02');
  });
});

describe('MonthCalendar', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  function render(inputs: Record<string, unknown>, lang: 'bn' | 'en' = 'en') {
    TestBed.inject(LanguageService).setLang(lang);
    const fixture = TestBed.createComponent(MonthCalendar);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const exam: CalendarEvent = {
    id: 'x',
    title: { bn: 'পরীক্ষা', en: 'Exam' },
    category: 'exam',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
  };

  it('renders an accessible table with a caption, seven weekday headers and the month title', () => {
    const el = render({ month: { year: 2026, month: 10 }, today: '2026-10-02' });
    expect(el.querySelector('caption')?.textContent?.trim()).toBe('October 2026');
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('October 2026');
    const headers = Array.from(el.querySelectorAll('thead th'));
    expect(headers).toHaveLength(7);
    expect(headers.every((th) => th.getAttribute('scope') === 'col')).toBe(true);
    expect(headers[0].querySelector('abbr')?.getAttribute('title')).toBe('Sunday');
  });

  it('marks today with aria-current="date" and nothing else', () => {
    const el = render({ month: { year: 2026, month: 10 }, today: '2026-10-02' });
    const current = el.querySelectorAll('td[aria-current="date"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent?.trim()).toBe('2');
    expect(
      render({ month: { year: 2026, month: 11 }, today: '2026-10-02' }).querySelector(
        '[aria-current]',
      ),
    ).toBeNull();
  });

  it('shows Bangla month, weekday names and digits on Bangla pages', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const el = render({ month: { year: 2026, month: 10 }, today: '2026-10-02' }, 'bn');
    expect(el.querySelector('h2')?.textContent).toContain('অক্টোবর ২০২৬');
    expect(el.querySelector('tbody td')?.textContent?.trim()).toBe('২৭');
  });

  it('lists the events of the month and marks their days; says so when there are none', () => {
    const el = render({ month: { year: 2026, month: 10 }, events: [exam] });
    expect(el.querySelectorAll('#month-events + ul li')).toHaveLength(1);
    expect(el.querySelector('#month-events + ul')?.textContent).toContain('Exam');
    expect(el.querySelector('#month-events + ul')?.textContent).toContain('5 Oct');
    expect(el.querySelectorAll('tbody td span[aria-hidden="true"]')).toHaveLength(2);
    expect(render({ month: { year: 2026, month: 11 }, events: [exam] }).textContent).toContain(
      'No dates have been published for this month',
    );
  });

  it('links to the previous and next month through the URL', () => {
    const el = render({ month: { year: 2026, month: 1 } });
    const links = Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/?month=2025-12', '/?month=2026-02']);
    expect(el.querySelector('a')?.getAttribute('aria-label')).toBe('Previous month');
  });
});

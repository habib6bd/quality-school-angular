import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Lang } from '../core/i18n/lang';
import { LanguageService } from '../core/i18n/language.service';
import { CalendarEvent } from '../core/models/calendar.model';
import { ResourceItem } from '../core/models/resource.model';
import { ResultLookup, ResultOptions } from '../core/models/result.model';
import { CalendarService } from '../core/services/calendar.service';
import { ResourceService } from '../core/services/resource.service';
import { ResultService } from '../core/services/result.service';
import { CalendarPage } from './academics/calendar';
import { filterResources, ResourceFilters, ResourcesPage } from './resources/resources';
import { ResultsPage } from './results/results';

async function render(
  component: Type<unknown>,
  lang: Lang,
  inputs: Record<string, unknown> = {},
  providers: unknown[] = [],
): Promise<{ el: HTMLElement; detect: () => Promise<void> }> {
  TestBed.configureTestingModule({ providers: [provideRouter([]), ...(providers as never[])] });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(component);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  const detect = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await detect();
  return { el: fixture.nativeElement as HTMLElement, detect };
}

const set = (el: HTMLElement, selector: string, value: string, event = 'input') => {
  const control = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
  control.value = value;
  control.dispatchEvent(new Event(event));
};
const submit = async (el: HTMLElement, detect: () => Promise<void>) => {
  el.querySelector('form')!.dispatchEvent(new Event('submit'));
  await detect();
};

describe('CalendarPage', () => {
  it('shows the requested month, an honest placeholder and no invented dates', async () => {
    const { el } = await render(CalendarPage, 'en', { month: '2026-12' });
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('December 2026');
    expect(el.querySelector('app-pending-note')).not.toBeNull();
    expect(el.textContent).toContain('No dates have been published for this month');
  });

  it('falls back to the current month for a missing or invalid parameter', async () => {
    const current = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Dhaka',
    }).format(new Date());
    for (const month of [undefined, 'nonsense', '2026-99']) {
      TestBed.resetTestingModule();
      const { el } = await render(CalendarPage, 'en', { month });
      expect(el.querySelector('h2')?.textContent?.trim()).toBe(current);
    }
  });

  it('lists published entries of the month', async () => {
    const event: CalendarEvent = {
      id: 'a',
      title: { bn: 'ক', en: 'Mid-term' },
      category: 'exam',
      startDate: '2026-12-10',
    };
    const { el } = await render(CalendarPage, 'en', { month: '2026-12' }, [
      { provide: CalendarService, useValue: { list: () => of([event]) } },
    ]);
    expect(el.textContent).toContain('Mid-term');
  });
});

describe('ResultsPage', () => {
  it('explains that results are not online and keeps exam/year optional while unpublished', async () => {
    const { el, detect } = await render(ResultsPage, 'en');
    expect(el.querySelector('app-pending-note')?.textContent).toContain('not live yet');
    expect(el.textContent).toContain('The list of exams will appear here');
    set(el, '#results-classSlug', 'five', 'change');
    set(el, '#results-roll', '12');
    await submit(el, detect);
    expect(el.textContent).toContain('Online results are not available yet');
    expect(el.querySelector('a[href="/en/contact"]')).not.toBeNull();
  });

  it('validates class and roll number, accessibly', async () => {
    const { el, detect } = await render(ResultsPage, 'en');
    await submit(el, detect);
    const summary = el.querySelector('[role="alert"]');
    expect(summary?.querySelectorAll('li')).toHaveLength(2);
    expect(el.querySelector('#results-roll')?.getAttribute('aria-invalid')).toBe('true');
    set(el, '#results-classSlug', 'five', 'change');
    set(el, '#results-roll', 'abc');
    await submit(el, detect);
    expect(el.querySelector('#results-roll-error')?.textContent).toContain('digits only');
    set(el, '#results-roll', '১২৩');
    await submit(el, detect);
    expect(el.querySelector('#results-roll-error')).toBeNull();
  });

  const options: ResultOptions = {
    exams: [{ id: 'half', name: { bn: 'অর্ধবার্ষিক', en: 'Half-yearly' } }],
    years: [2025, 2026],
  };

  function stub(lookup: (q: unknown) => ReturnType<ResultService['lookup']>) {
    return [{ provide: ResultService, useValue: { options: () => of(options), lookup } }];
  }

  it('requires exam and year once the school has published choices', async () => {
    const { el, detect } = await render(
      ResultsPage,
      'en',
      {},
      stub(() => of({ status: 'unavailable' })),
    );
    set(el, '#results-classSlug', 'five', 'change');
    set(el, '#results-roll', '7');
    await submit(el, detect);
    const labels = Array.from(el.querySelectorAll('[role="alert"] li')).map((li) => li.textContent);
    expect(labels.join()).toContain('Exam');
    expect(labels.join()).toContain('Year');
    expect(
      Array.from(el.querySelectorAll('#results-examId option')).map((o) => o.textContent?.trim()),
    ).toEqual(['Choose…', 'Half-yearly']);
  });

  it('sends a normalized query and shows only the rows the service returns', async () => {
    const lookup = vi.fn(() =>
      of<ResultLookup>({
        status: 'found',
        rows: [{ label: { bn: 'জিপিএ', en: 'GPA' }, value: '4.50' }],
      }),
    );
    const { el, detect } = await render(ResultsPage, 'en', {}, stub(lookup));
    set(el, '#results-classSlug', 'ten', 'change');
    set(el, '#results-examId', 'half', 'change');
    set(el, '#results-year', '2026', 'change');
    set(el, '#results-roll', '  ০৪২ ');
    await submit(el, detect);
    expect(lookup).toHaveBeenCalledWith({
      classSlug: 'ten',
      examId: 'half',
      year: 2026,
      roll: '042',
    });
    const rows = el.querySelector('#result-title')?.closest('section');
    expect(rows?.textContent).toContain('GPA');
    expect(rows?.textContent).toContain('4.50');
    expect(rows?.querySelectorAll('dt')).toHaveLength(1);
  });

  it('handles not-found and service errors with a retry', async () => {
    const notFound = await render(
      ResultsPage,
      'en',
      {},
      stub(() => of({ status: 'not-found' })),
    );
    set(notFound.el, '#results-classSlug', 'five', 'change');
    set(notFound.el, '#results-examId', 'half', 'change');
    set(notFound.el, '#results-year', '2025', 'change');
    set(notFound.el, '#results-roll', '5');
    await submit(notFound.el, notFound.detect);
    expect(notFound.el.textContent).toContain('No result found');
    TestBed.resetTestingModule();

    let calls = 0;
    const failing = await render(
      ResultsPage,
      'en',
      {},
      stub(() => (++calls === 1 ? throwError(() => new Error('x')) : of({ status: 'not-found' }))),
    );
    set(failing.el, '#results-classSlug', 'five', 'change');
    set(failing.el, '#results-examId', 'half', 'change');
    set(failing.el, '#results-year', '2025', 'change');
    set(failing.el, '#results-roll', '5');
    await submit(failing.el, failing.detect);
    expect(failing.el.querySelector('[role="alert"]')?.textContent).toContain(
      'Something went wrong',
    );
    failing.el.querySelector<HTMLButtonElement>('app-error-state button')!.click();
    await failing.detect();
    expect(failing.el.textContent).toContain('No result found');
  });

  it('stores and logs nothing about the lookup', async () => {
    const logs = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => undefined),
    );
    localStorage.clear();
    sessionStorage.clear();
    const { el, detect } = await render(ResultsPage, 'en');
    set(el, '#results-classSlug', 'five', 'change');
    set(el, '#results-roll', '987654');
    await submit(el, detect);
    expect(JSON.stringify(logs.map((l) => l.mock.calls))).not.toContain('987654');
    expect(localStorage.length + sessionStorage.length).toBe(0);
    vi.restoreAllMocks();
  });
});

const item = (over: Partial<ResourceItem>): ResourceItem => ({
  id: 'r',
  type: 'syllabus',
  title: { bn: 'শিরোনাম', en: 'Title' },
  ...over,
});

describe('filterResources', () => {
  const items = [
    item({
      id: '1',
      type: 'syllabus',
      classSlug: 'five',
      subject: { bn: 'গণিত', en: 'Math' },
      year: 2026,
    }),
    item({
      id: '2',
      type: 'exam-routine',
      classSlug: 'five',
      exam: { bn: 'অর্ধবার্ষিক' },
      year: 2026,
    }),
    item({ id: '3', type: 'form' }),
  ];
  const none: ResourceFilters = { type: 'all', classSlug: '', subject: '', year: '', exam: '' };

  it('filters by each criterion and combines them', () => {
    const ids = (f: Partial<ResourceFilters>) =>
      filterResources(items, { ...none, ...f }).map((i) => i.id);
    expect(ids({})).toEqual(['1', '2', '3']);
    expect(ids({ type: 'form' })).toEqual(['3']);
    expect(ids({ classSlug: 'five' })).toEqual(['1', '2']);
    expect(ids({ subject: 'গণিত' })).toEqual(['1']);
    expect(ids({ exam: 'অর্ধবার্ষিক' })).toEqual(['2']);
    expect(ids({ year: '2026', type: 'syllabus' })).toEqual(['1']);
    expect(ids({ year: '1999' })).toEqual([]);
  });
});

describe('ResourcesPage', () => {
  it('lists all six resource types as marked placeholders while nothing is published', async () => {
    const { el } = await render(ResourcesPage, 'en');
    expect(el.querySelectorAll('#pending-types ~ ul li')).toHaveLength(6);
    expect(el.querySelector('#pending-types ~ app-pending-note')).not.toBeNull();
    expect(el.querySelectorAll('a[download]')).toHaveLength(0);
    const disabled = Array.from(el.querySelectorAll('form select')).filter(
      (s) => (s as HTMLSelectElement).disabled,
    );
    expect(disabled).toHaveLength(3); // subject, year, exam have no choices yet
    expect(el.querySelectorAll('form select')).toHaveLength(4);
  });

  const stub = (items: ResourceItem[]) => [
    { provide: ResourceService, useValue: { list: () => of(items) } },
  ];
  const items: ResourceItem[] = [
    item({
      id: '1',
      type: 'syllabus',
      title: { bn: 'সিলেবাস', en: 'Class Five syllabus' },
      classSlug: 'five',
      subject: { bn: 'গণিত', en: 'Math' },
      year: 2026,
      file: { src: 'files/syllabus-five.pdf', kind: 'pdf' },
    }),
    item({
      id: '2',
      type: 'form',
      title: { bn: 'ফরম', en: 'Leave form' },
      file: { src: 'https://evil.example.com/form.pdf', kind: 'pdf' },
    }),
    item({
      id: '3',
      type: 'exam-routine',
      title: { bn: 'রুটিন', en: 'Exam routine' },
      exam: { bn: 'অর্ধবার্ষিক', en: 'Half-yearly' },
      year: 2025,
    }),
  ];

  it('builds filter choices from the items and applies URL filters', async () => {
    const all = await render(ResourcesPage, 'en', {}, stub(items));
    expect(all.el.querySelectorAll('main ul.grid li, ul.grid li')).toHaveLength(3);
    const subjects = Array.from(all.el.querySelectorAll('form label:nth-of-type(2) option')).map(
      (o) => o.textContent?.trim(),
    );
    expect(subjects).toEqual(['Any', 'Math']);
    const years = Array.from(all.el.querySelectorAll('form label:nth-of-type(3) option')).map((o) =>
      o.textContent?.trim(),
    );
    expect(years).toEqual(['Any', '2026', '2025']);
    TestBed.resetTestingModule();

    const filtered = await render(
      ResourcesPage,
      'en',
      { type: 'syllabus', classSlug: 'five', year: '2026' },
      stub(items),
    );
    expect(filtered.el.querySelectorAll('ul.grid li')).toHaveLength(1);
    expect(filtered.el.textContent).toContain('Class Five syllabus');
    expect(filtered.el.querySelector('a[aria-current="true"]')?.textContent).toContain('Syllabus');
  });

  it('links files that pass the safety check and refuses the rest', async () => {
    const { el } = await render(ResourcesPage, 'en', {}, stub(items));
    const downloads = Array.from(el.querySelectorAll('a[download]')).map((a) =>
      a.getAttribute('href'),
    );
    expect(downloads).toEqual(['files/syllabus-five.pdf']);
    expect(el.innerHTML).not.toContain('evil.example.com');
    expect(el.textContent).toContain('The file will be added soon');
    expect(el.querySelector('a[target="_blank"]')?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('explains when a filter matches nothing', async () => {
    const { el } = await render(ResourcesPage, 'en', { type: 'policy' }, stub(items));
    expect(el.textContent).toContain('No resources found');
    expect(el.querySelector('a[href="/en/resources"]')).not.toBeNull();
  });
});

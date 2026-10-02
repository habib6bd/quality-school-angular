import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { bn } from '../../core/i18n/translations/bn';
import { AdmissionPage } from './admission';
import { ApplyPage } from './apply';

/** Dotted translation keys that leaked into visible text instead of being translated. */
function rawKeysIn(text: string): string[] {
  const keys: string[] = [];
  const walk = (node: object, prefix: string) => {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') keys.push(prefix + key);
      else walk(value as object, `${prefix}${key}.`);
    }
  };
  walk(bn, '');
  return keys.filter((key) => text.includes(key));
}

async function render(
  component: Type<unknown>,
  lang: Lang,
): Promise<{
  el: HTMLElement;
  detect: () => Promise<void>;
}> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(component);
  const detect = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  await detect();
  return { el: fixture.nativeElement as HTMLElement, detect };
}

describe('AdmissionPage', () => {
  it.each<Lang>(['bn', 'en'])(
    'shows verified content and marks the rest pending (%s)',
    async (lang) => {
      const { el } = await render(AdmissionPage, lang);
      expect(el.querySelectorAll('h1')).toHaveLength(1);
      // Real: the notice with its image, the 13 classes, the banner contact details.
      expect(el.querySelector('img[src*="admission-2026"]')).not.toBeNull();
      expect(el.querySelectorAll('section[aria-labelledby="adm-classes"] a')).toHaveLength(13);
      expect(el.querySelector('a[href="tel:01678708862"]')).not.toBeNull();
      // Not published: eligibility, steps, documents are pending notes; calendar dates are TBC.
      expect(el.querySelectorAll('app-pending-note')).toHaveLength(3);
      const dates = Array.from(el.querySelectorAll('tbody td')).map((td) => td.textContent?.trim());
      expect(dates).toHaveLength(4);
      expect(new Set(dates).size).toBe(1);
      expect(rawKeysIn(el.textContent ?? '')).toEqual([]);
    },
  );

  it('does not invent fees, ages or document names', async () => {
    const { el } = await render(AdmissionPage, 'en');
    const text = el.textContent ?? '';
    expect(text).not.toMatch(/\b(tk|taka|bdt|৳)\b/i);
    expect(text).not.toMatch(/birth certificate|passport|testimonial/i);
    expect(text).not.toMatch(/\b\d+\s*years?\b/i);
  });

  it('shows only the admission and contact FAQs', async () => {
    const { el } = await render(AdmissionPage, 'en');
    const questions = Array.from(el.querySelectorAll('app-accordion h3')).map((h) =>
      h.textContent?.trim(),
    );
    expect(questions).toEqual([
      'Where can I find information about admission?',
      'Does the online application form submit my application?',
      'How can I contact the school?',
      'Can I send a message through the contact form?',
    ]);
  });
});

describe('ApplyPage (prototype)', () => {
  const set = (el: HTMLElement, selector: string, value: string, event = 'input') => {
    const control = el.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    control.value = value;
    control.dispatchEvent(new Event(event));
  };
  const submit = async (el: HTMLElement, detect: () => Promise<void>) => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await detect();
  };
  const heading = (el: HTMLElement) => el.querySelector('h2[tabindex="-1"]')?.textContent;

  it('is labelled as a prototype before any field', async () => {
    const { el } = await render(ApplyPage, 'en');
    expect(el.querySelector('aside')?.textContent).toContain('No application is submitted');
    expect(el.querySelector('aside')?.textContent).toContain('Prototype');
  });

  it('blocks the step, summarizes errors and wires aria attributes when fields are empty', async () => {
    const { el, detect } = await render(ApplyPage, 'en');
    await submit(el, detect);
    const summary = el.querySelector('[role="alert"]');
    expect(summary?.textContent).toContain('Please fix the following errors');
    expect(summary?.querySelectorAll('li')).toHaveLength(3);
    expect(heading(el)).toContain('Step 1 of 5');

    const name = el.querySelector<HTMLInputElement>('#apply-student-fullName')!;
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-required')).toBe('true');
    const errorId = name.getAttribute('aria-describedby')!;
    expect(el.querySelector(`#${errorId}`)?.textContent).toContain('This information is required');
    expect(el.querySelector('[aria-live="polite"] #apply-student-fullName-error')).not.toBeNull();
  });

  it('walks through every step, reviews the answers and ends with a prototype confirmation', async () => {
    const { el, detect } = await render(ApplyPage, 'en');

    set(el, '#apply-student-fullName', 'Test Student');
    set(el, '#apply-student-dateOfBirth', '2015-03-04');
    set(el, '#apply-student-gender', 'female', 'change');
    await submit(el, detect);
    expect(heading(el)).toContain('Step 2 of 5');

    set(el, '#apply-guardian-guardianName', 'Test Guardian');
    set(el, '#apply-guardian-relationship', 'mother', 'change');
    set(el, '#apply-guardian-phone', '০১৭১১৭৩২৪৮৬');
    set(el, '#apply-guardian-address', 'Some road, Dhaka');
    await submit(el, detect);
    expect(heading(el)).toContain('Step 3 of 5');

    set(el, '#apply-academic-classSlug', 'nine', 'change');
    await detect();
    expect(el.querySelector('#apply-academic-group')).not.toBeNull();
    await submit(el, detect);
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Group');
    set(el, '#apply-academic-group', 'science', 'change');
    set(el, '#apply-academic-medium', 'english', 'change');
    await submit(el, detect);
    expect(heading(el)).toContain('Step 4 of 5');

    await submit(el, detect);
    expect(el.querySelector('#apply-documents-acknowledged-error')).not.toBeNull();
    const ack = el.querySelector<HTMLInputElement>('#apply-documents-acknowledged')!;
    ack.click();
    await detect();
    await submit(el, detect);
    expect(heading(el)).toContain('Step 5 of 5');

    const review = el.textContent ?? '';
    for (const value of [
      'Test Student',
      'Girl',
      'Test Guardian',
      'Mother',
      'Class Nine',
      'Science',
      'English version',
      'Not given',
    ]) {
      expect(review).toContain(value);
    }
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await detect();
    expect(heading(el)).toContain('Finished (prototype)');
    expect(el.textContent).toContain('No information was sent or saved');
  });

  it('sends nothing, stores nothing and logs nothing', async () => {
    const network = [
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('')),
      vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => undefined),
    ];
    const beacon = vi.fn();
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
    const logs = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => undefined),
    );
    localStorage.clear();
    sessionStorage.clear();

    const { el, detect } = await render(ApplyPage, 'en');
    set(el, '#apply-student-fullName', 'Secret Student Name');
    set(el, '#apply-student-dateOfBirth', '2015-03-04');
    set(el, '#apply-student-gender', 'male', 'change');
    await submit(el, detect);
    set(el, '#apply-guardian-guardianName', 'Secret Guardian');
    set(el, '#apply-guardian-relationship', 'father', 'change');
    set(el, '#apply-guardian-phone', '01711732486');
    set(el, '#apply-guardian-address', 'Secret address, Dhaka');
    await submit(el, detect);
    set(el, '#apply-academic-classSlug', 'five', 'change');
    set(el, '#apply-academic-medium', 'bangla', 'change');
    await submit(el, detect);
    el.querySelector<HTMLInputElement>('#apply-documents-acknowledged')!.click();
    await detect();
    await submit(el, detect);
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await detect();
    expect(heading(el)).toContain('Finished (prototype)');

    network.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect(beacon).not.toHaveBeenCalled();
    logs.forEach((spy) => {
      const printed = JSON.stringify(spy.mock.calls);
      expect(printed).not.toContain('Secret');
      expect(printed).not.toContain('01711732486');
    });
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    vi.restoreAllMocks();
  });

  it('lets the visitor go back and edit from the review step', async () => {
    const { el, detect } = await render(ApplyPage, 'en');
    set(el, '#apply-student-fullName', 'Test Student');
    set(el, '#apply-student-dateOfBirth', '2015-03-04');
    set(el, '#apply-student-gender', 'male', 'change');
    await submit(el, detect);
    el.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    await detect();
    expect(heading(el)).toContain('Step 1 of 5');
    expect(el.querySelector<HTMLInputElement>('#apply-student-fullName')!.value).toBe(
      'Test Student',
    );
  });

  it('shows Bangla labels on the Bangla page', async () => {
    const { el } = await render(ApplyPage, 'bn');
    expect(el.querySelector('aside')?.textContent).toContain('এই ফরম থেকে কোনো আবেদন জমা হয় না');
    expect(heading(el)).toContain('ধাপ ১ / ৫');
    expect(el.querySelector('label[for="apply-student-fullName"]')?.textContent).toContain(
      'শিক্ষার্থীর পূর্ণ নাম',
    );
  });
});

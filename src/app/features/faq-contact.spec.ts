import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Lang } from '../core/i18n/lang';
import { LanguageService } from '../core/i18n/language.service';
import { FaqItem } from '../core/models/faq.model';
import { Testimonial } from '../core/models/testimonial.model';
import { ContactService } from '../core/services/contact.service';
import { TestimonialService } from '../core/services/testimonial.service';
import { Footer } from '../layout/footer/footer';
import { TestimonialCard } from '../shared/components/testimonial-card/testimonial-card';
import { ContactPage, contactMethodValidator } from './contact/contact';
import { filterFaqs, FaqPage, isFaqCategory } from './faq/faq';
import { HomeContact } from './home/sections/contact-section';
import { HomeTestimonials } from './home/sections/testimonials-preview';

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
  const control = el.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    selector,
  )!;
  control.value = value;
  control.dispatchEvent(new Event(event));
};
const submit = async (el: HTMLElement, detect: () => Promise<void>) => {
  el.querySelector('form')!.dispatchEvent(new Event('submit'));
  await detect();
};

const faq = (id: string, category: FaqItem['category'], q: string, a: string): FaqItem => ({
  id,
  category,
  question: { bn: `প্রশ্ন ${q}`, en: q },
  answer: { bn: `উত্তর ${a}`, en: a },
});

describe('filterFaqs', () => {
  const items = [
    faq('1', 'website', 'Change language', 'Use the buttons'),
    faq('2', 'admission', 'Apply online', 'Contact the school'),
    faq('3', 'contact', 'Phone numbers', 'See the footer'),
  ];

  it('filters by category and by text in the question or the answer', () => {
    expect(filterFaqs(items, 'admission', '', 'en').map((f) => f.id)).toEqual(['2']);
    expect(filterFaqs(items, 'all', 'LANGUAGE', 'en').map((f) => f.id)).toEqual(['1']);
    expect(filterFaqs(items, 'all', 'footer', 'en').map((f) => f.id)).toEqual(['3']);
    expect(filterFaqs(items, 'website', 'footer', 'en')).toEqual([]);
  });

  it('searches the language being read', () => {
    expect(filterFaqs(items, 'all', 'প্রশ্ন', 'bn')).toHaveLength(3);
    expect(filterFaqs(items, 'all', 'প্রশ্ন', 'en')).toEqual([]);
  });

  it('validates categories from the URL', () => {
    expect(isFaqCategory('contact')).toBe(true);
    expect(isFaqCategory('billing')).toBe(false);
  });
});

describe('FaqPage', () => {
  const chips = (el: HTMLElement, label: string) =>
    Array.from(el.querySelectorAll(`nav[aria-label="${label}"] a`)).map((a) =>
      a.textContent?.replace(/\s+/g, ' ').trim(),
    );

  it('shows every published question with category counts, in English and Bangla', async () => {
    const en = await render(FaqPage, 'en');
    expect(en.el.querySelectorAll('app-accordion h3')).toHaveLength(11);
    expect(chips(en.el, 'Browse by topic')).toEqual([
      'All 11',
      'Website 4',
      'Admission 2',
      'Academics 3',
      'Contact 2',
    ]);
    TestBed.resetTestingModule();
    const bn = await render(FaqPage, 'bn');
    expect(bn.el.querySelector('app-accordion h3')?.textContent).toMatch(/[ঀ-৿]/);
    expect(bn.el.textContent).toContain('১১টির মধ্যে ১১টি');
  });

  it('filters by category and search text from the URL, and explains an empty result', async () => {
    const category = await render(FaqPage, 'en', { category: 'admission' });
    expect(category.el.querySelectorAll('app-accordion h3')).toHaveLength(2);
    TestBed.resetTestingModule();
    const search = await render(FaqPage, 'en', { q: 'prototype' });
    expect(search.el.querySelectorAll('app-accordion h3').length).toBeGreaterThan(0);
    TestBed.resetTestingModule();
    const none = await render(FaqPage, 'en', { q: 'xyzzy' });
    expect(none.el.querySelectorAll('app-accordion')).toHaveLength(0);
    expect(none.el.textContent).toContain('No results');
    expect(none.el.querySelector('app-empty-state a')?.getAttribute('href')).toBe('/en/faq');
  });

  it('only gives answers about site usage or facts the school published (no amounts, deadlines or policies)', async () => {
    const { el } = await render(FaqPage, 'en');
    const text =
      (el.textContent ?? '') +
      Array.from(el.querySelectorAll('app-accordion [role="region"]'))
        .map((r) => r.textContent)
        .join(' ');
    expect(text).not.toMatch(/\b(tk|taka|bdt|৳|tuition|deadline|refund)\b/i);
  });

  it('opens an answer with the keyboard', async () => {
    const { el, detect } = await render(FaqPage, 'en');
    const button = el.querySelector<HTMLButtonElement>('app-accordion button')!;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await detect();
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('Testimonials', () => {
  const item: Testimonial = {
    id: 't',
    quote: { bn: 'ভালো', en: 'Good school' },
    attribution: { bn: 'অভিভাবক', en: 'A parent' },
  };

  it('renders a review as a figure with quote and attribution', async () => {
    const { el } = await render(TestimonialCard, 'en', { testimonial: item });
    expect(el.querySelector('figure blockquote')?.textContent).toContain('Good school');
    expect(el.querySelector('figcaption')?.textContent).toContain('A parent');
  });

  it('shows an honest empty state with no reviews, and the cards once some are approved', async () => {
    const empty = await render(HomeTestimonials, 'en');
    expect(empty.el.textContent).toContain('No reviews published yet');
    expect(empty.el.querySelector('app-testimonial-card')).toBeNull();
    TestBed.resetTestingModule();
    const filled = await render(HomeTestimonials, 'en', {}, [
      { provide: TestimonialService, useValue: { list: () => of([item]) } },
    ]);
    expect(filled.el.querySelectorAll('app-testimonial-card')).toHaveLength(1);
  });
});

describe('contactMethodValidator', () => {
  it('needs an e-mail or a phone', () => {
    const group = (email: string, phone: string) =>
      ({ get: (n: string) => ({ value: n === 'email' ? email : phone }) }) as never;
    expect(contactMethodValidator(group('', ''))).toEqual({ contactMethod: true });
    expect(contactMethodValidator(group('  ', '  '))).toEqual({ contactMethod: true });
    expect(contactMethodValidator(group('a@b.co', ''))).toBeNull();
    expect(contactMethodValidator(group('', '01711732486'))).toBeNull();
  });
});

describe('ContactPage', () => {
  const fillValid = (el: HTMLElement) => {
    set(el, '#contact-name', 'Test Guardian');
    set(el, '#contact-phone', '01711732486');
    set(el, '#contact-message', 'I would like to know more about the school.');
  };

  it('shows the school details, a prototype label and a titled map', async () => {
    const { el } = await render(ContactPage, 'en');
    expect(el.textContent).toContain('House K-278, Road 16');
    expect(el.querySelector('a[href="tel:01678708862"]')).not.toBeNull();
    expect(el.querySelector('a[href="tel:01711732486"]')).not.toBeNull();
    expect(el.textContent).toContain('Office hours: To be confirmed by the school');
    expect(el.querySelector('#contact-form-title')?.textContent).toContain('Prototype');
    expect(el.textContent).toContain('No message is sent from this form');
    expect(el.querySelector('iframe')?.getAttribute('title')).toContain('Google Maps');
  });

  it('shows the same address and phone numbers in the footer, the homepage and the contact page', async () => {
    const info = {
      phones: ['01678708862', '01711732486'],
      address: 'House K-278, Road 16 (beside Jora Khamba), South Banasree, Dhaka',
    };
    for (const component of [Footer, HomeContact, ContactPage]) {
      TestBed.resetTestingModule();
      const { el } = await render(component, 'en');
      const text = (el.textContent ?? '').replace(/\s+/g, ' ');
      expect(text, component.name).toContain(info.address);
      for (const phone of info.phones)
        expect(el.querySelector(`a[href="tel:${phone}"]`), component.name).not.toBeNull();
    }
  });

  it('validates required fields, the e-mail or phone rule and the message length — accessibly', async () => {
    const { el, detect } = await render(ContactPage, 'en');
    await submit(el, detect);
    const summary = el.querySelector('[role="alert"]');
    expect(summary?.textContent).toContain('Please fix the following errors');
    expect(summary?.textContent).toContain('Please give an e-mail address or a mobile number');
    expect(el.querySelector('#contact-name')?.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('#contact-method-error')).not.toBeNull();

    set(el, '#contact-name', 'Test Guardian');
    set(el, '#contact-phone', '12345');
    set(el, '#contact-message', 'short');
    await submit(el, detect);
    expect(el.querySelector('#contact-phone-error')?.textContent).toContain('valid mobile number');
    expect(el.querySelector('#contact-message-error')?.textContent).toContain('at least 10');

    set(el, '#contact-phone', '01711732486');
    set(el, '#contact-message', 'A proper message for the school.');
    await detect();
    expect(el.querySelector('#contact-method-error')).toBeNull();
  });

  it('shows the prototype success state after a valid submit', async () => {
    const send = vi.fn(() => of(undefined));
    const { el, detect } = await render(ContactPage, 'en', {}, [
      { provide: ContactService, useValue: { send } },
    ]);
    fillValid(el);
    set(el, '#contact-subject', 'admission', 'change');
    await submit(el, detect);
    expect(send).toHaveBeenCalledWith({
      name: 'Test Guardian',
      email: '',
      phone: '01711732486',
      subject: 'admission',
      message: 'I would like to know more about the school.',
    });
    expect(el.querySelector('[role="status"]')?.textContent).toContain(
      'No message was sent or saved',
    );
    el.querySelector<HTMLButtonElement>('[role="status"] button')!.click();
    await detect();
    expect(el.querySelector<HTMLInputElement>('#contact-name')!.value).toBe('');
  });

  it('shows an error state when sending fails and lets the visitor retry', async () => {
    let calls = 0;
    const send = vi.fn(() => (++calls === 1 ? throwError(() => new Error('down')) : of(undefined)));
    const { el, detect } = await render(ContactPage, 'en', {}, [
      { provide: ContactService, useValue: { send } },
    ]);
    fillValid(el);
    await submit(el, detect);
    expect(el.textContent).toContain('The message could not be sent');
    expect(el.querySelector<HTMLInputElement>('#contact-name')!.value).toBe('Test Guardian');
    await submit(el, detect);
    expect(el.querySelector('[role="status"]')).not.toBeNull();
  });

  it('has no endpoint: nothing is sent, stored or logged', async () => {
    const network = [
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('')),
      vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(() => undefined),
    ];
    const logs = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => undefined),
    );
    localStorage.clear();
    sessionStorage.clear();
    const { el, detect } = await render(ContactPage, 'en');
    set(el, '#contact-name', 'Secret Person');
    set(el, '#contact-email', 'secret@example.com');
    set(el, '#contact-message', 'Secret message text here.');
    await submit(el, detect);
    expect(el.querySelector('[role="status"]')).not.toBeNull();
    network.forEach((spy) => expect(spy).not.toHaveBeenCalled());
    expect(JSON.stringify(logs.map((l) => l.mock.calls))).not.toContain('Secret');
    expect(localStorage.length + sessionStorage.length).toBe(0);
    vi.restoreAllMocks();
  });

  it('shows Bangla labels and Bangla digits on the Bangla page', async () => {
    const { el } = await render(ContactPage, 'bn');
    expect(el.querySelector('label[for="contact-name"]')?.textContent).toContain('আপনার নাম');
    expect(el.textContent).toContain('০১৬৭৮৭০৮৮৬২');
  });
});

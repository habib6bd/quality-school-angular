import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { Home } from './home';

async function renderHome(lang: Lang): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(Home);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Home', () => {
  it.each<Lang>(['bn', 'en'])('renders the whole page with one h1 in %s', async (lang) => {
    const el = await renderHome(lang);
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    expect(el.querySelector('h1')?.textContent).toContain(
      lang === 'bn' ? 'বনশ্রী কোয়ালিটি এডুকেশন স্কুল' : 'Banasree Quality Education School',
    );
    // hero, quick links, 15 more sections
    expect(el.querySelectorAll('section').length).toBeGreaterThanOrEqual(15);
    expect(el.querySelector('app-skeleton')).toBeNull();
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows real content: admission notice, staff, classes, video and contact details', async () => {
    const el = await renderHome('en');
    const text = el.textContent ?? '';
    expect(text).toContain('Admission is open for Play to Class Ten');
    expect(text).toContain('Sk. Md. Abdullah Al Mizan');
    expect(text).toContain('Junior One');
    expect(text).toContain('Study Tour - 2025');
    expect(text).toContain('House K-278, Road 16');
    expect(el.querySelector('a[href="tel:01678708862"]')).not.toBeNull();
    expect(el.querySelector('iframe[title]')).not.toBeNull();
  });

  it('is honest about content the school has not published', async () => {
    const text = (await renderHome('en')).textContent ?? '';
    expect(text).toContain('No upcoming events');
    expect(text).toContain('No reviews published yet');
    expect(text).toContain('To be confirmed by the school');
  });

  it('uses Bangla digits on Bangla pages', async () => {
    const text = (await renderHome('bn')).textContent ?? '';
    expect(text).toContain('২৮১');
    expect(text).toContain('০১৬৭৮৭০৮৮৬২');
    expect(text).not.toMatch(/\b281\b/);
  });

  it('shows no raw translation keys', async () => {
    for (const lang of ['bn', 'en'] as const) {
      TestBed.resetTestingModule();
      const text = (await renderHome(lang)).textContent ?? '';
      expect(text).not.toMatch(
        /\b(home|common|nav|notices|events|testimonials|achievements)\.[a-zA-Z]+/,
      );
    }
  });

  it('links every call to action into the active language tree', async () => {
    const el = await renderHome('en');
    const hrefs = Array.from(el.querySelectorAll('a[href^="/"]')).map((a) =>
      a.getAttribute('href')!,
    );
    expect(hrefs.length).toBeGreaterThan(15);
    expect(hrefs.every((href) => href.startsWith('/en'))).toBe(true);
  });
});

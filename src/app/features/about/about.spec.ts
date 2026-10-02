import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Lang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { AboutPage } from './about';
import { FacilitiesPage } from './facilities';
import { HistoryPage } from './history';
import { MessagesPage } from './messages';
import { MissionVisionPage } from './mission-vision';
import { PhilosophyPage } from './philosophy';

async function render(component: Type<unknown>, lang: Lang = 'bn'): Promise<HTMLElement> {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  TestBed.inject(LanguageService).setLang(lang);
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const PAGES: readonly [string, Type<unknown>][] = [
  ['about', AboutPage],
  ['history', HistoryPage],
  ['mission-vision', MissionVisionPage],
  ['philosophy', PhilosophyPage],
  ['messages', MessagesPage],
  ['facilities', FacilitiesPage],
];

describe('About section pages', () => {
  describe.each(PAGES)('%s', (_name, component) => {
    it.each<Lang>(['bn', 'en'])('has one h1, related links and no raw keys in %s', async (lang) => {
      const el = await render(component, lang);
      expect(el.querySelectorAll('h1')).toHaveLength(1);
      expect(el.querySelectorAll('nav a[href^="/' + lang + '"]').length).toBeGreaterThan(1);
      expect(el.textContent).not.toMatch(
        /\b(about|history|missionVision|philosophy|messagesPage|facilitiesPage|common|page|nav|seo)\.[a-zA-Z]+/,
      );
      expect(el.querySelector('app-skeleton')).toBeNull();
    });
  });

  it('about: shows the verified identity facts, with Bangla digits on Bangla pages', async () => {
    const bn = (await render(AboutPage, 'bn')).textContent ?? '';
    expect(bn).toContain('২০১০');
    expect(bn).toContain('৪২৪২৫৬');
    expect(bn).toContain('১৩৪১৭২');
    expect(bn).toContain('ঢাকা শিক্ষাবোর্ড কর্তৃক স্বীকৃতিপ্রাপ্ত');
    TestBed.resetTestingModule();
    const en = (await render(AboutPage, 'en')).textContent ?? '';
    expect(en).toContain('Established');
    expect(en).toContain('424256');
    expect(en).toContain('House K-278, Road 16');
  });

  it('history: shows only the stated 2010 founding and marks the rest as pending', async () => {
    const el = await render(HistoryPage, 'en');
    expect(el.querySelectorAll('ol.border-s-2 > li')).toHaveLength(2);
    expect(el.textContent).toContain('2010 — Founded');
    expect(el.querySelector('app-pending-note')).not.toBeNull();
  });

  it('mission & vision: both statements are marked placeholders, never invented text', async () => {
    const el = await render(MissionVisionPage, 'en');
    expect(el.querySelectorAll('app-pending-note')).toHaveLength(2);
    expect(el.textContent).toContain('To be confirmed by the school');
  });

  it('philosophy: a placeholder plus themes quoted from the leaders, each with a source', async () => {
    const el = await render(PhilosophyPage, 'en');
    expect(el.querySelector('app-pending-note')).not.toBeNull();
    const sources = Array.from(el.querySelectorAll('li p.text-primary-800')).map((p) =>
      p.textContent?.trim(),
    );
    expect(sources).toHaveLength(4);
    expect(sources.every((s) => s?.startsWith('Source:'))).toBe(true);
  });

  it('messages: shows both leaders with photos; the English page explains the translation', async () => {
    const en = await render(MessagesPage, 'en');
    expect(en.querySelectorAll('article')).toHaveLength(2);
    expect(en.querySelectorAll('article img')).toHaveLength(2);
    expect(en.textContent).toContain('translation prepared for this website');
    expect(en.textContent).toContain('Keeping the challenges of the modern world in view');
    expect(en.querySelector('article p[lang="bn"]')?.textContent).toContain('কবির আহমদ');
    TestBed.resetTestingModule();
    const bn = await render(MessagesPage, 'bn');
    expect(bn.textContent).toContain('আধুনিক বিশ্বের চ্যালেঞ্জকে সামনে রেখে');
    expect(bn.textContent).not.toContain('translation prepared');
  });

  it('facilities: lists every verified facility and no more', async () => {
    const el = await render(FacilitiesPage, 'en');
    const titles = Array.from(el.querySelectorAll('li h2')).map((h) => h.textContent?.trim());
    expect(titles).toEqual([
      'Smart classrooms',
      'Air-conditioned classrooms',
      'Modern play zone',
      'Clubs and competitions',
      'Online school banking',
      'Prayer on campus',
      'Canteen, store and vending machine',
    ]);
  });
});

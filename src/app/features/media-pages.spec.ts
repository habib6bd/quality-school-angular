import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Lang } from '../core/i18n/lang';
import { LanguageService } from '../core/i18n/language.service';
import { Achievement } from '../core/models/achievement.model';
import { GalleryItem } from '../core/models/gallery.model';
import { SchoolVideo } from '../core/models/video.model';
import { AchievementService } from '../core/services/achievement.service';
import { GalleryService } from '../core/services/gallery.service';
import { VideoService } from '../core/services/video.service';
import { AchievementsPage } from './achievements/achievements';
import { GalleryPage } from './gallery/gallery';
import { VideosPage } from './videos/videos';

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

const chipText = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('nav[aria-label="Filter photos by category"] a')).map((a) =>
    a.textContent?.replace(/\s+/g, ' ').trim(),
  );

describe('GalleryPage', () => {
  it('shows all real photos with alt text, dimensions and lazy loading', async () => {
    const { el } = await render(GalleryPage, 'en');
    const images = Array.from(el.querySelectorAll('app-gallery-grid img'));
    expect(images).toHaveLength(7);
    for (const img of images) {
      expect(img.getAttribute('alt')?.length).toBeGreaterThan(10);
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
    }
    // The first two (above the fold) load eagerly; the rest are lazy.
    expect(images.slice(2).every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
    expect(chipText(el)).toEqual(['All photos 7', 'Annual Sports 2', 'School events 5']);
  });

  it('filters by category from the URL', async () => {
    const { el } = await render(GalleryPage, 'en', { category: 'annual-sports' });
    expect(el.querySelectorAll('app-gallery-grid li')).toHaveLength(2);
    expect(el.querySelector('a[aria-current="true"]')?.textContent).toContain('Annual Sports');
  });

  it('ignores an unknown category', async () => {
    const { el } = await render(GalleryPage, 'bn', { category: 'whatever' });
    expect(el.querySelectorAll('app-gallery-grid li')).toHaveLength(7);
  });

  it('opens the lightbox on the chosen photo of the filtered set, with its description', async () => {
    const { el, detect } = await render(GalleryPage, 'en', { category: 'school-events' });
    el.querySelectorAll<HTMLButtonElement>('app-gallery-grid button')[1].click();
    await detect();
    const dialog = el.querySelector('app-lightbox dialog')!;
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.querySelector('img')?.getAttribute('alt')).toContain('five students');
    expect(dialog.querySelector('figcaption')?.textContent).toContain('Image 2 of 5');
  });

  it('marks demo images and shows an empty state when a category has no photos', async () => {
    const demo: GalleryItem = {
      id: 'd',
      category: 'school-events',
      image: {
        src: 'images/demo/field-trip.webp',
        width: 10,
        height: 10,
        alt: { bn: 'নমুনা', en: 'Sample' },
        isDemo: true,
      },
    };
    const stub = { provide: GalleryService, useValue: { list: () => of([demo]) } };
    const withDemo = await render(GalleryPage, 'en', {}, [stub]);
    expect(withDemo.el.querySelector('app-badge')?.textContent).toContain('Demo image');
    TestBed.resetTestingModule();
    const empty = await render(GalleryPage, 'en', { category: 'annual-sports' }, [stub]);
    expect(empty.el.textContent).toContain('No photos in this category');
  });
});

describe('VideosPage', () => {
  it('lists the real video with a tile, a YouTube link and the channel link', async () => {
    const { el } = await render(VideosPage, 'en');
    expect(el.querySelectorAll('app-video-card')).toHaveLength(1);
    expect(el.querySelector('app-video-card')?.textContent).toContain('Study Tour - 2025');
    const watch = el.querySelector<HTMLAnchorElement>('app-video-gallery a')!;
    expect(watch.href).toBe('https://www.youtube.com/watch?v=aPdUbVyfpSU');
    expect(watch.rel).toBe('noopener noreferrer');
    expect(el.querySelector('a[href="https://www.youtube.com/@bqes."]')).not.toBeNull();
  });

  it('opens an accessible dialog with a nocookie player when a tile is pressed', async () => {
    const { el, detect } = await render(VideosPage, 'en');
    el.querySelector<HTMLButtonElement>('app-video-card button')!.click();
    await detect();
    const dialog = el.querySelector('app-video-modal dialog')!;
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog.querySelector('iframe')?.getAttribute('src')).toContain(
      'https://www.youtube-nocookie.com/embed/aPdUbVyfpSU',
    );
  });

  it('links and embeds only valid YouTube ids', async () => {
    const bad: SchoolVideo = {
      id: 'bad',
      title: { bn: 'খারাপ', en: 'Bad' },
      youtubeId: '"><script>',
    };
    const { el, detect } = await render(VideosPage, 'en', {}, [
      { provide: VideoService, useValue: { list: () => of([bad]) } },
    ]);
    expect(el.querySelector('app-video-gallery a')).toBeNull();
    el.querySelector<HTMLButtonElement>('app-video-card button')!.click();
    await detect();
    expect(el.querySelector('app-video-modal iframe')).toBeNull();
  });
});

describe('AchievementsPage', () => {
  it('shows a marked placeholder for every category when nothing is published', async () => {
    const { el } = await render(AchievementsPage, 'en');
    expect(el.querySelectorAll('section[aria-labelledby^="ach-"]')).toHaveLength(3);
    expect(el.querySelectorAll('app-pending-note')).toHaveLength(3);
    expect(el.querySelectorAll('section[aria-labelledby^="ach-"] .card')).toHaveLength(0);
    const headings = Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining([
        'Academic achievements',
        'Sports achievements',
        'Cultural achievements',
      ]),
    );
  });

  it('replaces the placeholder only for categories that have real entries', async () => {
    const item: Achievement = {
      id: 'a',
      category: 'sports',
      title: { bn: 'শিরোনাম', en: 'Title' },
      description: { bn: 'বিবরণ', en: 'Description' },
    };
    const { el } = await render(AchievementsPage, 'en', {}, [
      { provide: AchievementService, useValue: { list: () => of([item]) } },
    ]);
    expect(el.querySelectorAll('app-pending-note')).toHaveLength(2);
    expect(el.querySelector('#ach-sports')?.closest('section')?.textContent).toContain('Title');
  });
});

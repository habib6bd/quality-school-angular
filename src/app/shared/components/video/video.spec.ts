import { TestBed } from '@angular/core/testing';
import { VideoCard, youtubeThumbnail } from './video-card';
import { VideoModal, youtubeEmbedUrl } from './video-modal';

describe('youtube helpers', () => {
  it('builds the thumbnail and a privacy-enhanced embed URL', () => {
    expect(youtubeThumbnail('aPdUbVyfpSU')).toBe(
      'https://i.ytimg.com/vi/aPdUbVyfpSU/hqdefault.jpg',
    );
    expect(youtubeEmbedUrl('aPdUbVyfpSU')).toContain(
      'https://www.youtube-nocookie.com/embed/aPdUbVyfpSU',
    );
  });

  it('refuses ids that are not YouTube ids', () => {
    expect(youtubeEmbedUrl('"><script>')).toBeNull();
    expect(youtubeEmbedUrl('short')).toBeNull();
  });
});

describe('VideoCard', () => {
  function render() {
    const fixture = TestBed.createComponent(VideoCard);
    fixture.componentRef.setInput('youtubeId', 'aPdUbVyfpSU');
    fixture.componentRef.setInput('title', 'Study Tour - 2025');
    fixture.detectChanges();
    return fixture;
  }

  it('emits when the thumbnail button is pressed', () => {
    const fixture = render();
    let requested = 0;
    fixture.componentInstance.watch.subscribe(() => requested++);
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    expect(requested).toBe(1);
  });

  it('replaces a thumbnail that fails to load instead of leaving a broken image', () => {
    const fixture = render();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('Study Tour - 2025');
  });
});

describe('VideoModal', () => {
  it('does not mount the player until opened', () => {
    const fixture = TestBed.createComponent(VideoModal);
    fixture.componentRef.setInput('youtubeId', 'aPdUbVyfpSU');
    fixture.componentRef.setInput('title', 'Study Tour - 2025');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('iframe')).toBeNull();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(el.querySelector('iframe')?.getAttribute('title')).toBe('Study Tour - 2025');
  });
});

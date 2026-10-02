import { TestBed } from '@angular/core/testing';
import { MapEmbed, safeMapUrl } from './map-embed';

describe('safeMapUrl', () => {
  it('accepts https Google Maps embeds', () => {
    expect(safeMapUrl('https://maps.google.com/maps?q=school&output=embed')).toContain(
      'maps.google.com',
    );
  });

  it.each([
    'http://maps.google.com/maps?q=x',
    'https://evil.example.com/maps',
    'javascript:alert(1)',
    'not a url',
    '',
  ])('rejects %s', (url) => {
    expect(safeMapUrl(url)).toBeNull();
  });
});

describe('MapEmbed', () => {
  function render(url: string) {
    const fixture = TestBed.createComponent(MapEmbed);
    fixture.componentRef.setInput('url', url);
    fixture.componentRef.setInput('title', 'Map of the school');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a titled lazy iframe for a valid URL', () => {
    const iframe = render('https://maps.google.com/maps?q=school&output=embed').querySelector(
      'iframe',
    );
    expect(iframe?.getAttribute('title')).toBe('Map of the school');
    expect(iframe?.getAttribute('loading')).toBe('lazy');
  });

  it('renders nothing for an untrusted URL', () => {
    expect(render('https://evil.example.com/').querySelector('iframe')).toBeNull();
  });
});

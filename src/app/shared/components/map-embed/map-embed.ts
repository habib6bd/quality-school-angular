import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const ALLOWED_HOSTS = new Set(['maps.google.com', 'www.google.com']);

/** Returns the URL only when it is an https Google Maps embed; otherwise `null`. */
export function safeMapUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_HOSTS.has(parsed.hostname) ? parsed.href : null;
  } catch {
    return null;
  }
}

/** Lazy Google Maps embed. Anything that is not a Google Maps https URL is not rendered. */
@Component({
  selector: 'app-map-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src(); as url) {
      <iframe
        [src]="url"
        [title]="title()"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        class="block h-72 w-full rounded-2xl border border-stone-200 bg-stone-100 sm:h-96"
      ></iframe>
    }
  `,
})
export class MapEmbed {
  private readonly sanitizer = inject(DomSanitizer);

  readonly url = input.required<string>();
  readonly title = input.required<string>();

  protected readonly src = computed<SafeResourceUrl | null>(() => {
    const safe = safeMapUrl(this.url());
    return safe ? this.sanitizer.bypassSecurityTrustResourceUrl(safe) : null;
  });
}

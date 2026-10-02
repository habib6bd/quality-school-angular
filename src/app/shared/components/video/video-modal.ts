import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Modal } from '../modal/modal';

const YOUTUBE_ID = /^[\w-]{11}$/;

/** Privacy-enhanced embed URL, or `null` when the id is not a valid YouTube id. */
export function youtubeEmbedUrl(youtubeId: string): string | null {
  return YOUTUBE_ID.test(youtubeId)
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`
    : null;
}

/** Public YouTube page for a video id, or `null` when the id is not valid. */
export function youtubeWatchUrl(youtubeId: string): string | null {
  return YOUTUBE_ID.test(youtubeId) ? `https://www.youtube.com/watch?v=${youtubeId}` : null;
}

/**
 * Accessible dialog that plays a YouTube video. The iframe exists only while the dialog is
 * open, so nothing loads (and nothing plays on) until the visitor asks for it.
 */
@Component({
  selector: 'app-video-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Modal],
  template: `
    <app-modal [(open)]="open" [title]="title()" size="xl">
      @if (open() && src(); as url) {
        <div class="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            [src]="url"
            [title]="title()"
            class="size-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      }
    </app-modal>
  `,
})
export class VideoModal {
  private readonly sanitizer = inject(DomSanitizer);

  readonly youtubeId = input.required<string>();
  readonly title = input.required<string>();
  readonly open = model(false);

  protected readonly src = computed<SafeResourceUrl | null>(() => {
    const url = youtubeEmbedUrl(this.youtubeId());
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
}

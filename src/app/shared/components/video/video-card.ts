import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

/** Standard YouTube thumbnail (480×360) for a video id. */
export function youtubeThumbnail(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`;
}

/**
 * Video tile: a thumbnail button that asks the parent to open the player. If the thumbnail
 * cannot load (offline, blocked), a plain tile with the play icon is shown instead of a
 * broken image.
 */
@Component({
  selector: 'app-video-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  template: `
    <button
      type="button"
      class="group card card-interactive block w-full text-left"
      (click)="watch.emit()"
    >
      <span
        class="relative block aspect-video overflow-hidden bg-gradient-to-br from-secondary-900 to-primary-800"
      >
        @if (!failed()) {
          <img
            [src]="thumbnail()"
            alt=""
            width="480"
            height="360"
            loading="lazy"
            class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            (error)="failed.set(true)"
          />
        }
        <span class="absolute inset-0 grid place-items-center bg-black/25">
          <span
            class="grid size-16 place-items-center rounded-full bg-white/95 text-primary-700 shadow-lg"
          >
            <app-icon name="play" [size]="28" />
          </span>
        </span>
      </span>
      <span class="block p-4">
        <span class="block font-display font-semibold text-secondary-950">{{ title() }}</span>
        <span class="mt-1 block text-sm text-ink-muted">{{ 'videos.watch' | t }}</span>
      </span>
    </button>
  `,
})
export class VideoCard {
  readonly youtubeId = input.required<string>();
  readonly title = input.required<string>();
  readonly watch = output<void>();

  protected readonly failed = signal(false);
  protected readonly thumbnail = computed(() => youtubeThumbnail(this.youtubeId()));
}

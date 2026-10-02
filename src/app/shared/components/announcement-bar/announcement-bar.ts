import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Icon } from '../icon/icon';

const STORAGE_PREFIX = 'bqes:announcement-dismissed:';

/** Static (non-scrolling) site-wide announcement; dismissal is remembered for the session. */
@Component({
  selector: 'app-announcement-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    @if (!dismissed()) {
      <aside [attr.aria-label]="'common.announcement' | t" class="bg-primary-800 text-white">
        <div class="container-page flex items-center gap-3 py-2 text-sm">
          <app-icon name="bell" [size]="16" class="text-accent-300" />
          <p class="min-w-0 flex-1">
            {{ message() }}
            @if (link() && linkLabel()) {
              <a
                [routerLink]="link()"
                class="ml-1 font-semibold whitespace-nowrap text-accent-200 underline underline-offset-2 hover:text-white"
              >
                {{ linkLabel() }}
              </a>
            }
          </p>
          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/15"
            [attr.aria-label]="'common.dismiss' | t"
            (click)="dismiss()"
          >
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      </aside>
    }
  `,
})
export class AnnouncementBar {
  private readonly document = inject(DOCUMENT);

  /** Stable id so dismissing one announcement does not hide a new one. */
  readonly announcementId = input.required<string>();
  readonly message = input.required<string>();
  readonly link = input<readonly string[]>();
  readonly linkLabel = input<string>();

  protected readonly dismissed = signal(false);

  constructor() {
    afterNextRender(() => {
      if (this.storage()?.getItem(STORAGE_PREFIX + this.announcementId()) === '1') {
        this.dismissed.set(true);
      }
    });
  }

  dismiss(): void {
    this.dismissed.set(true);
    try {
      this.storage()?.setItem(STORAGE_PREFIX + this.announcementId(), '1');
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); dismissal still applies now.
    }
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.sessionStorage ?? null;
    } catch {
      return null;
    }
  }
}

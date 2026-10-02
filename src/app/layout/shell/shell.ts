import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { navCommands } from '../../core/config/navigation';
import { DEFAULT_LANG, isLang } from '../../core/i18n/lang';
import { LanguageService } from '../../core/i18n/language.service';
import { AnnouncementService } from '../../core/services/announcement.service';
import { AnnouncementBar } from '../../shared/components/announcement-bar/announcement-bar';
import { BackToTop } from '../../shared/components/back-to-top/back-to-top';
import { LocalizePipe } from '../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

/** Page chrome shared by every route: skip link, announcement, header, main landmark, footer. */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, AnnouncementBar, BackToTop, TranslatePipe, LocalizePipe],
  template: `
    <a class="skip-link" href="#main-content">{{ 'common.skipToContent' | t }}</a>
    <div class="flex min-h-dvh flex-col">
      @if (announcement(); as item) {
        <app-announcement-bar
          [announcementId]="item.id"
          [message]="item.message | localize"
          [link]="item.linkPath ? link(item.linkPath) : undefined"
          [linkLabel]="item.linkLabel ? (item.linkLabel | localize) : undefined"
        />
      }
      <app-header />
      <main id="main-content" tabindex="-1" class="flex-1 focus:outline-none">
        <router-outlet />
      </main>
      <app-footer />
    </div>
    <app-back-to-top />
  `,
})
export class Shell {
  private readonly language = inject(LanguageService);
  protected readonly announcement = inject(AnnouncementService).current;

  constructor() {
    // Route data emits synchronously on subscribe, so the language is set before children render.
    inject(ActivatedRoute)
      .data.pipe(takeUntilDestroyed())
      .subscribe((data) => {
        const lang = data['lang'];
        this.language.setLang(isLang(lang) ? lang : DEFAULT_LANG);
      });
  }

  protected link(path: string): string[] {
    return navCommands(this.language.lang(), path);
  }
}

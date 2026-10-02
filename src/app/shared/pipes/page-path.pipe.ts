import { inject, Pipe, PipeTransform } from '@angular/core';
import { navCommands } from '../../core/config/navigation';
import { LanguageService } from '../../core/i18n/language.service';

/**
 * `[routerLink]="'about/history' | pagePath"` → `['/', 'bn', 'about', 'history']` for the
 * active language. Extra segments append to the path (`'notices' | pagePath: slug`).
 */
@Pipe({ name: 'pagePath', pure: false })
export class PagePathPipe implements PipeTransform {
  private readonly language = inject(LanguageService);

  transform(path: string, ...segments: string[]): string[] {
    return [...navCommands(this.language.lang(), path), ...segments];
  }
}

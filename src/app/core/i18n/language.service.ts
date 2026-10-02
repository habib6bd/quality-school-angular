import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { DEFAULT_LANG, Lang } from './lang';

/** Holds the active language. The URL prefix (`/bn`, `/en`) is the source of truth. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Lang>(DEFAULT_LANG);

  readonly lang = this.current.asReadonly();

  setLang(lang: Lang): void {
    this.current.set(lang);
    this.document.documentElement.lang = lang;
  }
}

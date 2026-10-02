import { HttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Source of one kind of school content. Services depend on this contract only, so the data can
 * move from the bundled files to a CMS or API without touching services or components.
 */
export interface ContentRepository<T> {
  list(): Observable<readonly T[]>;
}

/** Serves content bundled with the app (`core/data`). The current, clearly-labelled source. */
export class LocalContentRepository<T> implements ContentRepository<T> {
  constructor(private readonly items: readonly T[]) {}

  list(): Observable<readonly T[]> {
    return of(this.items);
  }
}

/**
 * Reads a collection from the school's content API: `GET {baseUrl}/{path}` returning a JSON array
 * of `T`. It is not wired in yet (see `provideHttpContentRepositories`). The response is trusted
 * as typed, so validate or map it here once the real API contract is known.
 */
export class HttpContentRepository<T> implements ContentRepository<T> {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
    private readonly path: string,
  ) {}

  list(): Observable<readonly T[]> {
    return this.http.get<readonly T[]>(`${this.baseUrl.replace(/\/+$/, '')}/${this.path}`);
  }
}

/** A token plus the information needed to build either implementation for it. */
export interface ContentSource<T> {
  readonly token: InjectionToken<ContentRepository<T>>;
  /** URL path under `apiBaseUrl`. */
  readonly path: string;
}

/** Creates a token whose default is the local repository over `localItems`. */
export function createContentSource<T>(
  name: string,
  path: string,
  localItems: readonly T[],
): ContentSource<T> {
  return {
    path,
    token: new InjectionToken<ContentRepository<T>>(name, {
      providedIn: 'root',
      factory: () => new LocalContentRepository(localItems),
    }),
  };
}

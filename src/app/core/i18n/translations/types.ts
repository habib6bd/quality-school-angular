/** Nested dictionary of UI strings. */
export interface TranslationDict {
  [key: string]: string | TranslationDict;
}

/** Dotted paths to every leaf string of a dictionary, e.g. `'common.close'`. */
export type LeafKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : LeafKeys<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Same shape as the source dictionary, but every entry may be missing. */
export type PartialDict<T> = {
  [K in keyof T]?: T[K] extends string ? string : PartialDict<T[K]>;
};

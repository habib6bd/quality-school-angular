import { bn } from './bn';
import { en } from './en';

function leaves(node: unknown, prefix = ''): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const [key, value] of Object.entries(node as object)) {
    const path = prefix + key;
    if (value !== null && typeof value === 'object') {
      leaves(value, path + '.').forEach((v, k) => out.set(k, v));
    } else {
      out.set(path, value);
    }
  }
  return out;
}

describe('UI dictionaries', () => {
  const bnKeys = leaves(bn);
  const enKeys = leaves(en);

  it('has an English string for every Bangla key', () => {
    const missing = [...bnKeys.keys()].filter((k) => !enKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('has no English keys without a Bangla source', () => {
    const extra = [...enKeys.keys()].filter((k) => !bnKeys.has(k));
    expect(extra).toEqual([]);
  });

  it('has no empty strings', () => {
    const empty = [...bnKeys, ...enKeys].filter(([, v]) => typeof v !== 'string' || !v.trim());
    expect(empty).toEqual([]);
  });

  it('keeps interpolation placeholders consistent between languages', () => {
    const placeholders = (s: unknown) =>
      String(s)
        .match(/\{\w+\}/g)
        ?.sort()
        .join() ?? '';
    const mismatched = [...bnKeys].filter(
      ([k, v]) => enKeys.has(k) && placeholders(v) !== placeholders(enKeys.get(k)),
    );
    expect(mismatched).toEqual([]);
  });

  it('writes Bangla strings in Bangla script', () => {
    const latinOnly = [...bnKeys].filter(([, v]) => !/[ঀ-৿]/.test(String(v)));
    expect(latinOnly.map(([k]) => k)).toEqual([]);
  });
});

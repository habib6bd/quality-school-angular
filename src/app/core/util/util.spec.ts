import { safeAttachmentPath } from '../../shared/util/safe-url';
import { paginate } from './paginate';

describe('paginate', () => {
  const items = Array.from({ length: 14 }, (_, i) => i + 1);

  it('slices pages and reports totals', () => {
    const second = paginate(items, 2, 6);
    expect(second).toEqual({ items: [7, 8, 9, 10, 11, 12], page: 2, totalPages: 3, total: 14 });
    expect(paginate(items, 3, 6).items).toEqual([13, 14]);
  });

  it('clamps out-of-range and invalid pages instead of failing', () => {
    expect(paginate(items, 99, 6).page).toBe(3);
    expect(paginate(items, 0, 6).page).toBe(1);
    expect(paginate(items, -4, 6).page).toBe(1);
    expect(paginate(items, 'abc', 6).page).toBe(1);
    expect(paginate(items, undefined, 6).page).toBe(1);
    expect(paginate(items, '2.7', 6).page).toBe(2);
  });

  it('always has at least one (empty) page', () => {
    expect(paginate([], 1, 6)).toEqual({ items: [], page: 1, totalPages: 1, total: 0 });
  });
});

describe('safeAttachmentPath', () => {
  it.each([
    'images/bqes/notices/admission-2026.webp',
    'files/notices/routine.pdf',
    'files/Exam-Schedule.PDF',
  ])('allows %s', (src) => expect(safeAttachmentPath(src)).toBe(src));

  it.each([
    'https://evil.example.com/a.png',
    'http://evil.example.com/a.png',
    '//evil.example.com/a.png',
    '/etc/passwd.png',
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    'images/../secrets.pdf',
    'images\\a.png',
    'images/a.png?x=1',
    'images/a.png#frag',
    'files/run.exe',
    'files/page.html',
    'files/noextension',
    'images/with space.png',
    '',
  ])('rejects %j', (src) => expect(safeAttachmentPath(src)).toBeNull());
});

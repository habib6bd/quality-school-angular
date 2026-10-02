import { FOOTER_QUICK_LINKS, MAIN_NAV, NavItem } from './navigation';
import { findPage, PAGES, pageTrail } from './pages';

function flatten(items: readonly NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
}

describe('page registry', () => {
  it('has unique paths', () => {
    const paths = PAGES.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('has a registered page for every navigation and footer link', () => {
    const links = [...flatten(MAIN_NAV), ...FOOTER_QUICK_LINKS, { path: 'search' }];
    const broken = links.map((l) => l.path).filter((path) => !findPage(path));
    expect(broken).toEqual([]);
  });

  it('only references existing parents', () => {
    const orphans = PAGES.filter((p) => p.parent !== undefined && !findPage(p.parent));
    expect(orphans).toEqual([]);
  });

  it('builds the trail from home to the page', () => {
    expect(pageTrail('about/history').map((p) => p.path)).toEqual(['', 'about', 'about/history']);
    expect(pageTrail('teachers').map((p) => p.path)).toEqual(['', 'teachers']);
    expect(pageTrail('').map((p) => p.path)).toEqual(['']);
    expect(pageTrail('missing')).toEqual([]);
  });
});

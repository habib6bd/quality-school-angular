import { MosaicSpan, narrowMosaic, sizesFor, spanClasses, wideMosaic } from './mosaic';

/**
 * Places tiles the way CSS grid auto-placement does (row-major, sparse) and returns the occupied
 * cells, so a test can check that a layout leaves no holes.
 */
function place(spans: readonly MosaicSpan[], columns: number): boolean[][] {
  const grid: boolean[][] = [];
  const free = (r: number, c: number) => !grid[r]?.[c];
  let row = 0;
  let col = 0;
  for (const { rows, cols } of spans) {
    const width = Math.min(cols, columns);
    for (;;) {
      if (col + width > columns) {
        row++;
        col = 0;
        continue;
      }
      let fits = true;
      for (let r = row; r < row + rows && fits; r++)
        for (let c = col; c < col + width && fits; c++) fits = free(r, c);
      if (fits) break;
      col++;
    }
    for (let r = row; r < row + rows; r++) {
      grid[r] ??= Array<boolean>(columns).fill(false);
      for (let c = col; c < col + width; c++) grid[r][c] = true;
    }
    col += width;
  }
  return grid;
}

const holes = (grid: boolean[][]) => grid.flat().filter((cell) => !cell).length;

describe('mosaic layouts', () => {
  it('returns one span per tile', () => {
    for (let n = 0; n <= 20; n++) {
      expect(wideMosaic(n)).toHaveLength(n);
      expect(narrowMosaic(n)).toHaveLength(n);
    }
  });

  it('fills the 4-column grid without holes for any number of tiles', () => {
    for (let n = 1; n <= 24; n++) expect(holes(place(wideMosaic(n), 4)), `${n} tiles`).toBe(0);
  });

  it('fills the 2-column grid without holes for any number of photos', () => {
    for (let n = 1; n <= 24; n++) expect(holes(place(narrowMosaic(n), 2)), `${n} tiles`).toBe(0);
  });

  it('keeps the first desktop tile two columns wide for the feature card', () => {
    for (let n = 1; n <= 16; n++) expect(wideMosaic(n)[0].cols).toBeGreaterThanOrEqual(2);
  });

  it('builds grid classes and image sizes from the spans', () => {
    const narrow: MosaicSpan = { cols: 1, rows: 3 };
    const wide: MosaicSpan = { cols: 2, rows: 2 };
    expect(spanClasses(narrow, wide)).toBe('col-span-1 row-span-3 lg:col-span-2 lg:row-span-2');
    expect(sizesFor(narrow, wide)).toBe('(min-width: 1024px) 640px, 50vw');
  });
});

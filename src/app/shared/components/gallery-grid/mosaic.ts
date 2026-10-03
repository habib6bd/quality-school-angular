/** Size of one mosaic tile, in grid columns and row units. */
export interface MosaicSpan {
  cols: 1 | 2 | 4;
  rows: 2 | 3 | 4;
}

const span = (cols: MosaicSpan['cols'], rows: MosaicSpan['rows']): MosaicSpan => ({ cols, rows });

/**
 * Eight tiles that fill a 4-column × 6-row rectangle with plain row-major auto-placement: a wide
 * first tile (where the feature card sits), tall and square photos around it, a wide one to close.
 */
const WIDE_BLOCK: readonly MosaicSpan[] = [
  span(2, 2),
  span(1, 3),
  span(1, 2),
  span(1, 2),
  span(1, 2),
  span(1, 4),
  span(1, 3),
  span(2, 2),
];

/** Patterns for a final, partial block of 1–7 tiles; each fills its rows completely. */
const WIDE_REMAINDERS: Record<number, readonly MosaicSpan[]> = {
  1: [span(4, 2)],
  2: [span(2, 2), span(2, 2)],
  3: [span(2, 2), span(1, 2), span(1, 2)],
  4: [span(2, 4), span(2, 2), span(1, 2), span(1, 2)],
  5: [span(2, 2), span(1, 2), span(1, 2), span(2, 2), span(2, 2)],
  6: [span(2, 2), span(1, 2), span(1, 2), span(1, 2), span(1, 2), span(2, 2)],
  7: [span(2, 2), span(1, 2), span(1, 2), span(1, 2), span(1, 2), span(1, 2), span(1, 2)],
};

/** Two columns: tall, short / short, tall — both columns end level after every four photos. */
const NARROW_BLOCK: readonly MosaicSpan[] = [span(1, 3), span(1, 2), span(1, 3), span(1, 2)];
const NARROW_REMAINDERS: Record<number, readonly MosaicSpan[]> = {
  1: [span(2, 2)],
  2: [span(1, 2), span(1, 2)],
  3: [span(1, 2), span(1, 2), span(2, 2)],
};

function layout(
  count: number,
  block: readonly MosaicSpan[],
  remainders: Record<number, readonly MosaicSpan[]>,
): MosaicSpan[] {
  const full = Math.floor(count / block.length);
  const rest = count % block.length;
  return [...Array.from({ length: full }, () => block).flat(), ...(remainders[rest] ?? [])];
}

/** Tile sizes for the 4-column (desktop) grid; the first tile is always 2 columns wide. */
export function wideMosaic(count: number): MosaicSpan[] {
  return layout(count, WIDE_BLOCK, WIDE_REMAINDERS);
}

/** Tile sizes for the 2-column (phone and tablet) grid. */
export function narrowMosaic(count: number): MosaicSpan[] {
  return layout(count, NARROW_BLOCK, NARROW_REMAINDERS);
}

// Full class names, so Tailwind finds them when it scans the source.
const NARROW_COLS = { 1: 'col-span-1', 2: 'col-span-2', 4: 'col-span-2' } as const;
const NARROW_ROWS = { 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4' } as const;
const WIDE_COLS = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 4: 'lg:col-span-4' } as const;
const WIDE_ROWS = { 2: 'lg:row-span-2', 3: 'lg:row-span-3', 4: 'lg:row-span-4' } as const;

/** Grid classes for a tile with the given narrow and wide sizes. */
export function spanClasses(narrow: MosaicSpan, wide: MosaicSpan): string {
  return [
    NARROW_COLS[narrow.cols],
    NARROW_ROWS[narrow.rows],
    WIDE_COLS[wide.cols],
    WIDE_ROWS[wide.rows],
  ].join(' ');
}

/** `sizes` attribute matching the tile's rendered width (the page container is at most 1280px). */
export function sizesFor(narrow: MosaicSpan, wide: MosaicSpan): string {
  const desktop = { 1: 320, 2: 640, 4: 1280 }[wide.cols];
  return `(min-width: 1024px) ${desktop}px, ${narrow.cols === 1 ? '50vw' : '100vw'}`;
}

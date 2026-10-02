export interface Page<T> {
  items: readonly T[];
  /** The page actually shown (1-based), clamped to the available range. */
  page: number;
  totalPages: number;
  total: number;
}

/** Slices a list into pages; an out-of-range or invalid page number is clamped, never an error. */
export function paginate<T>(all: readonly T[], requestedPage: unknown, pageSize: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const wanted = Math.floor(Number(requestedPage));
  const page = Number.isFinite(wanted) ? Math.min(Math.max(wanted, 1), totalPages) : 1;
  return {
    items: all.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
    total: all.length,
  };
}

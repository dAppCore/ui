// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.

/**
 * Pagination utility for <core-data-table>.
 *
 * Three exports:
 *   pageCount(totalRows, pageSize) — total number of pages.
 *     Always returns at least 1. Guards pageSize=0 (returns 1).
 *
 *   pageSlice(rows, page, pageSize) — returns the slice of rows for a
 *     given 0-based page index. Returns [] if page is out of range.
 *     Non-mutating.
 *
 *   pageWindow(currentPage, totalPages, windowSize?) — returns an array
 *     of page indices (0-based numbers) + 'gap' sentinels for ellipsis
 *     rendering. windowSize defaults to 2 (pages each side of current).
 *     Always includes first (0) and last (totalPages-1) pages.
 */

export function pageCount(totalRows: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  if (totalRows <= 0) return 1;
  return Math.ceil(totalRows / pageSize);
}

export function pageSlice<T>(rows: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return [...rows];
  const start = page * pageSize;
  return rows.slice(start, start + pageSize);
}

export function pageWindow(
  currentPage: number,
  totalPages: number,
  windowSize = 2,
): (number | 'gap')[] {
  if (totalPages <= 1) return [0];

  const result: (number | 'gap')[] = [];

  const rangeStart = Math.max(0, currentPage - windowSize);
  const rangeEnd = Math.min(totalPages - 1, currentPage + windowSize);

  const pages = new Set<number>();
  pages.add(0);
  pages.add(totalPages - 1);
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && page - prev > 1) {
      result.push('gap');
    }
    result.push(page);
  }

  return result;
}

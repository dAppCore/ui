// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.

/**
 * Sort utility for <core-data-table>.
 *
 * Two exports:
 *   getComparator(type, dir) — returns a (a: unknown, b: unknown) => number
 *     comparator for a column type + direction. null/undefined values are
 *     always pushed to the end (after all defined values) in both asc and desc.
 *
 *   sortRows(rows, key, type, dir, sortFn?) — applies getComparator (or the
 *     custom sortFn) to a copy of rows, keyed by the column's key property.
 *     Non-mutating: returns a new array. Original array is not modified.
 */

export type SortDir = 'asc' | 'desc';
export type ColumnType = 'text' | 'number' | 'date' | 'boolean';

const NULL_SENTINEL = 1;
const DEFINED_SENTINEL = -1;

function nullOrder(a: unknown, b: unknown): number | null {
  const aNull = a === null || a === undefined;
  const bNull = b === null || b === undefined;
  if (aNull && bNull) return 0;
  if (aNull) return NULL_SENTINEL;
  if (bNull) return DEFINED_SENTINEL;
  return null;
}

export function getComparator(
  type: ColumnType,
  dir: SortDir,
): (a: unknown, b: unknown) => number {
  const sign = dir === 'asc' ? 1 : -1;

  return (a: unknown, b: unknown): number => {
    const nullResult = nullOrder(a, b);
    if (nullResult !== null) return nullResult;

    switch (type) {
      case 'text': {
        const sa = String(a);
        const sb = String(b);
        return sign * sa.localeCompare(sb);
      }
      case 'number': {
        return sign * (Number(a) - Number(b));
      }
      case 'date': {
        return sign * (+new Date(a as string | number | Date) - +new Date(b as string | number | Date));
      }
      case 'boolean': {
        return sign * (Number(Boolean(a)) - Number(Boolean(b)));
      }
    }
  };
}

export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  key: string,
  type: ColumnType,
  dir: SortDir,
  sortFn?: (a: T, b: T, dir: SortDir) => number,
): T[] {
  const copy = [...rows];
  if (sortFn) {
    copy.sort((a, b) => sortFn(a, b, dir));
  } else {
    const cmp = getComparator(type, dir);
    copy.sort((a, b) => cmp(a[key], b[key]));
  }
  return copy;
}

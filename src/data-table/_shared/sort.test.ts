// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { getComparator, sortRows, type SortDir, type ColumnType } from './sort';

describe('getComparator()', () => {
  it('text asc: "apple" < "banana"', () => {
    const cmp = getComparator('text', 'asc');
    expect(cmp('apple', 'banana')).toBeLessThan(0);
  });

  it('text desc: "banana" < "apple" (inverted)', () => {
    const cmp = getComparator('text', 'desc');
    expect(cmp('banana', 'apple')).toBeLessThan(0);
  });

  it('text asc: equal strings return 0', () => {
    const cmp = getComparator('text', 'asc');
    expect(cmp('same', 'same')).toBe(0);
  });

  it('number asc: 5 < 10', () => {
    const cmp = getComparator('number', 'asc');
    expect(cmp(5, 10)).toBeLessThan(0);
  });

  it('number desc: 10 < 5 (inverted)', () => {
    const cmp = getComparator('number', 'desc');
    expect(cmp(10, 5)).toBeLessThan(0);
  });

  it('number asc: string-coerced numbers compare numerically', () => {
    const cmp = getComparator('number', 'asc');
    expect(cmp('9', '10')).toBeLessThan(0);
  });

  it('date asc: earlier date sorts first', () => {
    const cmp = getComparator('date', 'asc');
    expect(cmp('2024-01-01', '2024-06-01')).toBeLessThan(0);
  });

  it('date desc: later date sorts first', () => {
    const cmp = getComparator('date', 'desc');
    expect(cmp('2024-06-01', '2024-01-01')).toBeLessThan(0);
  });

  it('boolean asc: false (0) < true (1)', () => {
    const cmp = getComparator('boolean', 'asc');
    expect(cmp(false, true)).toBeLessThan(0);
  });

  it('boolean desc: true < false (inverted)', () => {
    const cmp = getComparator('boolean', 'desc');
    expect(cmp(true, false)).toBeLessThan(0);
  });

  it('null values pushed to end in asc order (null > any defined value)', () => {
    const cmp = getComparator('number', 'asc');
    expect(cmp(null, 5)).toBeGreaterThan(0);
    expect(cmp(5, null)).toBeLessThan(0);
  });

  it('undefined values pushed to end in asc order (undefined > any defined value)', () => {
    const cmp = getComparator('text', 'asc');
    expect(cmp(undefined, 'a')).toBeGreaterThan(0);
    expect(cmp('a', undefined)).toBeLessThan(0);
  });
});

describe('sortRows()', () => {
  const rows = [
    { id: '1', name: 'Charlie', score: 30 },
    { id: '2', name: 'Alice', score: 10 },
    { id: '3', name: 'Bob', score: 20 },
  ];

  it('sorts text column asc', () => {
    const result = sortRows(rows, 'name', 'text', 'asc');
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('sorts text column desc', () => {
    const result = sortRows(rows, 'name', 'text', 'desc');
    expect(result.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('sorts number column asc', () => {
    const result = sortRows(rows, 'score', 'number', 'asc');
    expect(result.map((r) => r.score)).toEqual([10, 20, 30]);
  });

  it('does not mutate the original array', () => {
    const original = [...rows];
    sortRows(rows, 'name', 'text', 'asc');
    expect(rows).toEqual(original);
  });

  it('uses custom sortFn when provided', () => {
    const result = sortRows(rows, 'name', 'text', 'asc', (a, b, dir) => {
      return b.name.localeCompare(a.name);
    });
    expect(result.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('returns a new array instance (non-mutating)', () => {
    const result = sortRows(rows, 'name', 'text', 'asc');
    expect(result).not.toBe(rows);
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { pageCount, pageSlice, pageWindow } from './pagination';

describe('pageCount()', () => {
  it('exact division returns exact count', () => {
    expect(pageCount(20, 5)).toBe(4);
  });

  it('partial last page rounds up', () => {
    expect(pageCount(21, 5)).toBe(5);
  });

  it('0 rows returns 1 (always at least one page)', () => {
    expect(pageCount(0, 10)).toBe(1);
  });

  it('pageSize of 0 returns 1 (guard against divide-by-zero)', () => {
    expect(pageCount(100, 0)).toBe(1);
  });
});

describe('pageSlice()', () => {
  const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  it('page 0, size 3 returns first three items', () => {
    expect(pageSlice(items, 0, 3)).toEqual([0, 1, 2]);
  });

  it('page 1, size 3 returns items 3-5', () => {
    expect(pageSlice(items, 1, 3)).toEqual([3, 4, 5]);
  });

  it('last partial page returns remaining items', () => {
    expect(pageSlice(items, 3, 3)).toEqual([9]);
  });

  it('page beyond last returns empty array', () => {
    expect(pageSlice(items, 99, 3)).toEqual([]);
  });
});

describe('pageWindow()', () => {
  it('small total — no gaps needed (totalPages <= windowSize*2+3)', () => {
    expect(pageWindow(2, 5, 2)).toEqual([0, 1, 2, 3, 4]);
  });

  it('near start — gap only at end', () => {
    expect(pageWindow(1, 10, 2)).toEqual([0, 1, 2, 3, 'gap', 9]);
  });

  it('near end — gap only at start', () => {
    expect(pageWindow(8, 10, 2)).toEqual([0, 'gap', 6, 7, 8, 9]);
  });

  it('in the middle — gaps on both sides', () => {
    expect(pageWindow(5, 12, 2)).toEqual([0, 'gap', 3, 4, 5, 6, 7, 'gap', 11]);
  });

  it('spec example: pageWindow(2, 10, 2) → [0,1,2,3,4,"gap",9]', () => {
    expect(pageWindow(2, 10, 2)).toEqual([0, 1, 2, 3, 4, 'gap', 9]);
  });

  it('totalPages of 1 returns [0]', () => {
    expect(pageWindow(0, 1, 2)).toEqual([0]);
  });

  it('default windowSize is 2 when omitted', () => {
    expect(pageWindow(2, 10)).toEqual([0, 1, 2, 3, 4, 'gap', 9]);
  });

  it('current at last page — gap before last block', () => {
    expect(pageWindow(9, 10, 2)).toEqual([0, 'gap', 7, 8, 9]);
  });
});

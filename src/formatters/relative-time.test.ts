// SPDX-Licence-Identifier: EUPL-1.2
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { relativeTime } from './relative-time.js';

const FIXED_NOW = new Date('2026-05-13T20:00:00Z').getTime();

describe('relativeTime_Good', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(FIXED_NOW));
  afterEach(() => vi.useRealTimers());

  it('formats minutes-ago', () => {
    const past = new Date(FIXED_NOW - 5 * 60 * 1000);
    expect(relativeTime(past)).toMatch(/5 minutes ago/);
  });

  it('formats hours-ago', () => {
    const past = new Date(FIXED_NOW - 3 * 60 * 60 * 1000);
    expect(relativeTime(past)).toMatch(/3 hours ago/);
  });

  it('formats days-ago', () => {
    const past = new Date(FIXED_NOW - 4 * 24 * 60 * 60 * 1000);
    expect(relativeTime(past)).toMatch(/4 days ago/);
  });

  it('formats in-the-future', () => {
    const future = new Date(FIXED_NOW + 2 * 24 * 60 * 60 * 1000);
    expect(relativeTime(future)).toMatch(/in 2 days/);
  });

  it('accepts ISO strings', () => {
    expect(relativeTime('2026-05-13T19:00:00Z')).toMatch(/hour ago/);
  });

  it('accepts numeric millisecond timestamps', () => {
    expect(relativeTime(FIXED_NOW - 60_000)).toMatch(/minute ago/);
  });
});

describe('relativeTime_Bad', () => {
  it('returns empty string for invalid date string', () => {
    expect(relativeTime('not-a-date')).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(relativeTime(null)).toBe('');
    expect(relativeTime(undefined)).toBe('');
  });

  it('returns empty string for invalid Date object', () => {
    expect(relativeTime(new Date('invalid'))).toBe('');
  });
});

describe('relativeTime_Ugly', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(FIXED_NOW));
  afterEach(() => vi.useRealTimers());

  it('renders "now" for sub-second deltas (numeric:auto reads "now")', () => {
    expect(relativeTime(new Date(FIXED_NOW))).toMatch(/now|0 seconds/);
  });

  it('handles year-scale ranges', () => {
    const past = new Date(FIXED_NOW - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(relativeTime(past)).toMatch(/2 years ago/);
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { duration } from './duration.js';

describe('duration_Good', () => {
  it('formats seconds-scale durations', () => {
    expect(duration(90_000)).toBe('1m 30s');
  });

  it('formats hour-scale durations', () => {
    expect(duration(3_600_000)).toBe('1h');
    expect(duration(3_660_000)).toBe('1h 1m');
  });

  it('formats day-scale durations', () => {
    expect(duration(86_400_000)).toBe('1d');
    expect(duration(86_400_000 * 2 + 3_600_000)).toBe('2d 1h');
  });

  it('formats week-scale durations', () => {
    expect(duration(604_800_000)).toBe('1w');
  });

  it('formats year-scale durations', () => {
    expect(duration(31_556_926_000)).toBe('1y');
  });

  it('accepts seconds-input mode', () => {
    expect(duration(90, 'seconds')).toBe('1m 30s');
  });
});

describe('duration_Bad', () => {
  it('returns empty string for negative', () => {
    expect(duration(-1000)).toBe('');
  });

  it('returns empty string for NaN', () => {
    expect(duration(NaN)).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(duration(null)).toBe('');
    expect(duration(undefined)).toBe('');
  });
});

describe('duration_Ugly', () => {
  it('returns empty string for sub-second values', () => {
    expect(duration(500)).toBe('');
  });

  it('coerces numeric strings', () => {
    expect(duration('90000')).toBe('1m 30s');
  });

  it('handles multi-unit composition correctly', () => {
    // 1 year + 2 weeks + 3 days + 4 hours + 5 minutes + 6 seconds in ms
    const ms = 31_556_926_000 + 2 * 604_800_000 + 3 * 86_400_000 + 4 * 3_600_000 + 5 * 60_000 + 6 * 1_000;
    expect(duration(ms)).toBe('1y 2w 3d 4h 5m 6s');
  });
});

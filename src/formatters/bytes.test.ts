// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { bytes } from './bytes.js';

describe('bytes_Good', () => {
  it('formats zero as "0 B"', () => {
    expect(bytes(0)).toBe('0 B');
  });

  it('formats small byte counts with no fractional part', () => {
    expect(bytes(512)).toBe('512 B');
  });

  it('formats kB on the decimal scale', () => {
    expect(bytes(1500)).toBe('1.5 kB');
    expect(bytes(1000)).toBe('1.0 kB');
  });

  it('formats KiB on the binary scale', () => {
    expect(bytes(1024, 'binary')).toBe('1.0 KiB');
    expect(bytes(1536, 'binary')).toBe('1.5 KiB');
  });

  it('scales up through MB / GB / TB', () => {
    expect(bytes(1_000_000)).toBe('1.0 MB');
    expect(bytes(1_500_000_000)).toBe('1.5 GB');
    expect(bytes(2_000_000_000_000)).toBe('2.0 TB');
  });

  it('handles negative byte counts (signed sizes)', () => {
    expect(bytes(-1500)).toBe('-1.5 kB');
  });
});

describe('bytes_Bad', () => {
  it('returns "0 B" for NaN', () => {
    expect(bytes(NaN)).toBe('0 B');
  });

  it('returns "0 B" for Infinity', () => {
    expect(bytes(Infinity)).toBe('0 B');
    expect(bytes(-Infinity)).toBe('0 B');
  });

  it('returns "0 B" for non-numeric strings', () => {
    expect(bytes('hello')).toBe('0 B');
  });

  it('returns "0 B" for null/undefined', () => {
    expect(bytes(null)).toBe('0 B');
    expect(bytes(undefined)).toBe('0 B');
  });
});

describe('bytes_Ugly', () => {
  it('coerces numeric strings', () => {
    expect(bytes('1500')).toBe('1.5 kB');
  });

  it('clamps to the largest known unit on extreme values', () => {
    expect(bytes(1e30)).toMatch(/YB$/);
  });
});

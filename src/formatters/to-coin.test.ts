// SPDX-Licence-Identifier: EUPL-1.2
import { beforeEach, describe, expect, it } from 'vitest';
import { toCoin } from './to-coin.js';
import { resetFormatterContext, setFormatterContext } from './context.js';

describe('toCoin_Good', () => {
  beforeEach(() => resetFormatterContext());

  it('divides by the context divisor', () => {
    setFormatterContext('mining', { coin_divisor: 1e12 });
    expect(toCoin(1_000_000_000_000)).toBe('1.000000000000');
  });

  it('precision tracks divisor magnitude (12 → 12dp)', () => {
    setFormatterContext('mining', { coin_divisor: 1e12 });
    expect(toCoin(500_000_000_000)).toBe('0.500000000000');
  });

  it('precision tracks divisor magnitude (8 → 8dp, BTC-style)', () => {
    setFormatterContext('mining', { coin_divisor: 1e8 });
    expect(toCoin(100_000_000)).toBe('1.00000000');
  });

  it('arg override wins over context', () => {
    setFormatterContext('mining', { coin_divisor: 1e12 });
    expect(toCoin(100_000_000, '100000000')).toBe('1.00000000');
  });
});

describe('toCoin_Bad', () => {
  beforeEach(() => resetFormatterContext());

  it('returns "0" for NaN', () => {
    expect(toCoin(NaN)).toBe('0');
  });

  it('returns "0" for null/undefined', () => {
    expect(toCoin(null)).toBe('0');
    expect(toCoin(undefined)).toBe('0');
  });

  it('falls back to bare value when divisor is missing and no override', () => {
    expect(toCoin(42)).toBe('42');
  });
});

describe('toCoin_Ugly', () => {
  beforeEach(() => resetFormatterContext());

  it('handles fractional inputs', () => {
    setFormatterContext('mining', { coin_divisor: 1e12 });
    expect(toCoin(1_500_000_000_000)).toBe('1.500000000000');
  });

  it('falls through when override is zero (avoids div-by-zero)', () => {
    expect(toCoin(42, '0')).toBe('42');
  });
});

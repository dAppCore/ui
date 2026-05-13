// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { trimZeros } from './trim-zeros.js';

describe('trimZeros_Good', () => {
  it('strips trailing zeros after a decimal point', () => {
    expect(trimZeros('1.2500')).toBe('1.25');
  });

  it('strips the decimal point when all fractional digits are zero', () => {
    expect(trimZeros('1.0000')).toBe('1');
  });

  it('leaves integers unchanged', () => {
    expect(trimZeros('42')).toBe('42');
  });

  it('preserves non-zero trailing digits', () => {
    expect(trimZeros('1.000001')).toBe('1.000001');
  });

  it('accepts numeric inputs (coerced via String)', () => {
    expect(trimZeros(1.5)).toBe('1.5');
  });
});

describe('trimZeros_Bad', () => {
  it('returns empty string for null/undefined', () => {
    expect(trimZeros(null)).toBe('');
    expect(trimZeros(undefined)).toBe('');
  });
});

describe('trimZeros_Ugly', () => {
  it('handles ".5" (leading-dot decimals)', () => {
    expect(trimZeros('.5')).toBe('.5');
  });

  it('handles "1." (trailing-dot integers)', () => {
    expect(trimZeros('1.')).toBe('1');
  });

  it('preserves negative-number prefix', () => {
    expect(trimZeros('-1.500')).toBe('-1.5');
  });
});

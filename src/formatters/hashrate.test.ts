// SPDX-Licence-Identifier: EUPL-1.2
import { beforeEach, describe, expect, it } from 'vitest';
import { hashrate } from './hashrate.js';
import { resetFormatterContext, setFormatterContext } from './context.js';

describe('hashrate_Good', () => {
  beforeEach(() => resetFormatterContext());

  it('formats small rates in H/s', () => {
    expect(hashrate(500)).toBe('500.00 H/s');
  });

  it('scales through KH/s', () => {
    expect(hashrate(1500)).toBe('1.50 KH/s');
    expect(hashrate(1000)).toBe('1.00 KH/s');
  });

  it('scales through MH/s, GH/s, TH/s', () => {
    expect(hashrate(1_500_000)).toBe('1.50 MH/s');
    expect(hashrate(1_500_000_000)).toBe('1.50 GH/s');
    expect(hashrate(1_500_000_000_000)).toBe('1.50 TH/s');
  });

  it('plain mode strips the unit suffix', () => {
    expect(hashrate(1_500_000, 'plain')).toBe('1.50');
  });

  it('mining graph context switches H/s to GH/s', () => {
    setFormatterContext('mining', { graph: true });
    expect(hashrate(1500)).toBe('1.50 KGH/s');
  });
});

describe('hashrate_Bad', () => {
  beforeEach(() => resetFormatterContext());

  it('coerces NaN to zero', () => {
    expect(hashrate(NaN)).toBe('0.00 H/s');
  });

  it('coerces null/undefined to zero', () => {
    expect(hashrate(null)).toBe('0.00 H/s');
    expect(hashrate(undefined)).toBe('0.00 H/s');
  });

  it('coerces strings to zero', () => {
    expect(hashrate('hello')).toBe('0.00 H/s');
  });
});

describe('hashrate_Ugly', () => {
  beforeEach(() => resetFormatterContext());

  it('coerces numeric strings', () => {
    expect(hashrate('1500')).toBe('1.50 KH/s');
  });

  it('clamps to the largest known prefix on extreme values', () => {
    expect(hashrate(1e30)).toMatch(/ZH\/s$/);
  });

  it('handles negative hashrates (signed)', () => {
    expect(hashrate(-1500)).toBe('-1.50 KH/s');
  });
});

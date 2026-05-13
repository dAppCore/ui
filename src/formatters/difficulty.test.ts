// SPDX-Licence-Identifier: EUPL-1.2
import { beforeEach, describe, expect, it } from 'vitest';
import { difficulty } from './difficulty.js';
import { resetFormatterContext, setFormatterContext } from './context.js';

describe('difficulty_Good', () => {
  beforeEach(() => resetFormatterContext());

  it('converts difficulty to hashrate via block time', () => {
    setFormatterContext('mining', { coin_block_time: 120 });
    expect(difficulty(540_000_000_000)).toBe('4.50 GH/s');
  });

  it('graph mode multiplies by 32', () => {
    setFormatterContext('mining', { coin_block_time: 120, graph: true });
    // 540B / 120 = 4.5G  → ×32 = 144G  → hashrate adds " GH/s" suffix
    expect(difficulty(540_000_000_000)).toBe('144.00 GGH/s');
  });

  it('raw mode returns numeric hashrate', () => {
    setFormatterContext('mining', { coin_block_time: 120 });
    expect(difficulty(540_000_000_000, 'raw')).toBe(4_500_000_000);
  });
});

describe('difficulty_Bad', () => {
  beforeEach(() => resetFormatterContext());

  it('returns "0.00 H/s" without context', () => {
    expect(difficulty(540_000_000_000)).toBe('0.00 H/s');
  });

  it('returns "0.00 H/s" when block time is zero', () => {
    setFormatterContext('mining', { coin_block_time: 0 });
    expect(difficulty(540_000_000_000)).toBe('0.00 H/s');
  });

  it('returns 0 in raw mode without context', () => {
    expect(difficulty(540_000_000_000, 'raw')).toBe(0);
  });

  it('handles NaN input', () => {
    setFormatterContext('mining', { coin_block_time: 120 });
    expect(difficulty(NaN)).toBe('0.00 H/s');
  });
});

describe('difficulty_Ugly', () => {
  beforeEach(() => resetFormatterContext());

  it('handles tiny difficulties', () => {
    setFormatterContext('mining', { coin_block_time: 120 });
    expect(difficulty(120)).toBe('1.00 H/s');
  });
});

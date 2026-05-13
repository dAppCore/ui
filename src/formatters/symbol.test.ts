// SPDX-Licence-Identifier: EUPL-1.2
import { beforeEach, describe, expect, it } from 'vitest';
import { symbol } from './symbol.js';
import { resetFormatterContext, setFormatterContext } from './context.js';

describe('symbol_Good', () => {
  beforeEach(() => resetFormatterContext());

  it('appends the context symbol', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    expect(symbol(42)).toBe('42 LTHN');
  });

  it('override arg wins over context', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    expect(symbol(42, 'BTC')).toBe('42 BTC');
  });

  it('falls back to bare value when no symbol is set', () => {
    expect(symbol(42)).toBe('42');
  });
});

describe('symbol_Bad', () => {
  beforeEach(() => resetFormatterContext());

  it('returns just the symbol for null', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    expect(symbol(null)).toBe('LTHN');
  });
});

describe('symbol_Ugly', () => {
  beforeEach(() => resetFormatterContext());

  it('handles zero values', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    expect(symbol(0)).toBe('0 LTHN');
  });
});

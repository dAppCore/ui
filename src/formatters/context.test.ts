// SPDX-Licence-Identifier: EUPL-1.2
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getFormatterContext,
  replaceFormatterContext,
  resetFormatterContext,
  setFormatterContext,
} from './context.js';

describe('context_Good', () => {
  beforeEach(() => resetFormatterContext());

  it('returns set value', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    expect(getFormatterContext('mining', 'symbol')).toBe('LTHN');
  });

  it('merges keys across multiple set calls', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    setFormatterContext('mining', { coin_divisor: 1e12 });
    expect(getFormatterContext('mining', 'symbol')).toBe('LTHN');
    expect(getFormatterContext('mining', 'coin_divisor')).toBe(1e12);
  });

  it('replaceFormatterContext drops missing keys', () => {
    setFormatterContext('mining', { symbol: 'LTHN', coin_divisor: 1e12 });
    replaceFormatterContext('mining', { symbol: 'BTC' });
    expect(getFormatterContext('mining', 'symbol')).toBe('BTC');
    expect(getFormatterContext('mining', 'coin_divisor')).toBeUndefined();
  });
});

describe('context_Bad', () => {
  beforeEach(() => resetFormatterContext());

  it('returns undefined for unknown domain', () => {
    expect(getFormatterContext('nope', 'anything')).toBeUndefined();
  });

  it('returns undefined for unknown key in known domain', () => {
    setFormatterContext('mining', { symbol: 'LTHN' });
    expect(getFormatterContext('mining', 'missing')).toBeUndefined();
  });
});

describe('context_Ugly', () => {
  beforeEach(() => resetFormatterContext());

  it('preserves typed values (numbers, booleans, objects)', () => {
    setFormatterContext('mining', {
      coin_divisor: 1e12,
      graph: true,
      extras: { foo: 'bar' },
    });
    expect(getFormatterContext<number>('mining', 'coin_divisor')).toBe(1e12);
    expect(getFormatterContext<boolean>('mining', 'graph')).toBe(true);
    expect(getFormatterContext<{ foo: string }>('mining', 'extras')).toEqual({ foo: 'bar' });
  });
});

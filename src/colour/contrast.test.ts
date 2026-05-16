// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { contrastRatio, pickReadable, isLight } from './contrast';

describe('contrastRatio', () => {
  it('returns 21 for black vs white', () => {
    const r = contrastRatio('#000000', '#ffffff');
    expect(r).toBeCloseTo(21, 0);
  });
  it('returns 1 for identical colours', () => {
    expect(contrastRatio('#888888', '#888888')).toBeCloseTo(1, 1);
  });
});

describe('pickReadable', () => {
  it('picks the candidate with highest contrast vs bg', () => {
    const picked = pickReadable('#101820', ['#1a1a1a', '#eaeaea', '#808080']);
    expect(picked.l).toBeGreaterThan(0.7);
  });
});

describe('isLight', () => {
  it('returns true for near-white', () => {
    expect(isLight('#fafafa')).toBe(true);
  });
  it('returns false for near-black', () => {
    expect(isLight('#0a0a0a')).toBe(false);
  });
});

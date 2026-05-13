// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { effortColour } from './effort-colour.js';

describe('effortColour_Good', () => {
  it('returns the canonical rgb() format', () => {
    expect(effortColour(50)).toMatch(/^rgb\(\d+,\d+,0\)$/);
  });

  it('on-target effort (95..105) keeps green channel at 128', () => {
    expect(effortColour(100)).toMatch(/rgb\(\d+,128,0\)/);
  });

  it('low effort (<95) keeps green at 128 and ramps red', () => {
    const v = effortColour(50);
    expect(v).toBe('rgb(40,128,0)');
  });

  it('high effort (>105) ramps red to 255 and fades green', () => {
    expect(effortColour(180)).toMatch(/rgb\(255,\d+,0\)/);
  });

  it('extreme over-effort (>200) is pure red', () => {
    expect(effortColour(300)).toBe('rgb(255,0,0)');
  });
});

describe('effortColour_Bad', () => {
  it('returns black when validity is "invalid"', () => {
    expect(effortColour(50, 'invalid')).toBe('black');
  });

  it('returns black for NaN', () => {
    expect(effortColour(NaN)).toBe('black');
  });

  it('returns black for null/undefined', () => {
    expect(effortColour(null)).toBe('black');
    expect(effortColour(undefined)).toBe('black');
  });
});

describe('effortColour_Ugly', () => {
  it('handles zero (best-case effort — block found instantly)', () => {
    expect(effortColour(0)).toBe('rgb(0,128,0)');
  });

  it('handles negative values without throwing', () => {
    const v = effortColour(-50);
    expect(v).toMatch(/^rgb\(-?\d+,\d+,0\)$/);
  });
});

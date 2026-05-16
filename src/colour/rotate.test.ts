// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { rotateHue, lighten, darken, adjustChroma } from './rotate';

describe('rotateHue', () => {
  it('rotates by degrees, wrapping at 360', () => {
    const c = rotateHue({ l: 0.5, c: 0.1, h: 350, alpha: 1 }, 20);
    expect(c.h).toBeCloseTo(10);
  });
  it('accepts a string input', () => {
    const c = rotateHue('oklch(0.5 0.1 100)', 50);
    expect(c.h).toBeCloseTo(150);
  });
});

describe('lighten / darken', () => {
  it('adds to L', () => {
    const c = lighten({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, 0.2);
    expect(c.l).toBeCloseTo(0.6);
  });
  it('subtracts from L', () => {
    const c = darken({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, 0.2);
    expect(c.l).toBeCloseTo(0.2);
  });
  it('clamps L to 0..1', () => {
    expect(lighten({ l: 0.9, c: 0.1, h: 0, alpha: 1 }, 0.5).l).toBe(1);
    expect(darken({ l: 0.1, c: 0.1, h: 0, alpha: 1 }, 0.5).l).toBe(0);
  });
});

describe('adjustChroma', () => {
  it('clamps at 0', () => {
    const c = adjustChroma({ l: 0.5, c: 0.05, h: 100, alpha: 1 }, -0.2);
    expect(c.c).toBe(0);
  });
});

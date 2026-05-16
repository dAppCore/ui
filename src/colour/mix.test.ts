// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { mix } from './mix';

describe('mix', () => {
  it('t=0 returns a', () => {
    const a = { l: 0.4, c: 0.1, h: 100, alpha: 1 };
    const b = { l: 0.6, c: 0.2, h: 200, alpha: 1 };
    const m = mix(a, b, 0);
    expect(m.l).toBeCloseTo(0.4);
    expect(m.h).toBeCloseTo(100);
  });
  it('t=1 returns b', () => {
    const m = mix({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, { l: 0.6, c: 0.2, h: 200, alpha: 1 }, 1);
    expect(m.h).toBeCloseTo(200);
  });
  it('t=0.5 returns midpoint', () => {
    const m = mix({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, { l: 0.6, c: 0.3, h: 100, alpha: 1 }, 0.5);
    expect(m.l).toBeCloseTo(0.5);
    expect(m.c).toBeCloseTo(0.2);
  });
  it('takes the shorter hue arc', () => {
    const m = mix({ l: 0.5, c: 0.1, h: 350, alpha: 1 }, { l: 0.5, c: 0.1, h: 10, alpha: 1 }, 0.5);
    // shorter arc passes through 0/360, not through 180
    expect(Math.abs(m.h)).toBeLessThan(20);
  });
});

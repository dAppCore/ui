// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { clamp, lerp, mapRange, wrap, snap } from './clamp';

describe('clamp', () => {
  it('clamps below min', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it('clamps above max', () => { expect(clamp(20, 0, 10)).toBe(10); });
  it('passes through in-range', () => { expect(clamp(5, 0, 10)).toBe(5); });
});

describe('lerp', () => {
  it('returns a at t=0', () => { expect(lerp(10, 20, 0)).toBe(10); });
  it('returns b at t=1', () => { expect(lerp(10, 20, 1)).toBe(20); });
  it('returns midpoint at t=0.5', () => { expect(lerp(10, 20, 0.5)).toBe(15); });
  it('does not clamp', () => { expect(lerp(0, 10, 2)).toBe(20); });
});

describe('mapRange', () => {
  it('maps 5 in [0,10] to 50 in [0,100]', () => {
    expect(mapRange(5, [0, 10], [0, 100])).toBe(50);
  });
  it('maps in reverse', () => {
    expect(mapRange(0, [-1, 1], [100, 0])).toBe(50);
  });
  it('returns dst[0] for zero-span src', () => {
    expect(mapRange(5, [5, 5], [10, 20])).toBe(10);
  });
});

describe('wrap', () => {
  it('wraps positive overflow', () => { expect(wrap(370, 0, 360)).toBe(10); });
  it('wraps negative underflow', () => { expect(wrap(-10, 0, 360)).toBe(350); });
  it('passes through in-range', () => { expect(wrap(180, 0, 360)).toBe(180); });
});

describe('snap', () => {
  it('snaps to nearest step', () => { expect(snap(7.3, 0.5)).toBe(7.5); });
  it('respects origin', () => { expect(snap(7.3, 0.5, 0.1)).toBe(7.1); });
  it('passes through when step=0', () => { expect(snap(7.3, 0)).toBe(7.3); });
});

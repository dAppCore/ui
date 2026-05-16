// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { interpolate, animate } from './interpolate';
import { Easing } from './easing';

describe('interpolate', () => {
  it('linearly maps between two keyframes', () => {
    const f = interpolate([0, 1], [0, 100]);
    expect(f(0)).toBe(0);
    expect(f(0.5)).toBe(50);
    expect(f(1)).toBe(100);
  });
  it('clamps below first keyframe', () => {
    const f = interpolate([0, 1], [10, 20]);
    expect(f(-1)).toBe(10);
  });
  it('clamps above last keyframe', () => {
    const f = interpolate([0, 1], [10, 20]);
    expect(f(2)).toBe(20);
  });
  it('supports per-segment easing arrays', () => {
    const f = interpolate([0, 0.5, 1], [0, 100, 50], [Easing.linear, Easing.easeOutQuad]);
    expect(f(0.25)).toBeCloseTo(50);
  });
});

describe('animate', () => {
  it('returns from before start', () => {
    const f = animate({ from: 0, to: 1, start: 0.2, end: 0.8 });
    expect(f(0)).toBe(0);
  });
  it('returns to after end', () => {
    const f = animate({ from: 0, to: 1, start: 0.2, end: 0.8 });
    expect(f(1)).toBe(1);
  });
  it('eases through the active window', () => {
    const f = animate({ from: 0, to: 100, ease: Easing.linear });
    expect(f(0.5)).toBeCloseTo(50);
  });
});

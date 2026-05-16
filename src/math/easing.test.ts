// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { Easing } from './easing';

describe('Easing — endpoints', () => {
  const names = Object.keys(Easing);
  it.each(names)('%s(0) === 0', (name) => {
    expect(Easing[name](0)).toBeCloseTo(0, 5);
  });
  it.each(names)('%s(1) === 1', (name) => {
    expect(Easing[name](1)).toBeCloseTo(1, 5);
  });
});

describe('Easing — selected golden values', () => {
  it('linear is identity', () => {
    expect(Easing.linear(0.5)).toBe(0.5);
  });
  it('easeInQuad(0.5) = 0.25', () => {
    expect(Easing.easeInQuad(0.5)).toBeCloseTo(0.25);
  });
  it('easeOutQuad(0.5) = 0.75', () => {
    expect(Easing.easeOutQuad(0.5)).toBeCloseTo(0.75);
  });
  it('easeInOutCubic crosses 0.5 at t=0.5', () => {
    expect(Easing.easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });
});

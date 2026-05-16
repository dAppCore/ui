// SPDX-Licence-Identifier: EUPL-1.2
// clamp ported from: core/ide/frontend/lit/src/elements/animation/easing.ts (2026-05-07).
// lerp/mapRange/wrap/snap new for @dappcore/ui v0.2.

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

/**
 * Unclamped linear interpolation. lerp(0, 100, 0.25) === 25.
 */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/**
 * Linearly map a value from one numeric range to another.
 * mapRange(5, [0, 10], [0, 100]) === 50.
 */
export function mapRange(
  v: number,
  src: [number, number],
  dst: [number, number],
): number {
  const [a, b] = src, [c, d] = dst;
  const span = b - a;
  if (span === 0) return c;
  return c + ((v - a) / span) * (d - c);
}

/**
 * Wrap a value into [min, max) cyclically. Useful for hue rotation, angle math.
 * wrap(370, 0, 360) === 10.
 */
export function wrap(v: number, min: number, max: number): number {
  const span = max - min;
  if (span === 0) return min;
  return ((((v - min) % span) + span) % span) + min;
}

/**
 * Quantise a value to the nearest step starting from `origin` (default 0).
 * snap(7.3, 0.5) === 7.5.
 */
export function snap(v: number, step: number, origin = 0): number {
  if (step === 0) return v;
  return origin + Math.round((v - origin) / step) * step;
}

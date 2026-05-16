// SPDX-Licence-Identifier: EUPL-1.2
// Ported from: core/ide/frontend/lit/src/elements/animation/easing.ts (2026-05-07).
import { Easing, type EasingFn } from './easing';

/**
 * Popmotion-style keyframe interpolation: linearly map t across input
 * keyframes to output values, optionally easing per segment.
 *
 *   const x = interpolate([0, 0.5, 1], [0, 100, 50], Easing.easeInOutCubic);
 *   x(0.25); // → eased value between 0 and 100
 */
export function interpolate(
  input: number[],
  output: number[],
  ease: EasingFn | EasingFn[] = Easing.linear,
): EasingFn {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

export interface AnimateOpts {
  from?: number;
  to?: number;
  start?: number;
  end?: number;
  ease?: EasingFn;
}

/**
 * Simpler single-segment tween. Returns `from` before `start`, `to` after `end`.
 *
 *   const opacity = animate({ from: 0, to: 1, start: 0, end: 0.5 });
 *   opacity(0.25); // → 0.5 (eased default = easeInOutCubic)
 */
export function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic,
}: AnimateOpts = {}): EasingFn {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

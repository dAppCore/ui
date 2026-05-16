// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// Perceptual mid-colour in oklch. Note: CSS color-mix(in oklch, ...) is
// native in modern browsers — prefer that in CSS contexts. This helper is
// for non-CSS sinks (canvas, SVG, animation lerp).
import type { Colour } from './types';
import { parseColour } from './parse';

function asColour(input: Colour | string): Colour {
  return typeof input === 'string' ? parseColour(input) : input;
}

export function mix(a: Colour | string, b: Colour | string, t: number): Colour {
  const ca = asColour(a), cb = asColour(b);
  // Hue: take the shorter arc.
  let dh = cb.h - ca.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = (ca.h + dh * t + 360) % 360;
  return {
    l: ca.l + (cb.l - ca.l) * t,
    c: ca.c + (cb.c - ca.c) * t,
    h,
    alpha: ca.alpha + (cb.alpha - ca.alpha) * t,
  };
}

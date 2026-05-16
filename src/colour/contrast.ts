// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// WCAG 2.x luminance-based contrast. (APCA deferred to a follow-up.)
import type { Colour } from './types';
import { parseColour } from './parse';
import { oklchToRgb } from './convert';

function asColour(input: Colour | string): Colour {
  return typeof input === 'string' ? parseColour(input) : input;
}

function relativeLuminance(c: Colour | string): number {
  const rgb = oklchToRgb(asColour(c));
  const channel = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: Colour | string, b: Colour | string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function pickReadable(
  bg: Colour | string,
  candidates: Array<Colour | string>,
): Colour {
  let best: Colour | string = candidates[0];
  let bestRatio = -1;
  for (const cand of candidates) {
    const r = contrastRatio(bg, cand);
    if (r > bestRatio) { bestRatio = r; best = cand; }
  }
  return asColour(best);
}

export function isLight(c: Colour | string): boolean {
  return relativeLuminance(c) > 0.5;
}

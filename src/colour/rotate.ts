// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { Colour } from './types';
import { parseColour } from './parse';

function asColour(input: Colour | string): Colour {
  return typeof input === 'string' ? parseColour(input) : input;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function rotateHue(input: Colour | string, deg: number): Colour {
  const c = asColour(input);
  const h = (((c.h + deg) % 360) + 360) % 360;
  return { ...c, h };
}

export function lighten(input: Colour | string, amount: number): Colour {
  const c = asColour(input);
  return { ...c, l: clamp01(c.l + amount) };
}

export function darken(input: Colour | string, amount: number): Colour {
  const c = asColour(input);
  return { ...c, l: clamp01(c.l - amount) };
}

export function adjustChroma(input: Colour | string, delta: number): Colour {
  const c = asColour(input);
  return { ...c, c: Math.max(0, c.c + delta) };
}

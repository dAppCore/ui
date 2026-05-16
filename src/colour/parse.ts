// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { Colour } from './types';
import { hexToOklch, rgbToOklch, hslToOklch } from './convert';

const OKLCH_RE = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;
const HEX_RE = /^#([0-9a-f]{3,8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i;
const HSL_RE = /^hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%(?:[,\s/]+([\d.]+%?))?\s*\)$/i;

function parsePercent(v: string | undefined, def = 1): number {
  if (v === undefined) return def;
  if (v.endsWith('%')) return parseFloat(v) / 100;
  return parseFloat(v);
}

export function parseColour(input: string): Colour {
  const s = input.trim();

  const ok = OKLCH_RE.exec(s);
  if (ok) {
    return {
      l: parsePercent(ok[1]),
      c: parseFloat(ok[2]),
      h: parseFloat(ok[3]),
      alpha: parsePercent(ok[4]),
    };
  }

  const hex = HEX_RE.exec(s);
  if (hex) return hexToOklch(s);

  const rgb = RGB_RE.exec(s);
  if (rgb) {
    return rgbToOklch({
      r: parseFloat(rgb[1]) / 255,
      g: parseFloat(rgb[2]) / 255,
      b: parseFloat(rgb[3]) / 255,
      alpha: parsePercent(rgb[4]),
    });
  }

  const hsl = HSL_RE.exec(s);
  if (hsl) {
    return hslToOklch({
      h: parseFloat(hsl[1]),
      s: parseFloat(hsl[2]) / 100,
      l: parseFloat(hsl[3]) / 100,
      alpha: parsePercent(hsl[4]),
    });
  }

  throw new Error(`parseColour: unrecognised format "${input}"`);
}

export function formatOklch(c: Colour): string {
  return `oklch(${c.l} ${c.c} ${c.h} / ${c.alpha})`;
}

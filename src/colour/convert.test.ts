// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import {
  oklchToRgb, rgbToOklch, hexToOklch, oklchToHex, hslToOklch, oklchToHsl,
} from './convert';

describe('oklch <-> rgb round-trip', () => {
  it('round-trips a mid-saturation colour within 1 sRGB unit', () => {
    const start = { l: 0.54, c: 0.16, h: 305, alpha: 1 };
    const rgb = oklchToRgb(start);
    const back = rgbToOklch(rgb);
    expect(back.l).toBeCloseTo(start.l, 2);
    expect(back.c).toBeCloseTo(start.c, 2);
    expect(back.h).toBeCloseTo(start.h, 1);
  });

  it('gamut-clips colours outside sRGB', () => {
    const oog = { l: 0.6, c: 0.5, h: 0, alpha: 1 }; // chroma > sRGB-reachable
    const rgb = oklchToRgb(oog);
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(1);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
  });
});

describe('hex <-> oklch', () => {
  it('parses #ff0000 to a red-ish oklch', () => {
    const c = hexToOklch('#ff0000');
    expect(c.l).toBeGreaterThan(0.5);
    expect(c.c).toBeGreaterThan(0.1);
    expect(c.h).toBeGreaterThan(20);
    expect(c.h).toBeLessThan(40);
  });

  it('round-trips #336699 within rounding', () => {
    const c = hexToOklch('#336699');
    const hex = oklchToHex(c);
    expect(hex.toLowerCase()).toBe('#336699');
  });

  it('parses 3-digit hex', () => {
    expect(hexToOklch('#f00').l).toBeGreaterThan(0);
  });
});

describe('hsl <-> oklch', () => {
  it('parses pure red hsl', () => {
    const c = hslToOklch({ h: 0, s: 1, l: 0.5, alpha: 1 });
    expect(c.c).toBeGreaterThan(0.1);
  });

  it('round-trips through hsl with tolerance', () => {
    const oklch = { l: 0.6, c: 0.1, h: 200, alpha: 1 };
    const hsl = oklchToHsl(oklch);
    const back = hslToOklch(hsl);
    expect(back.h).toBeCloseTo(oklch.h, 0);
  });
});

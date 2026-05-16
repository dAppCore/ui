// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// W3C CSS Color Level 4 — oklab/oklch ↔ linear sRGB ↔ sRGB ↔ hex.
import type { Colour, RGB, HSL } from './types';

/* ── sRGB ↔ linear sRGB (gamma) ── */

function gammaToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToGamma(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/* ── linear sRGB ↔ oklab ── (matrices per CSS Color 4) */

function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const lc = l_ * l_ * l_, mc = m_ * m_ * m_, sc = s_ * s_ * s_;
  return [
    +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc,
  ];
}

/* ── oklch ↔ oklab ── */

function oklchToOklab(c: Colour): [number, number, number] {
  const rad = (c.h * Math.PI) / 180;
  return [c.l, c.c * Math.cos(rad), c.c * Math.sin(rad)];
}

function oklabToOklch(L: number, a: number, b: number): { l: number; c: number; h: number } {
  const chroma = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: chroma, h };
}

/* ── gamut clipping (chroma reduction) ── */

function inGamut(r: number, g: number, b: number): boolean {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;
}

export function oklchToRgb(input: Colour): RGB {
  let { l, c, h, alpha } = input;
  // Binary-chop chroma down until the colour fits sRGB.
  let lo = 0, hi = c;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const [La, aa, ba] = oklchToOklab({ l, c: mid, h, alpha });
    const [lr, lg, lb] = oklabToLinearRgb(La, aa, ba);
    r = linearToGamma(lr); g = linearToGamma(lg); b = linearToGamma(lb);
    if (inGamut(r, g, b)) lo = mid;
    else hi = mid;
  }
  // Final clamp to handle floating noise.
  return {
    r: Math.max(0, Math.min(1, r)),
    g: Math.max(0, Math.min(1, g)),
    b: Math.max(0, Math.min(1, b)),
    alpha,
  };
}

export function rgbToOklch(rgb: RGB): Colour {
  const lr = gammaToLinear(rgb.r);
  const lg = gammaToLinear(rgb.g);
  const lb = gammaToLinear(rgb.b);
  const [L, a, b] = linearRgbToOklab(lr, lg, lb);
  const { l, c, h } = oklabToOklch(L, a, b);
  return { l, c, h, alpha: rgb.alpha };
}

/* ── hex ↔ oklch ── */

export function hexToOklch(hex: string): Colour {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
  if (h.length === 4) {
    const expanded = h.split('').map((ch) => ch + ch).join('');
    h = expanded;
  }
  if (h.length === 6) h += 'ff';
  if (h.length !== 8) throw new Error(`hexToOklch: invalid hex "${hex}"`);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = parseInt(h.slice(6, 8), 16) / 255;
  return rgbToOklch({ r, g, b, alpha: a });
}

export function oklchToHex(c: Colour): string {
  const rgb = oklchToRgb(c);
  const r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
  if (rgb.alpha >= 1) return `#${r}${g}${b}`;
  const a = Math.round(rgb.alpha * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}${a}`;
}

/* ── hsl ↔ oklch (via sRGB) ── */

function hslToRgb({ h, s, l, alpha }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1)      { r1 = c; g1 = x; b1 = 0; }
  else if (hp < 2) { r1 = x; g1 = c; b1 = 0; }
  else if (hp < 3) { r1 = 0; g1 = c; b1 = x; }
  else if (hp < 4) { r1 = 0; g1 = x; b1 = c; }
  else if (hp < 5) { r1 = x; g1 = 0; b1 = c; }
  else             { r1 = c; g1 = 0; b1 = x; }
  const m = l - c / 2;
  return { r: r1 + m, g: g1 + m, b: b1 + m, alpha };
}

function rgbToHsl({ r, g, b, alpha }: RGB): HSL {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l, alpha };
}

export function hslToOklch(hsl: HSL): Colour {
  return rgbToOklch(hslToRgb(hsl));
}

export function oklchToHsl(c: Colour): HSL {
  return rgbToHsl(oklchToRgb(c));
}

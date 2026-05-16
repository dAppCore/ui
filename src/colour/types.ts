// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

/**
 * Internal oklch representation used by every colour helper.
 *   l: 0..1 (lightness, perceptual)
 *   c: 0..~0.4 (chroma; sRGB rarely exceeds 0.37)
 *   h: 0..360 (hue, degrees)
 *   alpha: 0..1
 */
export interface Colour {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export interface RGB { r: number; g: number; b: number; alpha: number }
export interface HSL { h: number; s: number; l: number; alpha: number }

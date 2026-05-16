// SPDX-Licence-Identifier: EUPL-1.2
// AX: each test is a copy-pastable usage example.
import { describe, it, expect } from 'vitest';
import {
  parseColour, formatOklch, rotateHue, lighten, mix, contrastRatio,
  pickReadable, oklchToHex,
} from './index';

describe('@dappcore/ui/colour — usage examples', () => {
  it('example: pick a readable foreground for a brand background', () => {
    const bg = parseColour('oklch(0.54 0.16 305)');
    const fg = pickReadable(bg, ['oklch(0.97 0 0)', 'oklch(0.18 0 0)']);
    expect(contrastRatio(bg, fg)).toBeGreaterThan(4.5);
  });

  it('example: derive a hover state by lightening 5%', () => {
    const base = 'oklch(0.54 0.16 305)';
    const hover = lighten(base, 0.05);
    expect(hover.l).toBeCloseTo(0.59);
  });

  it('example: build an analogous accent by rotating hue 30°', () => {
    const accent = rotateHue('oklch(0.54 0.16 305)', 30);
    expect(accent.h).toBeCloseTo(335);
  });

  it('example: lerp a colour for a canvas animation frame', () => {
    const start = 'oklch(0.4 0.1 100)';
    const end = 'oklch(0.6 0.1 200)';
    const half = mix(start, end, 0.5);
    expect(half.h).toBeCloseTo(150);
  });

  it('example: round-trip an oklch colour through hex', () => {
    const c = parseColour('oklch(0.54 0.16 305)');
    expect(oklchToHex(c)).toMatch(/^#[0-9a-f]{6}$/);
    expect(formatOklch(c)).toContain('305');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { parseColour, formatOklch } from './parse';

describe('parseColour', () => {
  it('parses oklch() with alpha', () => {
    const c = parseColour('oklch(0.54 0.16 305 / 0.5)');
    expect(c.l).toBeCloseTo(0.54);
    expect(c.c).toBeCloseTo(0.16);
    expect(c.h).toBeCloseTo(305);
    expect(c.alpha).toBeCloseTo(0.5);
  });

  it('parses oklch() without alpha (defaults to 1)', () => {
    const c = parseColour('oklch(0.5 0.1 200)');
    expect(c.alpha).toBe(1);
  });

  it('parses #rrggbb hex', () => {
    const c = parseColour('#ff0000');
    expect(c.l).toBeGreaterThan(0);
    expect(c.c).toBeGreaterThan(0);
  });

  it('parses #rrggbbaa hex', () => {
    const c = parseColour('#ff000080');
    expect(c.alpha).toBeCloseTo(0.5, 1);
  });

  it('parses rgb()', () => {
    const c = parseColour('rgb(255, 0, 0)');
    expect(c.alpha).toBe(1);
  });

  it('parses hsl()', () => {
    const c = parseColour('hsl(0, 100%, 50%)');
    expect(c.h).toBeGreaterThanOrEqual(0);
  });

  it('throws on unknown format', () => {
    expect(() => parseColour('chartreuse')).toThrow();
  });
});

describe('formatOklch', () => {
  it('emits CSS-valid oklch() string', () => {
    const s = formatOklch({ l: 0.54, c: 0.16, h: 305, alpha: 1 });
    expect(s).toBe('oklch(0.54 0.16 305 / 1)');
  });

  it('preserves alpha < 1', () => {
    const s = formatOklch({ l: 0.5, c: 0.1, h: 0, alpha: 0.25 });
    expect(s).toContain('/ 0.25');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supportsAnchorPositioning, computePosition, type Placement, type PositionResult } from './anchor-position';

function setRect(el: HTMLElement, rect: DOMRect): void {
  el.getBoundingClientRect = () => rect;
}

function makeRect(x: number, y: number, w: number, h: number): DOMRect {
  return {
    x, y, width: w, height: h,
    top: y, left: x, right: x + w, bottom: y + h,
    toJSON() { return this; },
  } as DOMRect;
}

describe('supportsAnchorPositioning()', () => {
  it('returns a boolean', () => {
    const result = supportsAnchorPositioning();
    expect(typeof result).toBe('boolean');
  });

  it('does NOT use CSS.supports("anchor-name", ...) — happy-dom returns true incorrectly', () => {
    const result = supportsAnchorPositioning();
    expect(result).toBe(false);
  });
});

describe('computePosition()', () => {
  let anchor: HTMLElement;
  let surface: HTMLElement;

  beforeEach(() => {
    anchor = document.createElement('button');
    surface = document.createElement('div');
    document.body.appendChild(anchor);
    document.body.appendChild(surface);
    setRect(anchor, makeRect(200, 300, 100, 40));
    setRect(surface, makeRect(0, 0, 160, 80));
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });

  afterEach(() => {
    anchor.remove();
    surface.remove();
  });

  it('placement "bottom" places surface below anchor, centred horizontally', () => {
    const result: PositionResult = computePosition(anchor, surface, 'bottom', 4);
    expect(result.left).toBeCloseTo(170, 0);
    expect(result.top).toBeCloseTo(344, 0);
    expect(result.placement).toBe('bottom');
  });

  it('placement "top" places surface above anchor, centred horizontally', () => {
    const result: PositionResult = computePosition(anchor, surface, 'top', 4);
    expect(result.top).toBeCloseTo(216, 0);
    expect(result.placement).toBe('top');
  });

  it('placement "end" places surface to the right of anchor, centred vertically', () => {
    const result: PositionResult = computePosition(anchor, surface, 'end', 4);
    expect(result.left).toBeCloseTo(304, 0);
    expect(result.placement).toBe('end');
  });

  it('placement "start" places surface to the left of anchor, centred vertically', () => {
    const result: PositionResult = computePosition(anchor, surface, 'start', 4);
    expect(result.left).toBeCloseTo(36, 0);
    expect(result.placement).toBe('start');
  });

  it('placement "bottom-start" aligns surface left edge to anchor left edge', () => {
    const result: PositionResult = computePosition(anchor, surface, 'bottom-start', 4);
    expect(result.left).toBeCloseTo(200, 0);
    expect(result.placement).toBe('bottom-start');
  });

  it('placement "bottom-end" aligns surface right edge to anchor right edge', () => {
    const result: PositionResult = computePosition(anchor, surface, 'bottom-end', 4);
    expect(result.left).toBeCloseTo(140, 0);
    expect(result.placement).toBe('bottom-end');
  });

  it('placement "top-start" places surface above anchor, left-aligned', () => {
    const result: PositionResult = computePosition(anchor, surface, 'top-start', 4);
    expect(result.left).toBeCloseTo(200, 0);
    expect(result.top).toBeCloseTo(216, 0);
    expect(result.placement).toBe('top-start');
  });

  it('flips "bottom" to "top" when surface would overflow viewport bottom', () => {
    setRect(anchor, makeRect(200, 700, 100, 40));
    const result: PositionResult = computePosition(anchor, surface, 'bottom', 4);
    expect(result.placement).toBe('top');
  });

  it('flips "top" to "bottom" when surface would overflow viewport top', () => {
    setRect(anchor, makeRect(200, 10, 100, 40));
    const result: PositionResult = computePosition(anchor, surface, 'top', 4);
    expect(result.placement).toBe('bottom');
  });

  it('clamps left to 0 when surface would overflow viewport left edge', () => {
    setRect(anchor, makeRect(5, 300, 100, 40));
    const result: PositionResult = computePosition(anchor, surface, 'bottom', 4);
    expect(result.left).toBeGreaterThanOrEqual(0);
  });
});

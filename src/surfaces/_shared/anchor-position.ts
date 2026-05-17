// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.

/**
 * Anchor-positioning utility for CoreUI v0.8 surfaces.
 *
 * Two exports:
 *   supportsAnchorPositioning() — probe via 'anchorName' in el.style (NOT
 *     CSS.supports, which lies in happy-dom and older Chromium). Returns true
 *     only when the browser exposes anchorName on CSSStyleDeclaration.
 *
 *   computePosition(anchor, surface, placement, offset) — pure geometry
 *     fallback for Safari / Firefox / happy-dom. Used by CoreAnchoredElement
 *     when supportsAnchorPositioning() returns false.
 */

export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'start' | 'start-start' | 'start-end'
  | 'end' | 'end-start' | 'end-end';

export interface PositionResult {
  top: number;
  left: number;
  placement: Placement;
}

let _anchorSupport: boolean | null = null;

export function supportsAnchorPositioning(): boolean {
  if (_anchorSupport !== null) return _anchorSupport;
  try {
    // CSS.supports('anchor-name', ...) returns true in happy-dom and older
    // Chromium despite the feature being absent. getComputedStyle also echoes
    // inline styles in happy-dom, so neither is reliable.
    //
    // The authoritative probe: check whether 'anchorName' is a recognised
    // property on CSSStyleDeclaration. Browsers with native CSS anchor
    // positioning (Chromium 125+) expose it; happy-dom and older engines do not.
    const probe = document.createElement('div');
    _anchorSupport = 'anchorName' in probe.style;
  } catch {
    _anchorSupport = false;
  }
  return _anchorSupport;
}

export function _resetAnchorSupportCache(): void {
  _anchorSupport = null;
}

type Side = 'top' | 'bottom' | 'start' | 'end';

function primarySide(placement: Placement): Side {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('start')) return 'start';
  return 'end';
}

function alignmentSuffix(placement: Placement): '' | '-start' | '-end' {
  if (placement.endsWith('-start')) return '-start';
  if (placement.endsWith('-end')) return '-end';
  return '';
}

function buildPlacement(side: Side, suffix: '' | '-start' | '-end'): Placement {
  return (side + suffix) as Placement;
}

export function computePosition(
  anchor: Element,
  surface: HTMLElement,
  placement: Placement,
  offset: number,
): PositionResult {
  const ar = anchor.getBoundingClientRect();
  const sr = surface.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let side = primarySide(placement);
  const suffix = alignmentSuffix(placement);

  function coords(s: Side): { top: number; left: number } {
    let top: number;
    let left: number;

    if (s === 'top') {
      top = ar.top - offset - sr.height;
      left = suffix === '-start'
        ? ar.left
        : suffix === '-end'
          ? ar.right - sr.width
          : ar.left + ar.width / 2 - sr.width / 2;
    } else if (s === 'bottom') {
      top = ar.bottom + offset;
      left = suffix === '-start'
        ? ar.left
        : suffix === '-end'
          ? ar.right - sr.width
          : ar.left + ar.width / 2 - sr.width / 2;
    } else if (s === 'start') {
      left = ar.left - offset - sr.width;
      top = suffix === '-start'
        ? ar.top
        : suffix === '-end'
          ? ar.bottom - sr.height
          : ar.top + ar.height / 2 - sr.height / 2;
    } else {
      left = ar.right + offset;
      top = suffix === '-start'
        ? ar.top
        : suffix === '-end'
          ? ar.bottom - sr.height
          : ar.top + ar.height / 2 - sr.height / 2;
    }
    return { top, left };
  }

  let { top, left } = coords(side);

  if (side === 'bottom' && top + sr.height > vh) {
    const flippedCoords = coords('top');
    if (flippedCoords.top >= 0) {
      side = 'top';
      ({ top, left } = flippedCoords);
    }
  } else if (side === 'top' && top < 0) {
    const flippedCoords = coords('bottom');
    if (flippedCoords.top + sr.height <= vh) {
      side = 'bottom';
      ({ top, left } = flippedCoords);
    }
  } else if (side === 'end' && left + sr.width > vw) {
    const flippedCoords = coords('start');
    if (flippedCoords.left >= 0) {
      side = 'start';
      ({ top, left } = flippedCoords);
    }
  } else if (side === 'start' && left < 0) {
    const flippedCoords = coords('end');
    if (flippedCoords.left + sr.width <= vw) {
      side = 'end';
      ({ top, left } = flippedCoords);
    }
  }

  left = Math.max(0, Math.min(left, vw - sr.width));
  top = Math.max(0, Math.min(top, vh - sr.height));

  return {
    top,
    left,
    placement: buildPlacement(side, suffix),
  };
}

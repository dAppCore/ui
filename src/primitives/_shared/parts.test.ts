// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { PART } from './parts';

describe('PART vocabulary constants', () => {
  it('exposes the documented vocabulary', () => {
    expect(PART.BASE).toBe('base');
    expect(PART.LABEL).toBe('label');
    expect(PART.ICON_LEADING).toBe('icon-leading');
    expect(PART.ICON_TRAILING).toBe('icon-trailing');
    expect(PART.INDICATOR).toBe('indicator');
    expect(PART.TRACK).toBe('track');
    expect(PART.THUMB).toBe('thumb');
    expect(PART.CONTROL).toBe('control');
    expect(PART.MARKER).toBe('marker');
  });
});

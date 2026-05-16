// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { watchClickOutside } from './click-outside';

describe('watchClickOutside', () => {
  it('fires when pointerdown is outside the target', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const handler = vi.fn();
    watchClickOutside(el, handler);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(handler).toHaveBeenCalled();
  });
  it('does not fire when pointerdown is inside the target', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const handler = vi.fn();
    watchClickOutside(el, handler);
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });
});

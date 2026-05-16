// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { addAbortableListener } from './listener';

describe('addAbortableListener', () => {
  it('fires the handler on event', () => {
    const handler = vi.fn();
    addAbortableListener(window, 'resize', handler);
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it('does not fire after abort()', () => {
    const handler = vi.fn();
    const ctrl = addAbortableListener(window, 'resize', handler);
    ctrl.abort();
    window.dispatchEvent(new Event('resize'));
    expect(handler).not.toHaveBeenCalled();
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { saveFocus, restoreFocus } from './focus';

describe('saveFocus / restoreFocus', () => {
  it('round-trips focus', () => {
    const a = document.createElement('button');
    const b = document.createElement('button');
    document.body.append(a, b);
    a.focus();
    const handle = saveFocus();
    b.focus();
    restoreFocus(handle);
    expect(document.activeElement).toBe(a);
  });
});

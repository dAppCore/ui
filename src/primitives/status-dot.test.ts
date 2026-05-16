// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide (semantics
// ported from core/ide/frontend/lit/src/elements/atoms/lethean-status-dot.ts).
import { describe, it, expect } from 'vitest';
import './status-dot';

describe('<core-status-dot>', () => {
  it('renders into light DOM with [part="base"] and [part="indicator"]', async () => {
    const el = document.createElement('core-status-dot');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[part="base"]')).not.toBeNull();
    expect(el.querySelector('[part="indicator"]')).not.toBeNull();
  });

  it('reflects state attribute', async () => {
    const el = document.createElement('core-status-dot');
    el.setAttribute('state', 'good');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('state')).toBe('good');
  });

  it('applies role="status"', async () => {
    const el = document.createElement('core-status-dot');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('role')).toBe('status');
  });

  it('reflects size attribute (sm/md/lg)', async () => {
    const el = document.createElement('core-status-dot');
    el.setAttribute('size', 'sm');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('size')).toBe('sm');
  });

  it('reflects pulse boolean attribute', async () => {
    const el = document.createElement('core-status-dot');
    el.setAttribute('pulse', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.hasAttribute('pulse')).toBe(true);
  });
});

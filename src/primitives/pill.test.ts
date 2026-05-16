// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-pill.ts (2026-05-07).
import { describe, it, expect } from 'vitest';
import './pill';

describe('<core-pill>', () => {
  it('renders into light DOM with the expected parts', async () => {
    const el = document.createElement('core-pill');
    el.textContent = 'Beta';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[part="base"]')).not.toBeNull();
    expect(el.querySelector('[part="label"]')).not.toBeNull();
  });

  it('reflects state attribute', async () => {
    const el = document.createElement('core-pill');
    el.setAttribute('state', 'success');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('state')).toBe('success');
  });

  it('renders leading and trailing slots', async () => {
    const el = document.createElement('core-pill');
    el.innerHTML = '<span slot="leading">L</span>label<span slot="trailing">T</span>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="icon-leading"]')).not.toBeNull();
    expect(el.querySelector('[part="icon-trailing"]')).not.toBeNull();
  });

  it('reflects size attribute (sm/md)', async () => {
    const el = document.createElement('core-pill');
    el.setAttribute('size', 'sm');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('size')).toBe('sm');
  });
});

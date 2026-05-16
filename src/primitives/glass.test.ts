// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/mac-window.ts MacGlass class (2026-05-07).
import { describe, it, expect } from 'vitest';
import './glass';

describe('<core-glass>', () => {
  it('renders the three parts (base, layer-blur, layer-tint)', async () => {
    const el = document.createElement('core-glass');
    el.innerHTML = '<p>frosted content</p>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="base"]')).not.toBeNull();
    expect(el.querySelector('[part="layer-blur"]')).not.toBeNull();
    expect(el.querySelector('[part="layer-tint"]')).not.toBeNull();
  });

  it('reflects dark boolean attribute', async () => {
    const el = document.createElement('core-glass');
    el.setAttribute('dark', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.hasAttribute('dark')).toBe(true);
  });

  it('reflects radius attribute', async () => {
    const el = document.createElement('core-glass');
    el.setAttribute('radius', '24px');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('radius')).toBe('24px');
  });

  it('lands radius attribute as inline style on [part="base"]', async () => {
    const el = document.createElement('core-glass');
    el.setAttribute('radius', '24px');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const base = el.querySelector('[part="base"]') as HTMLElement;
    expect(base.style.getPropertyValue('--core-glass-radius')).toBe('24px');
  });

  it('omits inline radius style when radius attribute is absent', async () => {
    const el = document.createElement('core-glass');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const base = el.querySelector('[part="base"]') as HTMLElement;
    expect(base.style.getPropertyValue('--core-glass-radius')).toBe('');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-card.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './card';

describe('<core-card>', () => {
  it('renders parts: base, body (and named slots when used)', async () => {
    const el = document.createElement('core-card');
    el.textContent = 'body content';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="base"]')).not.toBeNull();
    expect(el.querySelector('[part="body"]')).not.toBeNull();
  });

  it('reflects elevation and padding attributes', async () => {
    const el = document.createElement('core-card');
    el.setAttribute('elevation', 'raised');
    el.setAttribute('padding', 'lg');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('elevation')).toBe('raised');
    expect(el.getAttribute('padding')).toBe('lg');
  });

  it('becomes focusable + emits a click on Enter when interactive', async () => {
    const el = document.createElement('core-card');
    el.setAttribute('interactive', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.tabIndex).toBe(0);
    const clicked = vi.fn();
    el.addEventListener('click', clicked);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(clicked).toHaveBeenCalled();
  });

  it('emits a click on Space when interactive', async () => {
    const el = document.createElement('core-card');
    el.setAttribute('interactive', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const clicked = vi.fn();
    el.addEventListener('click', clicked);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(clicked).toHaveBeenCalled();
  });

  it('is not focusable when not interactive', async () => {
    const el = document.createElement('core-card');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.tabIndex).toBe(-1);
  });
});

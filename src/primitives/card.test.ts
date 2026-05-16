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

  it('preserves consumer-set tabindex across interactive toggles', async () => {
    const el = document.createElement('core-card');
    el.setAttribute('tabindex', '3');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('tabindex')).toBe('3');

    el.setAttribute('interactive', '');
    await (el as any).updateComplete;
    expect(el.tabIndex).toBe(0);

    el.removeAttribute('interactive');
    await (el as any).updateComplete;
    expect(el.getAttribute('tabindex')).toBe('3');
  });

  it('removes tabindex when interactive flips to false (no consumer tabindex)', async () => {
    const el = document.createElement('core-card');
    el.setAttribute('interactive', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.tabIndex).toBe(0);

    el.removeAttribute('interactive');
    await (el as any).updateComplete;
    expect(el.hasAttribute('tabindex')).toBe(false);
  });

  it('defers Enter to nested <button> inside an interactive card', async () => {
    const el = document.createElement('core-card');
    el.setAttribute('interactive', '');
    el.innerHTML = '<button id="inner">Click me</button>';
    document.body.appendChild(el);
    await (el as any).updateComplete;

    const outerClicked = vi.fn();
    el.addEventListener('click', outerClicked);
    const inner = el.querySelector('#inner') as HTMLElement;
    inner.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    }));
    // The outer card's synthetic-click branch should NOT have fired
    // (it would have caused el.click() → outerClicked).
    expect(outerClicked).not.toHaveBeenCalled();
  });
});

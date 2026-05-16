// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide (semantics inspired
// by core/ide/frontend/lit/src/elements/shell/lethean-mac-segmented.ts).
import { describe, it, expect, vi } from 'vitest';
import './rail';

describe('<core-rail>', () => {
  it('renders inner <a> when href is set', async () => {
    const el = document.createElement('core-rail');
    el.setAttribute('href', '/dashboard');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const inner = el.querySelector('[part="base"]');
    expect(inner?.tagName).toBe('A');
    expect((inner as HTMLAnchorElement).getAttribute('href')).toBe('/dashboard');
  });

  it('renders inner <button> when href is absent', async () => {
    const el = document.createElement('core-rail');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="base"]')?.tagName).toBe('BUTTON');
  });

  it('reflects active and disabled', async () => {
    const el = document.createElement('core-rail') as any;
    el.active = true;
    el.disabled = true;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.hasAttribute('active')).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(true);
  });

  it('emits core-rail-navigate when `to` set and activated via click', async () => {
    const el = document.createElement('core-rail');
    el.setAttribute('to', '/settings');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const handler = vi.fn();
    el.addEventListener('core-rail-navigate', handler);
    (el.querySelector('[part="base"]') as HTMLElement).click();
    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.to).toBe('/settings');
  });

  it('emits core-rail-navigate via Enter / Space when `to` set', async () => {
    const el = document.createElement('core-rail');
    el.setAttribute('to', '/settings');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const handler = vi.fn();
    el.addEventListener('core-rail-navigate', handler);
    (el.querySelector('[part="base"]') as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(handler).toHaveBeenCalled();
  });

  it('renders leading/trailing slot containers when populated', async () => {
    const el = document.createElement('core-rail');
    el.innerHTML = '<span slot="leading">L</span>Dashboard<span slot="trailing">3</span>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="icon-leading"]')).not.toBeNull();
    expect(el.querySelector('[part="icon-trailing"]')).not.toBeNull();
    expect(el.querySelector('[part="label"]')).not.toBeNull();
  });
});

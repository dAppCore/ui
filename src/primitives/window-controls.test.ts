// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — macOS port from
// core/ide/frontend/lit/src/elements/mac-window.ts (MacTrafficLights);
// Windows + Linux variants are net-new.
import { describe, it, expect, vi } from 'vitest';
import './window-controls';

describe('<core-window-controls>', () => {
  it('renders three controls (close, minimise, maximise) in light DOM', async () => {
    const el = document.createElement('core-window-controls');
    el.setAttribute('platform', 'macos');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelectorAll('[part="control"]')).toHaveLength(3);
    expect(el.querySelector('[data-action="close"]')).not.toBeNull();
    expect(el.querySelector('[data-action="minimise"]')).not.toBeNull();
    expect(el.querySelector('[data-action="maximise"]')).not.toBeNull();
  });

  it('emits core-window-close on close click', async () => {
    const el = document.createElement('core-window-controls');
    el.setAttribute('platform', 'macos');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const handler = vi.fn();
    el.addEventListener('core-window-close', handler);
    (el.querySelector('[data-action="close"]') as HTMLElement).click();
    expect(handler).toHaveBeenCalled();
  });

  it('emits core-window-minimise on minimise click', async () => {
    const el = document.createElement('core-window-controls');
    el.setAttribute('platform', 'macos');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const handler = vi.fn();
    el.addEventListener('core-window-minimise', handler);
    (el.querySelector('[data-action="minimise"]') as HTMLElement).click();
    expect(handler).toHaveBeenCalled();
  });

  it('emits core-window-maximise on maximise click', async () => {
    const el = document.createElement('core-window-controls');
    el.setAttribute('platform', 'macos');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const handler = vi.fn();
    el.addEventListener('core-window-maximise', handler);
    (el.querySelector('[data-action="maximise"]') as HTMLElement).click();
    expect(handler).toHaveBeenCalled();
  });

  it('reflects platform attribute for each variant', async () => {
    for (const platform of ['macos', 'windows', 'linux']) {
      const el = document.createElement('core-window-controls');
      el.setAttribute('platform', platform);
      document.body.appendChild(el);
      await (el as any).updateComplete;
      expect(el.getAttribute('platform')).toBe(platform);
      expect(el.querySelectorAll('[part="control"]')).toHaveLength(3);
    }
  });

  it('reflects state attribute', async () => {
    const el = document.createElement('core-window-controls');
    el.setAttribute('platform', 'macos');
    el.setAttribute('state', 'inactive');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('state')).toBe('inactive');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.6 — minimal router; no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './router';

describe('<core-router>', () => {
  it('mounts in light DOM with part="base" on the host and preserves slotted children', async () => {
    window.location.hash = '#/';
    document.body.innerHTML = `
      <core-router>
        <span class="probe">child</span>
      </core-router>
    `;
    await new Promise((r) => requestAnimationFrame(r));
    const el = document.querySelector('core-router') as HTMLElement;
    expect(el.shadowRoot).toBeNull();
    expect(el.getAttribute('part')).toBe('base');
    expect(el.querySelector('.probe')?.textContent).toBe('child');
  });

  it('reflects mode attribute; defaults to "hash"', async () => {
    const el = document.createElement('core-router') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.mode).toBe('hash');
    expect(el.getAttribute('mode')).toBe('hash');

    const el2 = document.createElement('core-router') as any;
    el2.mode = 'history';
    document.body.appendChild(el2);
    await el2.updateComplete;
    expect(el2.getAttribute('mode')).toBe('history');
  });

  it('emits core-route-change when location.hash changes', async () => {
    window.location.hash = '#/start';
    const el = document.createElement('core-router');
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    const heard = vi.fn();
    el.addEventListener('core-route-change', heard as EventListener);
    window.location.hash = '#/next?q=1';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await new Promise((r) => requestAnimationFrame(r));
    expect(heard).toHaveBeenCalled();
    const ev = heard.mock.calls[heard.mock.calls.length - 1]![0] as CustomEvent;
    expect(ev.detail.path).toBe('/next');
    expect(ev.detail.query.get('q')).toBe('1');
  });
});

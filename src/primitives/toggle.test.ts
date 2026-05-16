// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-toggle.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './toggle';

describe('<core-toggle>', () => {
  it('renders into light DOM with the expected parts', async () => {
    const el = document.createElement('core-toggle');
    el.textContent = 'Notify me';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('[part="base"]')).not.toBeNull();
    expect(el.querySelector('[part="track"]')).not.toBeNull();
    expect(el.querySelector('[part="thumb"]')).not.toBeNull();
    expect(el.querySelector('[part="label"]')).not.toBeNull();
  });

  it('has role="switch" + aria-checked reflected from checked', async () => {
    const el = document.createElement('core-toggle') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('switch');
    expect(el.getAttribute('aria-checked')).toBe('false');
    el.checked = true;
    await el.updateComplete;
    expect(el.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles via Space and Enter keys', async () => {
    const el = document.createElement('core-toggle') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.checked).toBe(false);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(el.checked).toBe(true);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.checked).toBe(false);
  });

  it('toggles via click on the track', async () => {
    const el = document.createElement('core-toggle') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    el.click();
    expect(el.checked).toBe(true);
  });

  it('emits core-change with detail.checked on toggle', async () => {
    const el = document.createElement('core-toggle') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('core-change', handler);
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ checked: true });
  });

  it('does not toggle when disabled', async () => {
    const el = document.createElement('core-toggle') as any;
    el.disabled = true;
    document.body.appendChild(el);
    await el.updateComplete;
    el.click();
    expect(el.checked).toBe(false);
  });

  it('contributes value to FormData when checked', async () => {
    // happy-dom 15.x has no ElementInternals support — form-associated custom
    // elements aren't recognised by `new FormData(form)`. Skip in that env;
    // real-browser behaviour is exercised by T13 integration tests.
    if (typeof HTMLElement.prototype.attachInternals !== 'function') {
      return;
    }
    const form = document.createElement('form');
    form.innerHTML = '<core-toggle name="enable" value="yes"></core-toggle>';
    document.body.appendChild(form);
    const t = form.querySelector('core-toggle') as any;
    await t.updateComplete;
    t.checked = true;
    await t.updateComplete;
    const data = new FormData(form);
    expect(data.get('enable')).toBe('yes');
  });

  it('does NOT contribute value when unchecked', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') {
      // happy-dom has no ElementInternals support — real-browser behaviour
      // is exercised by the T13 integration tests. Without internals,
      // FormData wouldn't see the toggle either way, so this assertion
      // would pass trivially. Skip rather than give false coverage.
      return;
    }
    const form = document.createElement('form');
    form.innerHTML = '<core-toggle name="enable" value="yes"></core-toggle>';
    document.body.appendChild(form);
    const t = form.querySelector('core-toggle') as any;
    await t.updateComplete;
    const data = new FormData(form);
    expect(data.get('enable')).toBeNull();
  });
});

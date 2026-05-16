// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-radio-group.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './radio';
import './radio-group';

describe('<core-radio-group>', () => {
  it('uses Shadow DOM', async () => {
    const el = document.createElement('core-radio-group');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders parts: base, group, hint, error', async () => {
    const el = document.createElement('core-radio-group');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector('[part="base"]')).not.toBeNull();
    expect(root.querySelector('[part="group"]')).not.toBeNull();
    expect(root.querySelector('[part="hint"]')).not.toBeNull();
    expect(root.querySelector('[part="error"]')).not.toBeNull();
  });

  it('propagates name to child <core-radio> elements', async () => {
    const el = document.createElement('core-radio-group') as any;
    el.name = 'plan';
    el.innerHTML = '<core-radio value="free">Free</core-radio><core-radio value="pro">Pro</core-radio>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const radios = el.querySelectorAll('core-radio');
    expect((radios[0] as any).name).toBe('plan');
    expect((radios[1] as any).name).toBe('plan');
  });

  it('un-checks siblings when one radio is selected', async () => {
    const el = document.createElement('core-radio-group') as any;
    el.name = 'plan';
    el.innerHTML = '<core-radio value="free" checked>Free</core-radio><core-radio value="pro">Pro</core-radio>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const radios = el.querySelectorAll('core-radio');
    // Simulate user clicking "pro" → its inner <input> change event bubbles a core-change.
    (radios[1] as any).checked = true;
    (radios[1] as any).dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true,
      detail: { checked: true, value: 'pro' },
    }));
    await el.updateComplete;
    expect((radios[0] as any).checked).toBe(false);
    expect((radios[1] as any).checked).toBe(true);
  });

  it('reflects value (the currently-selected radio value)', async () => {
    const el = document.createElement('core-radio-group') as any;
    el.innerHTML = '<core-radio value="free" checked>Free</core-radio><core-radio value="pro">Pro</core-radio>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    expect(el.value).toBe('free');
  });

  it('emits core-change with the group-level value when a child changes', async () => {
    const el = document.createElement('core-radio-group') as any;
    el.innerHTML = '<core-radio value="free">Free</core-radio><core-radio value="pro">Pro</core-radio>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const onChange = vi.fn();
    el.addEventListener('core-change', onChange);
    const radios = el.querySelectorAll('core-radio');
    (radios[1] as any).dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true,
      detail: { checked: true, value: 'pro' },
    }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].detail).toEqual({ value: 'pro' });
  });

  it('propagates disabled to child radios', async () => {
    const el = document.createElement('core-radio-group') as any;
    el.disabled = true;
    el.innerHTML = '<core-radio value="free">Free</core-radio>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const radio = el.querySelector('core-radio');
    expect((radio as any).disabled).toBe(true);
  });

  it('reflects orientation attribute', async () => {
    const el = document.createElement('core-radio-group') as any;
    el.orientation = 'horizontal';
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.getAttribute('orientation')).toBe('horizontal');
  });
});

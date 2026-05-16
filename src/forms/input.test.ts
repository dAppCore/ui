// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-input.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './input';

describe('<core-input>', () => {
  it('uses Shadow DOM (v0.7 forms slice)', async () => {
    const el = document.createElement('core-input');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders inner <input> with the requested type', async () => {
    const el = document.createElement('core-input') as any;
    el.type = 'email';
    document.body.appendChild(el);
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(inner.type).toBe('email');
  });

  it('reflects value attribute and property both ways', async () => {
    const el = document.createElement('core-input') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    el.value = 'hello';
    await el.updateComplete;
    expect(el.getAttribute('value')).toBe('hello');
  });

  it('mirrors required/disabled/readonly/placeholder onto inner input', async () => {
    const el = document.createElement('core-input') as any;
    el.required = true;
    el.disabled = true;
    el.readonly = true;
    el.placeholder = 'Type here';
    document.body.appendChild(el);
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(inner.required).toBe(true);
    expect(inner.disabled).toBe(true);
    expect(inner.readOnly).toBe(true);
    expect(inner.placeholder).toBe('Type here');
  });

  it('emits core-input + core-change on user typing', async () => {
    const el = document.createElement('core-input') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('core-input', onInput);
    el.addEventListener('core-change', onChange);
    const inner = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    inner.value = 'typed';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onInput).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
    expect(onInput.mock.calls[0][0].detail).toEqual({ value: 'typed' });
  });

  it('exposes parts: base, input, leading, trailing, hint, error', async () => {
    const el = document.createElement('core-input');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector('[part="base"]')).not.toBeNull();
    expect(root.querySelector('[part="input"]')).not.toBeNull();
    expect(root.querySelector('[part="leading"]')).not.toBeNull();
    expect(root.querySelector('[part="trailing"]')).not.toBeNull();
    expect(root.querySelector('[part="hint"]')).not.toBeNull();
    expect(root.querySelector('[part="error"]')).not.toBeNull();
  });

  it('renders <core-icon> from leading-icon attribute', async () => {
    // Pull in the v0.5 <core-icon> primitive so the name lookup works.
    await import('../primitives/icon');
    const el = document.createElement('core-input') as any;
    el.setAttribute('leading-icon', 'search');
    document.body.appendChild(el);
    await el.updateComplete;
    const leading = el.shadowRoot!.querySelector('[part="leading"] core-icon');
    expect(leading).not.toBeNull();
    expect((leading as Element).getAttribute('name')).toBe('search');
  });

  it('distributes slotted hint and error content (Shadow DOM slots actually work here)', async () => {
    const el = document.createElement('core-input');
    el.innerHTML = '<span slot="hint">Your work email</span><span slot="error">Required</span>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const hintSlot = el.shadowRoot!.querySelector('[part="hint"] slot[name="hint"]') as HTMLSlotElement;
    const errorSlot = el.shadowRoot!.querySelector('[part="error"] slot[name="error"]') as HTMLSlotElement;
    expect(hintSlot.assignedElements().length).toBe(1);
    expect(errorSlot.assignedElements().length).toBe(1);
  });

  it('setCustomValidity does not throw under happy-dom', async () => {
    const el = document.createElement('core-input') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(() => el.setCustomValidity('Server says no')).not.toThrow();
    expect(() => el.setCustomValidity('')).not.toThrow();
  });
});

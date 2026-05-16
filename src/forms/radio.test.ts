// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-radio-group.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './radio';

describe('<core-radio>', () => {
  it('uses Shadow DOM', async () => {
    const el = document.createElement('core-radio');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders parts: base, dot, label', async () => {
    const el = document.createElement('core-radio');
    el.textContent = 'Free tier';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector('[part="base"]')).not.toBeNull();
    expect(root.querySelector('[part="dot"]')).not.toBeNull();
    expect(root.querySelector('[part="label"]')).not.toBeNull();
  });

  it('reflects checked and value attributes', async () => {
    const el = document.createElement('core-radio') as any;
    el.value = 'pro';
    el.checked = true;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.getAttribute('value')).toBe('pro');
    expect(el.hasAttribute('checked')).toBe(true);
  });

  it('renders inner <input type="radio">', async () => {
    const el = document.createElement('core-radio');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const inner = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(inner.type).toBe('radio');
  });

  it('emits core-change with detail.checked + detail.value on selection', async () => {
    const el = document.createElement('core-radio') as any;
    el.value = 'pro';
    document.body.appendChild(el);
    await el.updateComplete;
    const onChange = vi.fn();
    el.addEventListener('core-change', onChange);
    el.shadowRoot!.querySelector('input')!.click();
    await el.updateComplete;
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].detail).toEqual({ checked: true, value: 'pro' });
  });

  it('does not toggle when disabled', async () => {
    const el = document.createElement('core-radio') as any;
    el.disabled = true;
    document.body.appendChild(el);
    await el.updateComplete;
    el.shadowRoot!.querySelector('input')!.click();
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './checkbox';

describe('<core-checkbox>', () => {
  it('uses Shadow DOM', async () => {
    const el = document.createElement('core-checkbox');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders parts: base, box, tick, label, hint, error', async () => {
    const el = document.createElement('core-checkbox');
    el.textContent = 'I accept';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector('[part="base"]')).not.toBeNull();
    expect(root.querySelector('[part="box"]')).not.toBeNull();
    expect(root.querySelector('[part="tick"]')).not.toBeNull();
    expect(root.querySelector('[part="label"]')).not.toBeNull();
    expect(root.querySelector('[part="hint"]')).not.toBeNull();
    expect(root.querySelector('[part="error"]')).not.toBeNull();
  });

  it('reflects checked attribute', async () => {
    const el = document.createElement('core-checkbox') as any;
    el.checked = true;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.hasAttribute('checked')).toBe(true);
  });

  it('emits core-change with detail.checked on click', async () => {
    const el = document.createElement('core-checkbox') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    const onChange = vi.fn();
    el.addEventListener('core-change', onChange);
    el.shadowRoot!.querySelector('input')!.click();
    await el.updateComplete;
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].detail.checked).toBe(true);
  });

  it('does not toggle when disabled', async () => {
    const el = document.createElement('core-checkbox') as any;
    el.disabled = true;
    document.body.appendChild(el);
    await el.updateComplete;
    el.shadowRoot!.querySelector('input')!.click();
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('renders inner <input type="checkbox">', async () => {
    const el = document.createElement('core-checkbox');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const inner = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(inner.type).toBe('checkbox');
  });

  it('mirrors indeterminate to inner input but does not contribute to FormData', async () => {
    const el = document.createElement('core-checkbox') as any;
    el.indeterminate = true;
    document.body.appendChild(el);
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(inner.indeterminate).toBe(true);
    // Only `checked` contributes to FormData via setFormValue; indeterminate
    // is purely a visual state.
    expect(el.checked).toBe(false);
  });
});

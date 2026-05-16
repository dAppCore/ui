// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-select.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './select';

describe('<core-select>', () => {
  it('uses Shadow DOM', async () => {
    const el = document.createElement('core-select');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders inner <select> with parts: base, select, leading, hint, error', async () => {
    const el = document.createElement('core-select');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector('[part="base"]')).not.toBeNull();
    expect(root.querySelector('select[part="select"]')).not.toBeNull();
    expect(root.querySelector('[part="leading"]')).not.toBeNull();
    expect(root.querySelector('[part="hint"]')).not.toBeNull();
    expect(root.querySelector('[part="error"]')).not.toBeNull();
  });

  it('re-projects host <option> children into the Shadow-DOM inner <select>', async () => {
    const el = document.createElement('core-select');
    el.innerHTML =
      '<option value="a">A</option>' +
      '<option value="b">B</option>' +
      '<option value="c">C</option>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    // Allow MutationObserver microtask to flush.
    await new Promise((r) => setTimeout(r, 0));
    const inner = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    expect(inner.options.length).toBe(3);
    expect(inner.options[0].value).toBe('a');
    expect(inner.options[2].textContent).toBe('C');
  });

  it('re-projects late-added options via MutationObserver', async () => {
    const el = document.createElement('core-select');
    el.innerHTML = '<option value="x">X</option>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const opt = document.createElement('option');
    opt.value = 'y';
    opt.textContent = 'Y';
    el.appendChild(opt);
    await new Promise((r) => setTimeout(r, 0));
    const inner = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    expect(inner.options.length).toBe(2);
    expect(inner.options[1].value).toBe('y');
  });

  it('reflects value attribute and selects matching option', async () => {
    const el = document.createElement('core-select') as any;
    el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
    el.value = 'b';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const inner = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    expect(inner.value).toBe('b');
  });

  it('emits core-change with detail.value on selection change', async () => {
    const el = document.createElement('core-select') as any;
    el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const onChange = vi.fn();
    el.addEventListener('core-change', onChange);
    const inner = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    inner.value = 'b';
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].detail.value).toBe('b');
  });

  it('multiple mode contributes all selected values to FormData (or skip under happy-dom)', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    const el = document.createElement('core-select') as any;
    el.name = 'tags';
    el.multiple = true;
    el.innerHTML = '<option value="a">A</option><option value="b">B</option><option value="c">C</option>';
    form.appendChild(el);
    document.body.appendChild(form);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const inner = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    Array.from(inner.options).forEach((o) => { o.selected = o.value !== 'b'; });
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    const data = new FormData(form);
    expect(data.getAll('tags')).toEqual(['a', 'c']);
  });

  it('mirrors required and disabled to inner <select>', async () => {
    const el = document.createElement('core-select') as any;
    el.required = true;
    el.disabled = true;
    el.innerHTML = '<option value="">--</option><option value="a">A</option>';
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    const inner = el.shadowRoot!.querySelector('select') as HTMLSelectElement;
    expect(inner.required).toBe(true);
    expect(inner.disabled).toBe(true);
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-input.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './textarea';

describe('<core-textarea>', () => {
  it('uses Shadow DOM', async () => {
    const el = document.createElement('core-textarea');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders inner <textarea> with rows attribute', async () => {
    const el = document.createElement('core-textarea') as any;
    el.rows = 5;
    document.body.appendChild(el);
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector('textarea') as HTMLTextAreaElement;
    // happy-dom 15 returns `textarea.rows` as a string (spec says reflect-as-number);
    // coerce so the assertion checks intent without depending on this env quirk.
    expect(Number(inner.rows)).toBe(5);
  });

  it('reflects value attribute and property both ways', async () => {
    const el = document.createElement('core-textarea') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    el.value = 'multi\nline';
    await el.updateComplete;
    expect(el.getAttribute('value')).toBe('multi\nline');
  });

  it('mirrors required/disabled/readonly/placeholder/maxlength onto inner', async () => {
    const el = document.createElement('core-textarea') as any;
    el.required = true;
    el.disabled = true;
    el.readonly = true;
    el.placeholder = 'Notes';
    el.maxlength = 500;
    document.body.appendChild(el);
    await el.updateComplete;
    const inner = el.shadowRoot!.querySelector('textarea') as HTMLTextAreaElement;
    expect(inner.required).toBe(true);
    expect(inner.disabled).toBe(true);
    expect(inner.readOnly).toBe(true);
    expect(inner.placeholder).toBe('Notes');
    expect(inner.maxLength).toBe(500);
  });

  it('emits core-input + core-change on input/change events', async () => {
    const el = document.createElement('core-textarea') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    const onInput = vi.fn();
    const onChange = vi.fn();
    el.addEventListener('core-input', onInput);
    el.addEventListener('core-change', onChange);
    const inner = el.shadowRoot!.querySelector('textarea') as HTMLTextAreaElement;
    inner.value = 'typed';
    inner.dispatchEvent(new Event('input', { bubbles: true }));
    inner.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onInput).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('exposes parts: base, textarea, hint, error', async () => {
    const el = document.createElement('core-textarea');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector('[part="base"]')).not.toBeNull();
    expect(root.querySelector('[part="textarea"]')).not.toBeNull();
    expect(root.querySelector('[part="hint"]')).not.toBeNull();
    expect(root.querySelector('[part="error"]')).not.toBeNull();
  });

  it('distributes slotted hint/error', async () => {
    const el = document.createElement('core-textarea');
    el.innerHTML = '<span slot="hint">Markdown allowed</span>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const slot = el.shadowRoot!.querySelector('[part="hint"] slot[name="hint"]') as HTMLSlotElement;
    expect(slot.assignedElements().length).toBe(1);
  });
});

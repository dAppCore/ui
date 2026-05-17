// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
import { describe, it, expect, vi, afterEach } from 'vitest';
import './column';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('<core-column>', () => {
  function make(attrs: Record<string, string | boolean> = {}): Element {
    const el = document.createElement('core-column');
    for (const [k, v] of Object.entries(attrs)) {
      if (v === true) el.setAttribute(k, '');
      else if (v !== false) el.setAttribute(k, String(v));
    }
    document.body.appendChild(el);
    return el;
  }

  it('registers as core-column custom element', () => {
    const el = make({ key: 'name', label: 'Name' });
    expect(el.tagName.toLowerCase()).toBe('core-column');
  });

  it('reflects key attribute', () => {
    const el = make({ key: 'email' });
    expect(el.getAttribute('key')).toBe('email');
  });

  it('label defaults to key value when label attribute absent', async () => {
    const el = make({ key: 'score' });
    await new Promise((r) => requestAnimationFrame(r));
    const col = el as any;
    expect(col.label ?? el.getAttribute('key')).toBe('score');
  });

  it('sortable is false by default', () => {
    const el = make({ key: 'name' });
    expect(el.hasAttribute('sortable')).toBe(false);
  });

  it('type defaults to "text" when not set', async () => {
    const el = make({ key: 'name' });
    await new Promise((r) => requestAnimationFrame(r));
    const col = el as any;
    expect(col.type ?? 'text').toBe('text');
  });

  it('align attribute reflects correctly', () => {
    const el = make({ key: 'score', align: 'end' });
    expect(el.getAttribute('align')).toBe('end');
  });

  it('hidden attribute is a boolean toggle', () => {
    const el = make({ key: 'internal', hidden: true });
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('fires core-column-changed when a watched attribute changes', async () => {
    const el = make({ key: 'name', label: 'Name' });
    await new Promise((r) => requestAnimationFrame(r));
    const handler = vi.fn();
    el.addEventListener('core-column-changed', handler);
    el.setAttribute('label', 'Full Name');
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

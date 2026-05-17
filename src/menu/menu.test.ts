// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './menuitem';
import './menu-separator';
import './menu';
import type { CoreMenu } from './menu';
import type { CoreMenuitem } from './menuitem';

// ── helpers ──────────────────────────────────────────────────────────────────

async function makeMenu(inner: string): Promise<CoreMenu> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<core-menu>${inner}</core-menu>`;
  document.body.appendChild(wrapper);
  const el = wrapper.querySelector('core-menu') as CoreMenu;
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

function cleanup(el: CoreMenu): void {
  el.closest('div')?.remove();
}

const THREE_ITEMS = `
  <core-menuitem>New file</core-menuitem>
  <core-menuitem>Open</core-menuitem>
  <core-menuitem>Save</core-menuitem>
`;

const WITH_DISABLED = `
  <core-menuitem>New file</core-menuitem>
  <core-menuitem disabled>Open recent</core-menuitem>
  <core-menuitem>Save</core-menuitem>
`;

// ── baseline ─────────────────────────────────────────────────────────────────

describe('<core-menu> — baseline', () => {
  it('registers as core-menu custom element', async () => {
    const el = await makeMenu(THREE_ITEMS);
    expect(el.tagName.toLowerCase()).toBe('core-menu');
    cleanup(el);
  });

  it('slotchange reads <core-menuitem> children into _items (excludes separators)', async () => {
    const el = await makeMenu(`
      <core-menuitem>One</core-menuitem>
      <core-menu-separator></core-menu-separator>
      <core-menuitem>Two</core-menuitem>
    `);
    expect((el as any)._items.length).toBe(2);
    cleanup(el);
  });

  it('sets role="menu" on the [part="menu"] shadow container', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const part = el.shadowRoot?.querySelector('[part="menu"]');
    expect(part?.getAttribute('role')).toBe('menu');
    cleanup(el);
  });

  it('sets aria-orientation="vertical" by default', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const part = el.shadowRoot?.querySelector('[part="menu"]');
    expect(part?.getAttribute('aria-orientation')).toBe('vertical');
    cleanup(el);
  });

  it('sets role="menuitem" on each <core-menuitem>', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const items = el.querySelectorAll('core-menuitem');
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('menuitem');
    });
    cleanup(el);
  });

  it('sets role="separator" on <core-menu-separator>', async () => {
    const el = await makeMenu(`
      <core-menuitem>One</core-menuitem>
      <core-menu-separator></core-menu-separator>
      <core-menuitem>Two</core-menuitem>
    `);
    const sep = el.querySelector('core-menu-separator');
    expect(sep?.getAttribute('role')).toBe('separator');
    cleanup(el);
  });

  it('roving tabindex: first non-disabled item gets tabindex="0", others -1', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    expect(items[2].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });

  it('disabled item gets aria-disabled="true"', async () => {
    const el = await makeMenu(WITH_DISABLED);
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].hasAttribute('aria-disabled')).toBe(false);
    expect(items[1].getAttribute('aria-disabled')).toBe('true');
    cleanup(el);
  });

  it('click on enabled item fires core-menu-select with {item, index, value}', async () => {
    const el = await makeMenu(`<core-menuitem value="new">New file</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    const item = el.querySelector('core-menuitem') as HTMLElement;
    item.click();
    expect(detail).toBeDefined();
    expect(detail.value).toBe('new');
    expect(detail.index).toBe(0);
    cleanup(el);
  });

  it('core-menu-select value falls back to textContent.trim() when no value attr', async () => {
    const el = await makeMenu(`<core-menuitem>Save File</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    const item = el.querySelector('core-menuitem') as HTMLElement;
    item.click();
    expect(detail.value).toBe('Save File');
    cleanup(el);
  });

  it('click on disabled item does NOT fire core-menu-select', async () => {
    const el = await makeMenu(`<core-menuitem disabled>Disabled</core-menuitem>`);
    const handler = vi.fn();
    el.addEventListener('core-menu-select', handler);
    const item = el.querySelector('core-menuitem') as HTMLElement;
    item.click();
    expect(handler).not.toHaveBeenCalled();
    cleanup(el);
  });

  it('Escape fires core-menu-close (cancellable)', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const handler = vi.fn();
    el.addEventListener('core-menu-close', handler);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    cleanup(el);
  });

  it('preventDefault on core-menu-close keeps menu open (open attr stays)', async () => {
    const el = await makeMenu(THREE_ITEMS);
    el.setAttribute('open', '');
    el.addEventListener('core-menu-close', (e: Event) => { e.preventDefault(); });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.hasAttribute('open')).toBe(true);
    cleanup(el);
  });

  it('focusFirst() sets tabindex="0" on first non-disabled item', async () => {
    const el = await makeMenu(WITH_DISABLED);
    el.focusFirst();
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('focusLast() sets tabindex="0" on last non-disabled item', async () => {
    const el = await makeMenu(WITH_DISABLED);
    el.focusLast();
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('focusItem(index) sets tabindex="0" on item at given index', async () => {
    const el = await makeMenu(THREE_ITEMS);
    el.focusItem(2);
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });

  it('focusItem(el) sets tabindex="0" on specified element ref', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const items = el.querySelectorAll('core-menuitem');
    el.focusItem(items[1] as CoreMenuitem);
    expect(items[1].getAttribute('tabindex')).toBe('0');
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });
});

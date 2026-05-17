// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import '@dappcore/ui/menu';
import type { CoreMenu } from '@dappcore/ui/menu';

async function make(inner: string): Promise<CoreMenu> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<core-menu>${inner}</core-menu>`;
  document.body.appendChild(wrapper);
  const el = wrapper.querySelector('core-menu') as CoreMenu;
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

describe('menu/v09 — keyboard nav integration', () => {
  it('ArrowDown advances focus from item 0 to item 1 (tabindex reflects)', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem>Beta</core-menuitem>
      <core-menuitem>Gamma</core-menuitem>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('ArrowUp from item 0 wraps to last item', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem>Beta</core-menuitem>
      <core-menuitem>Gamma</core-menuitem>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('Home moves focus to first item', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem>Beta</core-menuitem>
      <core-menuitem>Gamma</core-menuitem>
    `);
    el.focusItem(2);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('End moves focus to last item', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem>Beta</core-menuitem>
      <core-menuitem>Gamma</core-menuitem>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('Enter fires core-menu-select with {item, index, value}', async () => {
    const el = await make(`<core-menuitem value="action">Action</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(detail?.value).toBe('action');
    expect(detail?.index).toBe(0);
    el.closest('div')?.remove();
  });

  it('ArrowDown wraps from last item to first', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem>Beta</core-menuitem>
    `);
    el.focusItem(1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });
});

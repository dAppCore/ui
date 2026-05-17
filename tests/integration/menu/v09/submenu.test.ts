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

const WITH_SUBMENU = `
  <core-menuitem>New file</core-menuitem>
  <core-menuitem has-submenu>Export
    <core-menu>
      <core-menuitem value="pdf">As PDF</core-menuitem>
      <core-menuitem value="html">As HTML</core-menuitem>
    </core-menu>
  </core-menuitem>
  <core-menuitem>Save</core-menuitem>
`;

describe('menu/v09 — submenu integration', () => {
  it('nested <core-menu> starts hidden; aria-expanded="false" on trigger', async () => {
    const el = await make(WITH_SUBMENU);
    const trigger = el.querySelectorAll('core-menuitem')[1];
    const nested = trigger.querySelector('core-menu');
    expect(nested?.hasAttribute('hidden')).toBe(true);
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    el.closest('div')?.remove();
  });

  it('click on has-submenu trigger opens nested menu (removes hidden)', async () => {
    const el = await make(WITH_SUBMENU);
    const trigger = el.querySelectorAll('core-menuitem')[1] as HTMLElement;
    const nested = trigger.querySelector('core-menu');
    trigger.click();
    expect(nested?.hasAttribute('hidden')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    el.closest('div')?.remove();
  });

  it('ArrowLeft after opening submenu closes it and restores aria-expanded="false"', async () => {
    const el = await make(WITH_SUBMENU);
    el.focusItem(1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const trigger = el.querySelectorAll('core-menuitem')[1];
    const nested = trigger.querySelector('core-menu');
    expect(nested?.hasAttribute('hidden')).toBe(false);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(nested?.hasAttribute('hidden')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    el.closest('div')?.remove();
  });

  it('only one submenu open at a time — opening second closes first', async () => {
    const el = await make(`
      <core-menuitem has-submenu>Export
        <core-menu><core-menuitem value="pdf">PDF</core-menuitem></core-menu>
      </core-menuitem>
      <core-menuitem has-submenu>Share
        <core-menu><core-menuitem value="email">Email</core-menuitem></core-menu>
      </core-menuitem>
    `);
    // Use children-filter to get only direct child menuitems (not nested ones).
    const directItems = Array.from(el.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-menuitem',
    ) as HTMLElement[];
    const [t1, t2] = directItems;
    // t1's nested is first <core-menu> child of t1, etc.
    const nested1 = t1.querySelector('core-menu');
    const nested2 = t2.querySelector('core-menu');
    t1.click();
    expect(nested1?.hasAttribute('hidden')).toBe(false);
    t2.click();
    expect(nested1?.hasAttribute('hidden')).toBe(true);
    expect(nested2?.hasAttribute('hidden')).toBe(false);
    el.closest('div')?.remove();
  });

  it('core-menu-select from nested item bubbles up to root listener', async () => {
    const el = await make(WITH_SUBMENU);
    let selected: string | undefined;
    el.addEventListener('core-menu-select', (e: Event) => {
      selected = (e as CustomEvent).detail.value;
    });
    const trigger = el.querySelectorAll('core-menuitem')[1] as HTMLElement;
    trigger.click();
    const nested = trigger.querySelector('core-menu');
    const nestedItems = nested?.querySelectorAll('core-menuitem');
    (nestedItems?.[0] as HTMLElement)?.click();
    expect(selected).toBe('pdf');
    el.closest('div')?.remove();
  });
});

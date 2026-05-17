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

describe('menu/v09 — type-ahead integration', () => {
  it('typing "s" focuses first item starting with "s"', async () => {
    const el = await make(`
      <core-menuitem>New file</core-menuitem>
      <core-menuitem>Open</core-menuitem>
      <core-menuitem>Save</core-menuitem>
      <core-menuitem>Settings</core-menuitem>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    // Searching from index 0+1=1, Save is first match at index 2
    expect(items[2].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('typing "sa" within 500ms window focuses "Save" over "Settings"', async () => {
    const el = await make(`
      <core-menuitem>Save</core-menuitem>
      <core-menuitem>Settings</core-menuitem>
      <core-menuitem>Sort</core-menuitem>
    `);
    // Buffer starts empty, focused at index 0. Type 's' → matches Save (index 0, wrap: 1→2→0).
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    // Type 'a' immediately — buffer is 'sa', matches Save.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('type-ahead is case-insensitive ("S" and "s" match same item)', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem>Save</core-menuitem>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'S', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });

  it('type-ahead skips disabled items', async () => {
    const el = await make(`
      <core-menuitem>Alpha</core-menuitem>
      <core-menuitem disabled>Save (disabled)</core-menuitem>
      <core-menuitem>Settings</core-menuitem>
    `);
    // 's' should skip the disabled Save and land on Settings
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    el.closest('div')?.remove();
  });
});

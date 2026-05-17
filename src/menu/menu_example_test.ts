// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the component.
import { describe, it, expect } from 'vitest';
import '.';

describe('@dappcore/ui/menu — v0.9 usage examples', () => {
  it('example: minimal flat menu (standalone, vertical, default)', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-menu>
        <core-menuitem>Dashboard</core-menuitem>
        <core-menuitem>Profile</core-menuitem>
        <core-menuitem>Settings</core-menuitem>
      </core-menu>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const menu = wrapper.querySelector('core-menu') as any;
    expect(menu).not.toBeNull();
    expect(menu.orientation).toBe('vertical');

    // role="menu" wired on shadow container
    const part = menu.shadowRoot?.querySelector('[part="menu"]');
    expect(part?.getAttribute('role')).toBe('menu');
    expect(part?.getAttribute('aria-orientation')).toBe('vertical');

    // All items have role="menuitem"
    const items = wrapper.querySelectorAll('core-menuitem');
    items.forEach((item: Element) => {
      expect(item.getAttribute('role')).toBe('menuitem');
    });

    // First item has tabindex="0", others -1
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    wrapper.remove();
  });

  it('example: with separator + icon slot + trailing shortcut slot', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-menu>
        <core-menuitem value="new">
          <span slot="start">⊕</span>
          New file
          <span slot="end" class="shortcut">⌘N</span>
        </core-menuitem>
        <core-menuitem value="open">
          <span slot="start">📂</span>
          Open
          <span slot="end" class="shortcut">⌘O</span>
        </core-menuitem>
        <core-menu-separator></core-menu-separator>
        <core-menuitem value="save">
          <span slot="start">💾</span>
          Save
          <span slot="end" class="shortcut">⌘S</span>
        </core-menuitem>
      </core-menu>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const menu = wrapper.querySelector('core-menu') as any;
    // Separator has role="separator"
    const sep = wrapper.querySelector('core-menu-separator');
    expect(sep?.getAttribute('role')).toBe('separator');

    // Items have value attribute
    const items = wrapper.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('value')).toBe('new');
    expect(items[2].getAttribute('value')).toBe('save');

    // core-menu-select fires with correct value
    let selected: string | undefined;
    menu.addEventListener('core-menu-select', (e: Event) => {
      selected = (e as CustomEvent).detail.value;
    });
    (items[2] as HTMLElement).click();
    expect(selected).toBe('save');
    wrapper.remove();
  });

  it('example: submenu — nested <core-menu> inside has-submenu item', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-menu>
        <core-menuitem>New file</core-menuitem>
        <core-menuitem has-submenu>Export
          <core-menu>
            <core-menuitem value="pdf">As PDF</core-menuitem>
            <core-menuitem value="html">As HTML</core-menuitem>
          </core-menu>
        </core-menuitem>
      </core-menu>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const menu = wrapper.querySelector('core-menu') as any;
    const trigger = wrapper.querySelectorAll('core-menuitem')[1];
    const nested = trigger.querySelector('core-menu');

    // has-submenu wires aria-haspopup + aria-expanded="false" initially
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // Nested menu starts hidden
    expect(nested?.hasAttribute('hidden')).toBe(true);

    // Click trigger — nested opens
    (trigger as HTMLElement).click();
    expect(nested?.hasAttribute('hidden')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    // core-menu-select from nested item bubbles up
    let selected: string | undefined;
    menu.addEventListener('core-menu-select', (e: Event) => {
      selected = (e as CustomEvent).detail.value;
    });
    const nestedItems = nested?.querySelectorAll('core-menuitem');
    (nestedItems?.[0] as HTMLElement)?.click();
    expect(selected).toBe('pdf');
    wrapper.remove();
  });

  it('example: disabled item — click no-op, ArrowDown skips it', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-menu>
        <core-menuitem>New file</core-menuitem>
        <core-menuitem disabled>Open recent</core-menuitem>
        <core-menuitem>Save</core-menuitem>
      </core-menu>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const menu = wrapper.querySelector('core-menu') as any;
    const items = wrapper.querySelectorAll('core-menuitem');

    // Disabled item has aria-disabled="true"
    expect(items[1].getAttribute('aria-disabled')).toBe('true');

    // Click on disabled item does not fire core-menu-select
    const handler = { called: false };
    menu.addEventListener('core-menu-select', () => { handler.called = true; });
    (items[1] as HTMLElement).click();
    expect(handler.called).toBe(false);

    // ArrowDown from index 0 skips index 1 (disabled) and lands on index 2
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(items[2].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    wrapper.remove();
  });
});

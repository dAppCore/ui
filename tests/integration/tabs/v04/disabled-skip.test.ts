// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import '../../../../src/tabs/index';
import type { CoreTabs } from '../../../../src/tabs/tabs';

async function make(inner: string): Promise<CoreTabs> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<core-tabs>${inner}</core-tabs>`;
  document.body.appendChild(wrapper);
  const el = wrapper.querySelector('core-tabs') as CoreTabs;
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

describe('tabs/v04 — disabled tab handling integration', () => {
  it('ArrowRight skips disabled tab 1 and lands on tab 2', async () => {
    const el = await make(`
      <core-tab>First</core-tab>
      <core-tab disabled>Disabled</core-tab>
      <core-tab>Third</core-tab>
      <core-tabpanel>First panel</core-tabpanel>
      <core-tabpanel>Disabled panel</core-tabpanel>
      <core-tabpanel>Third panel</core-tabpanel>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.selectedIndex).toBe(2);
    el.closest('div')?.remove();
  });

  it('click on disabled tab is a no-op — selectedIndex unchanged', async () => {
    const el = await make(`
      <core-tab>First</core-tab>
      <core-tab disabled>Disabled</core-tab>
      <core-tabpanel>First panel</core-tabpanel>
      <core-tabpanel>Disabled panel</core-tabpanel>
    `);
    const disabledTab = el.querySelectorAll('core-tab')[1] as HTMLElement;
    disabledTab.click();
    expect(el.selectedIndex).toBe(0);
    el.closest('div')?.remove();
  });

  it('aria-disabled="true" is set on disabled tabs', async () => {
    const el = await make(`
      <core-tab>Active</core-tab>
      <core-tab disabled>Disabled</core-tab>
      <core-tabpanel>Active panel</core-tabpanel>
      <core-tabpanel>Disabled panel</core-tabpanel>
    `);
    const tabs = el.querySelectorAll('core-tab');
    expect(tabs[0].hasAttribute('aria-disabled')).toBe(false);
    expect(tabs[1].getAttribute('aria-disabled')).toBe('true');
    el.closest('div')?.remove();
  });

  it('all-disabled keyboard nav is a no-op (no infinite loop)', async () => {
    const el = await make(`
      <core-tab disabled>Disabled A</core-tab>
      <core-tab disabled>Disabled B</core-tab>
      <core-tabpanel>Panel A</core-tabpanel>
      <core-tabpanel>Panel B</core-tabpanel>
    `);
    // Should not throw or loop; selectedIndex stays at 0.
    expect(() => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    }).not.toThrow();
    expect(el.selectedIndex).toBe(0);
    el.closest('div')?.remove();
  });
});

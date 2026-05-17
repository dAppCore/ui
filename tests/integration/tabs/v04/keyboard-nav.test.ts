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

const THREE_TABS = `
  <core-tab>Alpha</core-tab>
  <core-tab>Beta</core-tab>
  <core-tab>Gamma</core-tab>
  <core-tabpanel>Alpha panel</core-tabpanel>
  <core-tabpanel>Beta panel</core-tabpanel>
  <core-tabpanel>Gamma panel</core-tabpanel>
`;

describe('tabs/v04 — keyboard nav integration', () => {
  it('ArrowRight cycles to next tab and activates panel', async () => {
    const el = await make(THREE_TABS);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.selectedIndex).toBe(1);
    const panels = el.querySelectorAll('core-tabpanel');
    expect(panels[1].hasAttribute('hidden')).toBe(false);
    el.closest('div')?.remove();
  });

  it('ArrowLeft cycles back to previous tab', async () => {
    const el = await make(THREE_TABS);
    el.select(2);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(el.selectedIndex).toBe(1);
    el.closest('div')?.remove();
  });

  it('Home key jumps to first tab from any position', async () => {
    const el = await make(THREE_TABS);
    el.select(2);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(el.selectedIndex).toBe(0);
    el.closest('div')?.remove();
  });

  it('End key jumps to last tab', async () => {
    const el = await make(THREE_TABS);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(el.selectedIndex).toBe(2);
    el.closest('div')?.remove();
  });

  it('manual mode: ArrowRight moves focus but Space activates', async () => {
    const el = await make(THREE_TABS);
    el.setAttribute('activation', 'manual');
    (el as any).activation = 'manual';
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.selectedIndex).toBe(0); // not activated
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(el.selectedIndex).toBe(1); // now activated
    el.closest('div')?.remove();
  });

  it('ArrowRight wraps from last to first', async () => {
    const el = await make(THREE_TABS);
    el.select(2);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.selectedIndex).toBe(0);
    el.closest('div')?.remove();
  });
});

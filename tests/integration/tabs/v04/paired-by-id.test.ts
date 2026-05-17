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

describe('tabs/v04 — explicit for/id pairing integration', () => {
  it('<core-tab for="X"> resolves to <core-tabpanel id="X"> regardless of DOM order', async () => {
    const el = await make(`
      <core-tab for="z">Z</core-tab>
      <core-tab for="a">A</core-tab>
      <core-tabpanel id="a">Panel A</core-tabpanel>
      <core-tabpanel id="z">Panel Z</core-tabpanel>
    `);
    const pairs = (el as any)._pairs as Array<{ tab: Element; panel: Element }>;
    expect(pairs[0].panel.id).toBe('z'); // tab[0] for="z" → panel id="z"
    expect(pairs[1].panel.id).toBe('a'); // tab[1] for="a" → panel id="a"
    el.closest('div')?.remove();
  });

  it('aria-controls on tab matches the paired panel id', async () => {
    const el = await make(`
      <core-tab for="settings">Settings</core-tab>
      <core-tab for="profile">Profile</core-tab>
      <core-tabpanel id="profile">Profile content</core-tabpanel>
      <core-tabpanel id="settings">Settings content</core-tabpanel>
    `);
    const tabs = el.querySelectorAll('core-tab');
    expect(tabs[0].getAttribute('aria-controls')).toBe('settings');
    expect(tabs[1].getAttribute('aria-controls')).toBe('profile');
    el.closest('div')?.remove();
  });

  it('mixed pairing: explicit for/id + implicit by residual index', async () => {
    const el = await make(`
      <core-tab for="explicit">Explicit</core-tab>
      <core-tab>Implicit</core-tab>
      <core-tabpanel id="explicit">Explicit panel</core-tabpanel>
      <core-tabpanel id="implicit-panel">Implicit panel</core-tabpanel>
    `);
    const pairs = (el as any)._pairs as Array<{ tab: Element; panel: Element }>;
    // tab[0] explicitly paired with "explicit"
    expect(pairs[0].panel.id).toBe('explicit');
    // tab[1] implicitly paired with remaining panel "implicit-panel"
    expect(pairs[1].panel.id).toBe('implicit-panel');
    el.closest('div')?.remove();
  });

  it('auto-generated IDs have stable format core-tabpanel-{n}-{i}', async () => {
    const el = await make(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    const panels = el.querySelectorAll('core-tabpanel');
    expect(panels[0].id).toMatch(/^core-tabpanel-\d+-0$/);
    expect(panels[1].id).toMatch(/^core-tabpanel-\d+-1$/);
    // aria-controls on tab[0] matches panel[0] auto-generated id
    const tab0 = el.querySelector('core-tab') as Element;
    expect(tab0.getAttribute('aria-controls')).toBe(panels[0].id);
    el.closest('div')?.remove();
  });

  it('aria-labelledby on panel points to the paired tab id', async () => {
    const el = await make(`
      <core-tab for="info">Info</core-tab>
      <core-tabpanel id="info">Info content</core-tabpanel>
    `);
    const tab = el.querySelector('core-tab') as Element;
    const panel = el.querySelector('core-tabpanel') as Element;
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    el.closest('div')?.remove();
  });
});

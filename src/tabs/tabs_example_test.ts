// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the component.
import { describe, it, expect } from 'vitest';
import '.';

describe('@dappcore/ui/tabs — v0.4 usage examples', () => {
  it('example: minimal 3-tab horizontal (default orientation + auto activation)', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-tabs>
        <core-tab>General</core-tab>
        <core-tab>Account</core-tab>
        <core-tab>Security</core-tab>
        <core-tabpanel>General settings here.</core-tabpanel>
        <core-tabpanel>Account settings.</core-tabpanel>
        <core-tabpanel>Security settings.</core-tabpanel>
      </core-tabs>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const el = wrapper.querySelector('core-tabs') as any;
    expect(el).not.toBeNull();
    expect(el.selectedIndex).toBe(0);
    const tabs = wrapper.querySelectorAll('core-tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    const panels = wrapper.querySelectorAll('core-tabpanel');
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);
    wrapper.remove();
  });

  it('example: vertical orientation with explicit for/id pairing', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-tabs orientation="vertical">
        <core-tab for="profile">Profile</core-tab>
        <core-tab for="billing">Billing</core-tab>
        <core-tabpanel id="billing">Billing details.</core-tabpanel>
        <core-tabpanel id="profile">Profile information.</core-tabpanel>
      </core-tabs>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const el = wrapper.querySelector('core-tabs') as any;
    expect(el.orientation).toBe('vertical');
    const pairs = el._pairs as Array<{ tab: Element; panel: Element }>;
    expect(pairs[0].panel.id).toBe('profile');
    expect(pairs[1].panel.id).toBe('billing');
    const tab0 = wrapper.querySelector('core-tab') as Element;
    expect(tab0.getAttribute('aria-controls')).toBe('profile');
    wrapper.remove();
  });

  it('example: manual activation — ArrowRight moves focus, Space activates', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-tabs activation="manual">
        <core-tab>Alpha</core-tab>
        <core-tab>Beta</core-tab>
        <core-tab>Gamma</core-tab>
        <core-tabpanel>Alpha panel.</core-tabpanel>
        <core-tabpanel>Beta panel.</core-tabpanel>
        <core-tabpanel>Gamma panel.</core-tabpanel>
      </core-tabs>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const el = wrapper.querySelector('core-tabs') as any;
    expect(el.activation).toBe('manual');
    expect(el.selectedIndex).toBe(0);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.selectedIndex).toBe(0);
    expect(el._focusedIndex).toBe(1);

    // Use ' ' (space character) — real-browser-style per T6 fix
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(el.selectedIndex).toBe(1);

    const panels = wrapper.querySelectorAll('core-tabpanel');
    expect(panels[0].hasAttribute('hidden')).toBe(true);
    expect(panels[1].hasAttribute('hidden')).toBe(false);
    wrapper.remove();
  });

  it('example: disabled tab — click is no-op, ArrowRight skips it', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-tabs>
        <core-tab>Enabled A</core-tab>
        <core-tab disabled>Disabled B</core-tab>
        <core-tab>Enabled C</core-tab>
        <core-tabpanel>Panel A</core-tabpanel>
        <core-tabpanel>Panel B (inaccessible)</core-tabpanel>
        <core-tabpanel>Panel C</core-tabpanel>
      </core-tabs>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const el = wrapper.querySelector('core-tabs') as any;
    const disabledTab = wrapper.querySelectorAll('core-tab')[1] as HTMLElement;

    expect(disabledTab.getAttribute('aria-disabled')).toBe('true');

    disabledTab.click();
    expect(el.selectedIndex).toBe(0);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.selectedIndex).toBe(2);

    wrapper.remove();
  });
});

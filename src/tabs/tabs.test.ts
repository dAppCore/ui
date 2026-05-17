// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './tab';
import './tabpanel';
import './tabs';
import type { CoreTabs } from './tabs';
import type { CoreTab } from './tab';

// ── helpers ──────────────────────────────────────────────────────────────────

async function makeTabs(inner: string): Promise<CoreTabs> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<core-tabs>${inner}</core-tabs>`;
  document.body.appendChild(wrapper);
  const el = wrapper.querySelector('core-tabs') as CoreTabs;
  // Two animation frames: one for connectedCallback, one for slotchange settle.
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

function cleanup(el: CoreTabs): void {
  el.closest('div')?.remove();
}

// ── baseline ─────────────────────────────────────────────────────────────────

describe('<core-tabs> — baseline', () => {
  it('registers as core-tabs custom element', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
    `);
    expect(el.tagName.toLowerCase()).toBe('core-tabs');
    cleanup(el);
  });

  it('slotchange reads <core-tab> children into _tabs', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    expect((el as any)._tabs.length).toBe(2);
    expect((el as any)._panels.length).toBe(2);
    cleanup(el);
  });

  it('implicit pairing by index: first tab → first panel', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel id="p1">Panel One</core-tabpanel>
      <core-tabpanel id="p2">Panel Two</core-tabpanel>
    `);
    const pairs = (el as any)._pairs as Array<{ tab: CoreTab; panel: Element }>;
    expect(pairs[0].panel.id).toBe('p1');
    expect(pairs[1].panel.id).toBe('p2');
    cleanup(el);
  });

  it('explicit for/id pairing: tab.for matches panel.id', async () => {
    const el = await makeTabs(`
      <core-tab for="b">B</core-tab>
      <core-tab for="a">A</core-tab>
      <core-tabpanel id="a">Panel A</core-tabpanel>
      <core-tabpanel id="b">Panel B</core-tabpanel>
    `);
    const pairs = (el as any)._pairs as Array<{ tab: CoreTab; panel: Element }>;
    // Tab 0 has for="b" → must pair with panel id="b"
    expect(pairs[0].panel.id).toBe('b');
    // Tab 1 has for="a" → must pair with panel id="a"
    expect(pairs[1].panel.id).toBe('a');
    cleanup(el);
  });

  it('default selectedIndex is 0', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    expect(el.selectedIndex).toBe(0);
    cleanup(el);
  });

  it('selected-index attribute reflects on selection change', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    el.select(1);
    // v0.4 explicit setAttribute pattern — synchronous read works
    expect(el.getAttribute('selected-index')).toBe('1');
    cleanup(el);
  });

  it('clicking tab 1 activates it and fires core-tab-change', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    let detail: any;
    el.addEventListener('core-tab-change', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    const tabs = (el as any)._tabs as CoreTab[];
    tabs[1].click();
    expect(detail).toBeDefined();
    expect(detail.index).toBe(1);
    expect(detail.previousIndex).toBe(0);
    expect(el.selectedIndex).toBe(1);
    cleanup(el);
  });

  it('selectedTab getter returns the active CoreTab', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    expect(el.selectedTab).toBe((el as any)._tabs[0]);
    el.select(1);
    expect(el.selectedTab).toBe((el as any)._tabs[1]);
    cleanup(el);
  });

  it('selectedPanel getter returns the active CoreTabpanel', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel id="p1">Panel One</core-tabpanel>
      <core-tabpanel id="p2">Panel Two</core-tabpanel>
    `);
    expect(el.selectedPanel?.id).toBe('p1');
    el.select(1);
    expect(el.selectedPanel?.id).toBe('p2');
    cleanup(el);
  });

  it('select(tab) accepts a CoreTab element ref', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    const tabs = (el as any)._tabs as CoreTab[];
    el.select(tabs[1]);
    expect(el.selectedIndex).toBe(1);
    cleanup(el);
  });

  it('auto-generates stable IDs for panels without consumer-set id', async () => {
    const el = await makeTabs(`
      <core-tab>One</core-tab>
      <core-tab>Two</core-tab>
      <core-tabpanel>Panel One</core-tabpanel>
      <core-tabpanel>Panel Two</core-tabpanel>
    `);
    const panels = (el as any)._panels as Element[];
    // IDs should follow the pattern core-tabpanel-{uid}-{index}
    expect(panels[0].id).toMatch(/^core-tabpanel-\d+-0$/);
    expect(panels[1].id).toMatch(/^core-tabpanel-\d+-1$/);
    cleanup(el);
  });
});

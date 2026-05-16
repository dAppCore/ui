// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-icon.ts (2026-05-07).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import './icon';
import { listIcons, unregisterIcon, registerIcon } from './icons/registry';

describe('<core-icon>', () => {
  beforeEach(() => {
    // Reset registry to defaults registered by icon.ts import.
    for (const name of listIcons()) unregisterIcon(name);
    registerIcon('check', '<svg viewBox="0 0 16 16" data-test="default-check"></svg>');
  });

  it('renders registered icon by name into light DOM', async () => {
    const el = document.createElement('core-icon');
    el.setAttribute('name', 'check');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).toBeNull();
    const svg = el.querySelector('svg');
    expect(svg?.getAttribute('data-test')).toBe('default-check');
  });

  it('emits a deduped console.warn for unknown icon names', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el1 = document.createElement('core-icon');
    el1.setAttribute('name', 'no-such-icon');
    document.body.appendChild(el1);
    await (el1 as any).updateComplete;

    const el2 = document.createElement('core-icon');
    el2.setAttribute('name', 'no-such-icon');
    document.body.appendChild(el2);
    await (el2 as any).updateComplete;

    // Both reference the same unknown name → warned exactly once total.
    const calls = warn.mock.calls.filter((c) => String(c[0]).includes('no-such-icon'));
    expect(calls).toHaveLength(1);
    warn.mockRestore();
  });

  it('renders nothing on unknown icon names without throwing', async () => {
    const el = document.createElement('core-icon');
    el.setAttribute('name', 'no-such-icon');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('svg')).toBeNull();
  });

  it('slot SVG content wins over name attribute', async () => {
    const el = document.createElement('core-icon');
    el.setAttribute('name', 'check');
    el.innerHTML = '<svg data-test="slotted"></svg>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    // The slotted svg is the only one rendered.
    const slotted = el.querySelector('svg[data-test="slotted"]');
    expect(slotted).not.toBeNull();
    expect(el.querySelector('svg[data-test="default-check"]')).toBeNull();
  });

  it('applies aria-hidden when decorative', async () => {
    const el = document.createElement('core-icon');
    el.setAttribute('name', 'check');
    el.setAttribute('decorative', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses registry entry title as aria-label fallback when not decorative', async () => {
    registerIcon('starry', { svg: '<svg viewBox="0 0 16 16"></svg>', title: 'Starry sky' });
    const el = document.createElement('core-icon');
    el.setAttribute('name', 'starry');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('aria-label')).toBe('Starry sky');
  });

  it('does NOT override consumer-provided aria-label', async () => {
    registerIcon('starry', { svg: '<svg></svg>', title: 'Starry sky' });
    const el = document.createElement('core-icon');
    el.setAttribute('name', 'starry');
    el.setAttribute('aria-label', 'Custom label');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('aria-label')).toBe('Custom label');
  });
});

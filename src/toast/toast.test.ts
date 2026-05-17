// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './toast';
import type { CoreToast } from './toast';

function makeToast(html = '<core-toast>Hello</core-toast>'): CoreToast {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.querySelector('core-toast') as CoreToast;
}

describe('<core-toast>', () => {
  afterEach(() => {
    document.body.querySelectorAll('div').forEach((el) => el.remove());
  });

  it('registers as core-toast custom element', () => {
    const el = makeToast();
    expect(el.tagName.toLowerCase()).toBe('core-toast');
  });

  it('severity attr defaults to "info" and reflects synchronously for all 4 values', () => {
    const el = makeToast();
    expect(el.severity).toBe('info');
    expect(el.getAttribute('severity')).toBe('info');

    el.severity = 'success';
    expect(el.getAttribute('severity')).toBe('success');

    el.severity = 'warning';
    expect(el.getAttribute('severity')).toBe('warning');

    el.severity = 'error';
    expect(el.getAttribute('severity')).toBe('error');

    el.severity = 'info';
    expect(el.getAttribute('severity')).toBe('info');
  });

  it('duration attr defaults to 5000 and reflects synchronously; 0 means sticky', () => {
    const el = makeToast();
    expect(el.duration).toBe(5000);
    el.duration = 0;
    expect(el.getAttribute('duration')).toBe('0');
    expect(el.duration).toBe(0);
    el.duration = 3000;
    expect(el.getAttribute('duration')).toBe('3000');
  });

  it('open attr reflects synchronously as boolean', () => {
    const el = makeToast();
    expect(el.open).toBe(false);
    el.open = true;
    expect(el.hasAttribute('open')).toBe(true);
    el.open = false;
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('auto-dismiss timer fires core-toast-close after duration (shortened duration)', async () => {
    const el = makeToast('<core-toast duration="100">Auto</core-toast>');
    el.show();
    const fired = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      setTimeout(() => resolve(false), 400);
    });
    expect(fired).toBe(true);
  });

  it('duration=0 never auto-dismisses (sticky)', async () => {
    const el = makeToast('<core-toast duration="0">Sticky</core-toast>');
    el.show();
    const fired = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      setTimeout(() => resolve(false), 300);
    });
    expect(fired).toBe(false);
  });

  it('mouseenter pauses timer (_dismissTimer becomes null)', async () => {
    const el = makeToast('<core-toast duration="5000">Hover me</core-toast>');
    el.show();
    await new Promise((r) => requestAnimationFrame(r));
    // Timer should be running
    expect((el as any)._dismissTimer).not.toBeNull();
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect((el as any)._dismissTimer).toBeNull();
  });

  it('mouseleave resumes timer after pause', async () => {
    const el = makeToast('<core-toast duration="5000">Hover me</core-toast>');
    el.show();
    await new Promise((r) => requestAnimationFrame(r));
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect((el as any)._dismissTimer).toBeNull();
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    // Timer restarted — _dismissTimer is set again
    expect((el as any)._dismissTimer).not.toBeNull();
  });

  it('close() advances state machine and fires core-toast-close', async () => {
    const el = makeToast('<core-toast duration="0">Sticky</core-toast>');
    el.show();
    await new Promise((r) => requestAnimationFrame(r));
    const closed = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      el.close();
      setTimeout(() => resolve(false), 500);
    });
    expect(closed).toBe(true);
  });

  it('core-toast-close is cancellable via preventDefault() — reverts to open state', async () => {
    const el = makeToast('<core-toast duration="0">Sticky</core-toast>');
    el.show();
    await new Promise((r) => requestAnimationFrame(r));
    el.addEventListener('core-toast-close', (ev) => {
      ev.preventDefault();
    });
    el.close();
    // Allow fallback timer to fire
    await new Promise((r) => setTimeout(r, 400));
    // Toast should remain open (state reverted)
    expect(el.getAttribute('data-state')).toBe('open');
    expect(el.open).toBe(true);
  });

  it('built-in SVG icon rendered for each severity', async () => {
    for (const sev of ['info', 'success', 'warning', 'error'] as const) {
      const el = makeToast(`<core-toast severity="${sev}">Msg</core-toast>`);
      await el.updateComplete;
      const icon = el.shadowRoot?.querySelector('[part="icon"] svg');
      expect(icon).not.toBeNull();
    }
  });

  it('slotted icon overrides built-in icon', async () => {
    const el = makeToast(`
      <core-toast severity="info">
        <svg slot="icon" data-testid="custom-icon"></svg>
        Message
      </core-toast>
    `);
    await el.updateComplete;
    // The named icon slot exists; slotted content is present
    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]');
    expect(iconSlot).not.toBeNull();
    const assigned = (iconSlot as HTMLSlotElement).assignedElements();
    expect(assigned.length).toBeGreaterThan(0);
    expect(assigned[0].getAttribute('data-testid')).toBe('custom-icon');
  });

  it('action slot is rendered and accepts button content', async () => {
    const el = makeToast(`
      <core-toast severity="info" duration="0">
        Message
        <button slot="action">Undo</button>
      </core-toast>
    `);
    await el.updateComplete;
    const actionSlot = el.shadowRoot?.querySelector('slot[name="action"]');
    expect(actionSlot).not.toBeNull();
    const assigned = (actionSlot as HTMLSlotElement).assignedElements();
    expect(assigned.length).toBeGreaterThan(0);
    expect(assigned[0].tagName.toLowerCase()).toBe('button');
  });

  it('dismiss button click fires core-toast-close', async () => {
    const el = makeToast('<core-toast duration="0">Close me</core-toast>');
    el.show();
    await el.updateComplete;
    const btn = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    expect(btn).not.toBeNull();
    const fired = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      btn.click();
      setTimeout(() => resolve(false), 500);
    });
    expect(fired).toBe(true);
  });
});

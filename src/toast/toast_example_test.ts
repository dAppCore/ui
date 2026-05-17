// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the component.
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import '.';
import { toast } from './toast-helper';
import type { CoreToastRegion } from './toast-region';
import type { CoreToast } from './toast';

function cleanupAll(): void {
  document.body.querySelectorAll('core-toast-region').forEach((el) => el.remove());
  document.body.querySelectorAll('div').forEach((el) => el.remove());
}

describe('@dappcore/ui/toast — v0.10 usage examples', () => {
  afterEach(() => {
    cleanupAll();
  });

  it('example: info toast auto-dismisses after duration (programmatic, shortened duration)', async () => {
    // Programmatic usage: toast.info() creates singleton region + toast.
    const id = toast.show('File indexed.', { severity: 'info', duration: 100 });
    expect(id).toMatch(/^core-toast-\d+$/);

    const region = toast.getRegion();
    expect(region.tagName.toLowerCase()).toBe('core-toast-region');
    expect(region.getAttribute('position')).toBe('top-right');

    // Toast exists in region with correct severity
    const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
    expect(el).not.toBeNull();
    expect(el.getAttribute('severity')).toBe('info');

    // role="status" for info/success (polite)
    await el.updateComplete;
    const toast_part = el.shadowRoot?.querySelector('[part="toast"]');
    expect(toast_part?.getAttribute('role')).toBe('status');

    // Dismiss button present
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]');
    expect(closeBtn?.getAttribute('aria-label')).toBe('Dismiss notification');

    // Auto-dismiss fires core-toast-close
    const closed = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      setTimeout(() => resolve(false), 400);
    });
    expect(closed).toBe(true);
  });

  it('example: success toast with action button (Undo)', async () => {
    // Declarative usage: create elements, compose in a region.
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-toast-region position="top-right">
        <core-toast severity="success" duration="0">
          3 items moved to Trash.
          <button slot="action">Undo</button>
        </core-toast>
      </core-toast-region>
    `;
    document.body.appendChild(wrapper);

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const region = wrapper.querySelector('core-toast-region') as CoreToastRegion;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBe('Notifications');

    const t = wrapper.querySelector('core-toast') as CoreToast;
    await t.updateComplete;

    // Action slot populated
    const actionSlot = t.shadowRoot?.querySelector('slot[name="action"]') as HTMLSlotElement;
    expect(actionSlot).not.toBeNull();
    const assigned = actionSlot.assignedElements();
    expect(assigned.length).toBe(1);
    expect(assigned[0].tagName.toLowerCase()).toBe('button');
    expect(assigned[0].textContent?.trim()).toBe('Undo');

    // Severity icon slot fallback renders success SVG
    const iconSlot = t.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement;
    const builtIn = iconSlot?.querySelector('svg');
    // In happy-dom, slot fallback SVG is accessible via the slot element itself
    expect(t.shadowRoot?.querySelector('[part="icon"] svg')).not.toBeNull();

    // role="status" for success
    const toast_part = t.shadowRoot?.querySelector('[part="toast"]');
    expect(toast_part?.getAttribute('role')).toBe('status');
  });

  it('example: sticky error toast with duration=0 — no auto-dismiss', async () => {
    // Error toast — sticky, must be manually dismissed.
    const id = toast.error('Upload failed. Check your network.', { duration: 0 });
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
    expect(el).not.toBeNull();
    expect(el.getAttribute('severity')).toBe('error');
    expect(el.getAttribute('duration')).toBe('0');

    await el.updateComplete;

    // role="alert" for warning/error (assertive)
    const toast_part = el.shadowRoot?.querySelector('[part="toast"]');
    expect(toast_part?.getAttribute('role')).toBe('alert');

    // Does NOT auto-dismiss after 300ms
    const selfDismissed = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      setTimeout(() => resolve(false), 300);
    });
    expect(selfDismissed).toBe(false);

    // Manual dismiss via toast.dismiss(id)
    let manualClosed = false;
    el.addEventListener('core-toast-close', () => { manualClosed = true; });
    toast.dismiss(id);
    await new Promise((r) => setTimeout(r, 400));
    expect(manualClosed).toBe(true);
  });

  it('example: severity icon override via icon slot', async () => {
    // Consumer replaces built-in SVG with a custom icon via slot="icon".
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-toast-region position="bottom-right">
        <core-toast severity="warning" duration="0">
          <svg slot="icon" viewBox="0 0 16 16" data-testid="custom-warning-icon"><path d="M8 1L15 15H1z"/></svg>
          Disk space low.
        </core-toast>
      </core-toast-region>
    `;
    document.body.appendChild(wrapper);

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const region = wrapper.querySelector('core-toast-region') as CoreToastRegion;
    expect(region.getAttribute('position')).toBe('bottom-right');

    const t = wrapper.querySelector('core-toast') as CoreToast;
    await t.updateComplete;

    // Slotted icon wins over built-in fallback
    const iconSlot = t.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement;
    const assigned = iconSlot.assignedElements();
    expect(assigned.length).toBe(1);
    expect(assigned[0].getAttribute('data-testid')).toBe('custom-warning-icon');

    // role="alert" for warning
    const toast_part = t.shadowRoot?.querySelector('[part="toast"]');
    expect(toast_part?.getAttribute('role')).toBe('alert');
  });
});

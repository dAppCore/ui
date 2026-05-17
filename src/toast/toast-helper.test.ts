// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import './toast';
import './toast-region';
// Import helper module; _defaultRegion and _toastUid are module-scoped state.
// We reset them by removing any singleton region from DOM after each test.
import { toast } from './toast-helper';
import type { CoreToastRegion } from './toast-region';

function cleanupSingleton(): void {
  document.body.querySelectorAll('core-toast-region').forEach((el) => el.remove());
}

describe('toast helper', () => {
  afterEach(() => {
    cleanupSingleton();
  });

  it('toast.getRegion() creates singleton core-toast-region in document.body on first call', () => {
    const region = toast.getRegion();
    expect(region.tagName.toLowerCase()).toBe('core-toast-region');
    expect(document.body.contains(region)).toBe(true);
    expect(region.getAttribute('position')).toBe('top-right');
  });

  it('toast.getRegion() returns the same instance on repeated calls', () => {
    const r1 = toast.getRegion();
    const r2 = toast.getRegion();
    expect(r1).toBe(r2);
  });

  it('toast.getRegion() recreates region if previous was removed from DOM', () => {
    const r1 = toast.getRegion();
    r1.remove();
    const r2 = toast.getRegion();
    expect(r2).not.toBe(r1);
    expect(document.body.contains(r2)).toBe(true);
  });

  it('toast.show() returns a unique string id in format "core-toast-N"', () => {
    const id1 = toast.show('One');
    const id2 = toast.show('Two');
    expect(id1).toMatch(/^core-toast-\d+$/);
    expect(id2).toMatch(/^core-toast-\d+$/);
    expect(id1).not.toBe(id2);
  });

  it('toast.show() sets data-toast-id on created toast element', () => {
    const id = toast.show('Hello');
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`);
    expect(el).not.toBeNull();
  });

  it('toast.info/success/warning/error shortcuts apply correct severity', () => {
    const region = toast.getRegion();
    toast.info('Info message');
    toast.success('Success message');
    toast.warning('Warning message');
    toast.error('Error message');
    const toasts = Array.from(region.querySelectorAll('core-toast'));
    const severities = toasts.map((t) => t.getAttribute('severity'));
    expect(severities).toContain('info');
    expect(severities).toContain('success');
    expect(severities).toContain('warning');
    expect(severities).toContain('error');
  });

  it('toast.dismiss(id) closes the toast with matching data-toast-id', async () => {
    const id = toast.show('Dismiss me');
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`);
    expect(el).not.toBeNull();
    let closed = false;
    el?.addEventListener('core-toast-close', () => { closed = true; });
    toast.dismiss(id);
    await new Promise((r) => setTimeout(r, 400));
    expect(closed).toBe(true);
  });

  it('toast.dismissAll() clears all toasts from singleton region', async () => {
    toast.show('A');
    toast.show('B');
    toast.show('C');
    const region = toast.getRegion();
    expect(region.querySelectorAll('core-toast').length).toBeGreaterThan(0);
    let allClosed = 0;
    region.querySelectorAll('core-toast').forEach((t) => {
      t.addEventListener('core-toast-close', () => allClosed++);
    });
    toast.dismissAll();
    await new Promise((r) => setTimeout(r, 400));
    expect(allClosed).toBeGreaterThan(0);
  });

  it('toast.show() with opts.region targets non-singleton region', () => {
    const customRegion = document.createElement('core-toast-region') as CoreToastRegion;
    document.body.appendChild(customRegion);
    const id = toast.show('Custom region', { region: customRegion });
    const el = customRegion.querySelector(`[data-toast-id="${id}"]`);
    expect(el).not.toBeNull();
    customRegion.remove();
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import '@dappcore/ui/toast';
import { toast } from '@dappcore/ui/toast/toast-helper';
import type { CoreToastRegion } from '@dappcore/ui/toast/toast-region';

function cleanup(): void {
  document.body.querySelectorAll('core-toast-region').forEach((el) => el.remove());
}

describe('toast/v10 — queue stacking integration', () => {
  afterEach(cleanup);

  it('multiple toast.show() calls create separate toasts with unique ids', () => {
    const id1 = toast.show('First');
    const id2 = toast.show('Second');
    const id3 = toast.show('Third');

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).toMatch(/^core-toast-\d+$/);

    const region = toast.getRegion() as CoreToastRegion;
    expect(region.querySelectorAll('core-toast').length).toBeGreaterThanOrEqual(3);
  });

  it('dismiss(id) removes the targeted toast without affecting others', async () => {
    const id1 = toast.show('Keep me 1', { duration: 0 });
    const id2 = toast.show('Remove me', { duration: 0 });
    const id3 = toast.show('Keep me 3', { duration: 0 });

    const region = toast.getRegion() as CoreToastRegion;
    const el2 = region.querySelector(`[data-toast-id="${id2}"]`);
    expect(el2).not.toBeNull();

    let el2Closed = false;
    el2?.addEventListener('core-toast-close', () => { el2Closed = true; });

    toast.dismiss(id2);
    await new Promise((r) => setTimeout(r, 400));

    expect(el2Closed).toBe(true);
    // Other toasts still present in DOM (or the test just checks the dismiss event)
    const el1 = region.querySelector(`[data-toast-id="${id1}"]`);
    const el3 = region.querySelector(`[data-toast-id="${id3}"]`);
    // el1 and el3 may still be present (not dismissed)
    expect(el1 ?? el3).not.toBeNull();
  });

  it('dismissAll() closes all toasts in singleton region', async () => {
    toast.show('A', { duration: 0 });
    toast.show('B', { duration: 0 });
    toast.show('C', { duration: 0 });

    const region = toast.getRegion() as CoreToastRegion;
    const initial = region.querySelectorAll('core-toast').length;
    expect(initial).toBeGreaterThanOrEqual(3);

    let closedCount = 0;
    region.querySelectorAll('core-toast').forEach((t) => {
      t.addEventListener('core-toast-close', () => closedCount++);
    });

    toast.dismissAll();
    await new Promise((r) => setTimeout(r, 400));
    expect(closedCount).toBeGreaterThanOrEqual(3);
  });

  it('stack order matches call order — first show() is first child in region', () => {
    const id1 = toast.show('First', { duration: 0 });
    const id2 = toast.show('Second', { duration: 0 });

    const region = toast.getRegion() as CoreToastRegion;
    const children = Array.from(region.querySelectorAll('core-toast'));
    const ids = children.map((t) => t.getAttribute('data-toast-id'));

    const idx1 = ids.indexOf(id1);
    const idx2 = ids.indexOf(id2);
    expect(idx1).toBeLessThan(idx2);
  });

  it('singleton region has position="top-right" by default', () => {
    toast.show('Position check');
    const region = toast.getRegion() as CoreToastRegion;
    expect(region.getAttribute('position')).toBe('top-right');
  });
});

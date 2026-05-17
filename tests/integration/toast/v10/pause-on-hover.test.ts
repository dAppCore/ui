// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import '@dappcore/ui/toast';
import { toast } from '@dappcore/ui/toast/toast-helper';
import type { CoreToast } from '@dappcore/ui/toast/toast';

function cleanup(): void {
  document.body.querySelectorAll('core-toast-region').forEach((el) => el.remove());
}

describe('toast/v10 — pause-on-hover integration', () => {
  afterEach(cleanup);

  it('mouseenter on toast clears _dismissTimer (timer paused)', async () => {
    const id = toast.show('Hover test', { duration: 5000 });
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
    await new Promise((r) => requestAnimationFrame(r));

    // Timer should be running after show()
    expect((el as any)._dismissTimer).not.toBeNull();

    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect((el as any)._dismissTimer).toBeNull();
  });

  it('mouseleave after mouseenter restarts timer (_dismissTimer set again)', async () => {
    const id = toast.show('Resume test', { duration: 5000 });
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
    await new Promise((r) => requestAnimationFrame(r));

    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect((el as any)._dismissTimer).toBeNull();

    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect((el as any)._dismissTimer).not.toBeNull();
  });

  it('toast with duration=0 — mouseenter/mouseleave are no-ops (no timer started)', async () => {
    const id = toast.show('Sticky', { duration: 0 });
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
    await new Promise((r) => requestAnimationFrame(r));

    // No timer on sticky toast
    expect((el as any)._dismissTimer).toBeNull();

    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect((el as any)._dismissTimer).toBeNull();

    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    // Still null — no remaining time to resume from
    expect((el as any)._dismissTimer).toBeNull();
  });

  it('pause then immediate close still fires core-toast-close', async () => {
    const id = toast.show('Pause then close', { duration: 5000 });
    const region = toast.getRegion();
    const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
    await new Promise((r) => requestAnimationFrame(r));

    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect((el as any)._dismissTimer).toBeNull();

    const closed = await new Promise<boolean>((resolve) => {
      el.addEventListener('core-toast-close', () => resolve(true));
      el.close();
      setTimeout(() => resolve(false), 500);
    });
    expect(closed).toBe(true);
  });
});

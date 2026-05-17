// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import './toast';
import './toast-region';
import type { CoreToastRegion } from './toast-region';
import type { CoreToast } from './toast';

function makeRegion(html = '<core-toast-region></core-toast-region>'): CoreToastRegion {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.querySelector('core-toast-region') as CoreToastRegion;
}

describe('<core-toast-region>', () => {
  afterEach(() => {
    document.body.querySelectorAll('div').forEach((el) => el.remove());
  });

  it('registers as core-toast-region custom element', () => {
    const el = makeRegion();
    expect(el.tagName.toLowerCase()).toBe('core-toast-region');
  });

  it('position attr defaults to "top-right" and reflects synchronously for all 6 values', () => {
    const el = makeRegion();
    expect(el.position).toBe('top-right');
    expect(el.getAttribute('position')).toBe('top-right');

    for (const pos of ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const) {
      el.position = pos;
      expect(el.getAttribute('position')).toBe(pos);
      expect(el.position).toBe(pos);
    }
  });

  it('has role="region" and aria-label="Notifications" wired on host', async () => {
    const el = makeRegion();
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Notifications');
  });

  it('toasts getter returns slotted <core-toast> children (Array.from + filter pattern)', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-toast-region>
        <core-toast>One</core-toast>
        <core-toast>Two</core-toast>
      </core-toast-region>
    `;
    document.body.appendChild(wrapper);
    const region = wrapper.querySelector('core-toast-region') as CoreToastRegion;
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    expect(region.toastCount).toBe(2);
    expect(region.toasts.length).toBe(2);
    wrapper.remove();
  });

  it('addToast appends <core-toast> to region and calls show()', async () => {
    const region = makeRegion();
    await region.updateComplete;
    const t = document.createElement('core-toast') as CoreToast;
    t.textContent = 'Added';
    let shown = false;
    (t as any).show = () => { shown = true; };
    region.addToast(t);
    await new Promise((r) => requestAnimationFrame(r));
    expect(region.contains(t)).toBe(true);
    expect(shown).toBe(true);
  });

  it('removeToast calls close() on the toast', async () => {
    const region = makeRegion();
    await region.updateComplete;
    const t = document.createElement('core-toast') as CoreToast;
    t.textContent = 'Remove me';
    let closed = false;
    (t as any).show = () => {};
    (t as any).close = () => { closed = true; };
    region.addToast(t);
    region.removeToast(t);
    expect(closed).toBe(true);
  });

  it('clear() calls close() on all toasts', async () => {
    const region = makeRegion();
    await region.updateComplete;
    const closeCallCount = { n: 0 };
    for (let i = 0; i < 3; i++) {
      const t = document.createElement('core-toast') as CoreToast;
      t.textContent = `Toast ${i}`;
      (t as any).show = () => {};
      (t as any).close = () => { closeCallCount.n++; };
      region.addToast(t);
    }
    region.clear();
    expect(closeCallCount.n).toBe(3);
  });
});

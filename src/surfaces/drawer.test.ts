// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './drawer';

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('<core-drawer>', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = document.createElement('core-drawer');
    document.body.appendChild(el);
    await (el as any).updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  it('uses Shadow DOM', () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it('starts with data-state="closed"', () => {
    expect(el.getAttribute('data-state')).toBe('closed');
  });

  it('default side is "end"', () => {
    expect((el as any).side).toBe('end');
  });

  it('accepts side="start"', async () => {
    el.setAttribute('side', 'start');
    await nextFrame();
    expect(el.getAttribute('side')).toBe('start');
  });

  it('accepts side="top"', async () => {
    el.setAttribute('side', 'top');
    await nextFrame();
    expect(el.getAttribute('side')).toBe('top');
  });

  it('accepts side="bottom"', async () => {
    el.setAttribute('side', 'bottom');
    await nextFrame();
    expect(el.getAttribute('side')).toBe('bottom');
  });

  it('default closedby is "any"', () => {
    expect((el as any).closedby).toBe('any');
  });

  it('renders [part="drawer"] wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="drawer"]')).not.toBeNull();
  });

  it('renders [part="header"] slot wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="header"]')).not.toBeNull();
  });

  it('renders [part="body"] slot wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="body"]')).not.toBeNull();
  });

  it('renders [part="footer"] slot wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="footer"]')).not.toBeNull();
  });

  it('show() transitions toward data-state="open"', async () => {
    (el as any).show();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['opening', 'open']).toContain(state);
  });

  it('close() transitions toward data-state="closed"', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    (el as any).close();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('fires core-drawer-open after show()', async () => {
    const spy = vi.fn();
    el.addEventListener('core-drawer-open', spy);
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires core-drawer-close after close()', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-drawer-close', spy);
    (el as any).close();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('backdrop click on host closes the drawer', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const clickEv = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(clickEv, 'target', { value: el, configurable: true });
    el.dispatchEvent(clickEv);
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('has role="dialog" on the host', () => {
    expect(el.getAttribute('role')).toBe('dialog');
  });

  it('[data-core-close] inside drawer triggers close', async () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-core-close', '');
    el.appendChild(btn);
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    btn.click();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('clears aria-modal on close (parity with <core-dialog>)', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.hasAttribute('aria-modal')).toBe(true);
    (el as any).close();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.hasAttribute('aria-modal')).toBe(false);
  });

  it('fires core-drawer-cancel on ESC (cancellable)', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-drawer-cancel', spy);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextFrame();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('core-drawer-cancel preventDefault blocks ESC close', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    el.addEventListener('core-drawer-cancel', (ev) => ev.preventDefault());
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextFrame();
    expect(el.getAttribute('data-state')).toBe('open');
  });
});

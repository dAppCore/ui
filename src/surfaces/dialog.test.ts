// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './dialog';

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('<core-dialog>', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = document.createElement('core-dialog');
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

  it('default size is "md"', () => {
    expect((el as any).size).toBe('md');
  });

  it('accepts size="sm"', async () => {
    el.setAttribute('size', 'sm');
    await nextFrame();
    expect(el.getAttribute('size')).toBe('sm');
  });

  it('accepts size="lg"', async () => {
    el.setAttribute('size', 'lg');
    await nextFrame();
    expect(el.getAttribute('size')).toBe('lg');
  });

  it('accepts size="xl"', async () => {
    el.setAttribute('size', 'xl');
    await nextFrame();
    expect(el.getAttribute('size')).toBe('xl');
  });

  it('accepts size="full"', async () => {
    el.setAttribute('size', 'full');
    await nextFrame();
    expect(el.getAttribute('size')).toBe('full');
  });

  it('renders [part="dialog"] wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="dialog"]')).not.toBeNull();
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

  it('close("confirm") sets returnValue', async () => {
    (el as any).show();
    await nextFrame();
    (el as any).close('confirm');
    expect((el as any).returnValue).toBe('confirm');
  });

  it('returnValue starts as empty string', () => {
    expect((el as any).returnValue).toBe('');
  });

  it('fires core-dialog-open after show()', async () => {
    const spy = vi.fn();
    el.addEventListener('core-dialog-open', spy);
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires core-dialog-close with returnValue after close()', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-dialog-close', spy);
    (el as any).close('cancel');
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail?.returnValue).toBe('cancel');
  });

  it('fires core-dialog-cancel on ESC (cancellable)', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-dialog-cancel', spy);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextFrame();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('core-dialog-cancel preventDefault blocks ESC close', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    el.addEventListener('core-dialog-cancel', (ev) => ev.preventDefault());
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextFrame();
    expect(el.getAttribute('data-state')).toBe('open');
  });

  it('default closedby is "closerequest"', () => {
    expect((el as any).closedby).toBe('closerequest');
  });

  it('has role="dialog" on the host or dialog part', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const hasRole =
      el.getAttribute('role') === 'dialog' ||
      el.shadowRoot!.querySelector('[role="dialog"]') !== null;
    expect(hasRole).toBe(true);
  });

  it('clears aria-modal on close', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.hasAttribute('aria-modal')).toBe(true);
    (el as any).close();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.hasAttribute('aria-modal')).toBe(false);
  });
});

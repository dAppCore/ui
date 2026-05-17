// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './tooltip';

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('<core-tooltip>', () => {
  let anchor: HTMLButtonElement;
  let el: HTMLElement;

  beforeEach(async () => {
    anchor = document.createElement('button');
    anchor.id = 'tip-anchor';
    document.body.appendChild(anchor);
    el = document.createElement('core-tooltip');
    el.setAttribute('anchor', '#tip-anchor');
    document.body.appendChild(el);
    await (el as any).updateComplete;
  });

  afterEach(() => {
    el.remove();
    anchor.remove();
  });

  it('uses Shadow DOM', () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it('starts with data-state="closed"', () => {
    expect(el.getAttribute('data-state')).toBe('closed');
  });

  it('default placement is "top"', () => {
    expect((el as any).placement).toBe('top');
  });

  it('default offset is 6', () => {
    expect((el as any).offset).toBe(6);
  });

  it('default delay-in is 700', () => {
    expect((el as any).delayIn).toBe(700);
  });

  it('default delay-out is 0', () => {
    expect((el as any).delayOut).toBe(0);
  });

  it('has role="tooltip" on the host', () => {
    expect(el.getAttribute('role')).toBe('tooltip');
  });

  it('generates a unique id on the host if one is not set', async () => {
    await nextFrame();
    expect(el.id).toBeTruthy();
  });

  it('sets aria-describedby on the anchor element to include tooltip id', async () => {
    await nextFrame();
    const id = el.id;
    const describedby = anchor.getAttribute('aria-describedby') ?? '';
    expect(describedby).toContain(id);
  });

  it('preserves existing aria-describedby on anchor when wiring', async () => {
    el.remove();
    anchor.setAttribute('aria-describedby', 'existing-desc');
    const tip = document.createElement('core-tooltip');
    tip.setAttribute('anchor', '#tip-anchor');
    document.body.appendChild(tip);
    await (tip as any).updateComplete;
    await nextFrame();
    const describedby = anchor.getAttribute('aria-describedby') ?? '';
    expect(describedby).toContain('existing-desc');
    expect(describedby).toContain(tip.id);
    tip.remove();
  });

  it('restores aria-describedby to its prior value on disconnect', async () => {
    anchor.setAttribute('aria-describedby', 'prior-val');
    el.remove();
    const tip = document.createElement('core-tooltip');
    tip.setAttribute('anchor', '#tip-anchor');
    document.body.appendChild(tip);
    await (tip as any).updateComplete;
    await nextFrame();
    tip.remove();
    await nextFrame();
    expect(anchor.getAttribute('aria-describedby')).toBe('prior-val');
  });

  it('show() transitions toward data-state="open"', async () => {
    (el as any).show();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['opening', 'open']).toContain(state);
  });

  it('hide() transitions toward data-state="closed"', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    (el as any).hide();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('mouseenter on anchor shows tooltip (with delay-in=0 override)', async () => {
    (el as any).delayIn = 0;
    await nextFrame();
    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const state = el.getAttribute('data-state');
    expect(['opening', 'open']).toContain(state);
  });

  it('mouseleave on anchor hides tooltip', async () => {
    (el as any).delayIn = 0;
    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    anchor.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('fires core-tooltip-open after show()', async () => {
    const spy = vi.fn();
    el.addEventListener('core-tooltip-open', spy);
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires core-tooltip-close after hide()', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-tooltip-close', spy);
    (el as any).hide();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not steal focus when shown', async () => {
    const outsideBtn = document.createElement('button');
    document.body.appendChild(outsideBtn);
    outsideBtn.focus();
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const focused = el.shadowRoot?.activeElement;
    expect(focused).toBeNull();
    outsideBtn.remove();
  });

  it('renders [part="tooltip"] wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="tooltip"]')).not.toBeNull();
  });
});

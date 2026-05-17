// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './popover';

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('<core-popover>', () => {
  let anchor: HTMLButtonElement;
  let el: HTMLElement;

  beforeEach(async () => {
    anchor = document.createElement('button');
    anchor.id = 'pop-anchor';
    document.body.appendChild(anchor);
    el = document.createElement('core-popover');
    el.setAttribute('anchor', '#pop-anchor');
    document.body.appendChild(el);
    await (el as any).updateComplete;
  });

  afterEach(() => {
    anchor.remove();
    el.remove();
  });

  it('uses Shadow DOM', () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it('starts with data-state="closed"', () => {
    expect(el.getAttribute('data-state')).toBe('closed');
  });

  it('default placement is "bottom"', () => {
    expect((el as any).placement).toBe('bottom');
  });

  it('default offset is 4', () => {
    expect((el as any).offset).toBe(4);
  });

  it('default closedby is "any"', () => {
    expect((el as any).closedby).toBe('any');
  });

  it('autofocus defaults to false', () => {
    expect((el as any).autofocus).toBe(false);
  });

  it('resolves anchorElement from anchor attribute', async () => {
    await nextFrame();
    expect((el as any).anchorElement).toBe(anchor);
  });

  it('renders [part="popover"] wrapper', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(el.shadowRoot!.querySelector('[part="popover"]')).not.toBeNull();
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

  it('toggle() shows when closed, hides when open', async () => {
    (el as any).toggle();
    await nextFrame();
    expect(el.hasAttribute('open')).toBe(true);
    (el as any).toggle();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('fires core-popover-open after show()', async () => {
    const spy = vi.fn();
    el.addEventListener('core-popover-open', spy);
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires core-popover-close after hide()', async () => {
    (el as any).show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-popover-close', spy);
    (el as any).hide();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('anchorElement property setter is accepted', () => {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    (el as any).anchorElement = btn;
    expect((el as any).anchorElement).toBe(btn);
    btn.remove();
  });

  it('accepts placement="top-start"', async () => {
    el.setAttribute('placement', 'top-start');
    await nextFrame();
    expect((el as any).placement).toBe('top-start');
  });

  it('accepts placement="end-end"', async () => {
    el.setAttribute('placement', 'end-end');
    await nextFrame();
    expect((el as any).placement).toBe('end-end');
  });
});

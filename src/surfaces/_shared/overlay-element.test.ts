// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreOverlayElement } from './overlay-element';

@customElement('test-overlay')
class TestOverlay extends CoreOverlayElement {
  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-overlay': TestOverlay;
  }
}

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('CoreOverlayElement', () => {
  let el: TestOverlay;

  beforeEach(async () => {
    el = document.createElement('test-overlay') as TestOverlay;
    document.body.appendChild(el);
    await (el as any).updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  it('starts with data-state="closed" and no open attribute', () => {
    expect(el.getAttribute('data-state')).toBe('closed');
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('uses Shadow DOM', () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it('show() sets open attribute and advances to data-state="opening"', async () => {
    el.show();
    await nextFrame();
    expect(el.hasAttribute('open')).toBe(true);
    const state = el.getAttribute('data-state');
    expect(['opening', 'open']).toContain(state);
  });

  it('close() removes open attribute and advances toward data-state="closed"', async () => {
    el.show();
    await nextFrame();
    el.close();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('toggle() shows when closed, closes when open', async () => {
    expect(el.getAttribute('data-state')).toBe('closed');
    el.toggle();
    await nextFrame();
    expect(el.hasAttribute('open')).toBe(true);
    el.toggle();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('fires core-overlay-open event after show()', async () => {
    const spy = vi.fn();
    el.addEventListener('core-overlay-open', spy);
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires core-overlay-close event after close()', async () => {
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-overlay-close', spy);
    el.close();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('default closedby is "closerequest"', () => {
    expect(el.closedby).toBe('closerequest');
  });

  it('closedby="none" prevents ESC close', async () => {
    el.setAttribute('closedby', 'none');
    el.show();
    await nextFrame();
    const openBefore = el.hasAttribute('open');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextFrame();
    expect(el.hasAttribute('open')).toBe(openBefore);
  });

  it('closedby="closerequest" allows ESC close', async () => {
    el.setAttribute('closedby', 'closerequest');
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('[data-core-close] inside the element triggers close()', async () => {
    const btn = document.createElement('button');
    btn.setAttribute('data-core-close', '');
    el.appendChild(btn);
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    btn.click();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('close(value) stores returnValue', async () => {
    el.show();
    await nextFrame();
    el.close('confirmed');
    expect(el.returnValue).toBe('confirmed');
  });

  it('returnValue is empty string before any close', () => {
    expect(el.returnValue).toBe('');
  });

  it('modal attribute defaults to true', () => {
    expect(el.modal).toBe(true);
  });

  it('does not throw when attachInternals is unavailable (happy-dom guard)', () => {
    const el2 = document.createElement('test-overlay') as TestOverlay;
    document.body.appendChild(el2);
    expect(el2).not.toBeNull();
    el2.remove();
  });

  it('backdrop click on host closes when closedby="any"', async () => {
    el.setAttribute('closedby', 'any');
    el.setAttribute('modal', '');
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    const clickEv = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(clickEv, 'target', { value: el, configurable: true });
    el.dispatchEvent(clickEv);
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('ESC fires core-overlay-cancel; preventDefault blocks close', async () => {
    el.setAttribute('closedby', 'closerequest');
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    el.addEventListener('core-overlay-cancel', (ev) => ev.preventDefault());
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await nextFrame();
    expect(el.getAttribute('data-state')).toBe('open');
  });

  it('showModal() is callable without throwing', () => {
    expect(() => el.showModal()).not.toThrow();
  });
});

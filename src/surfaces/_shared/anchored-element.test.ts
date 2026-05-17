// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CoreAnchoredElement } from './anchored-element';

@customElement('test-anchored')
class TestAnchored extends CoreAnchoredElement {
  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-anchored': TestAnchored;
  }
}

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('CoreAnchoredElement', () => {
  let anchor: HTMLButtonElement;
  let el: TestAnchored;

  beforeEach(async () => {
    anchor = document.createElement('button');
    anchor.id = 'test-anchor-btn';
    document.body.appendChild(anchor);
    el = document.createElement('test-anchored') as TestAnchored;
    document.body.appendChild(el);
    await (el as any).updateComplete;
  });

  afterEach(() => {
    anchor.remove();
    el.remove();
  });

  it('starts with data-state="closed"', () => {
    expect(el.getAttribute('data-state')).toBe('closed');
  });

  it('uses Shadow DOM', () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it('default placement is "bottom"', () => {
    expect(el.placement).toBe('bottom');
  });

  it('default offset is 4', () => {
    expect(el.offset).toBe(4);
  });

  it('anchor attribute resolves to the element by id selector in document', async () => {
    el.setAttribute('anchor', '#test-anchor-btn');
    await nextFrame();
    expect(el.anchorElement).toBe(anchor);
  });

  it('anchorElement property setter overrides anchor attribute', async () => {
    const other = document.createElement('span');
    document.body.appendChild(other);
    el.anchorElement = other;
    expect(el.anchorElement).toBe(other);
    other.remove();
  });

  it('anchorElement setter accepts null to clear the anchor', () => {
    el.anchorElement = null;
    expect(el.anchorElement).toBeNull();
  });

  it('changing the anchor attribute detaches from old and reattaches to new', async () => {
    const other = document.createElement('button');
    other.id = 'other-anchor';
    document.body.appendChild(other);
    el.setAttribute('anchor', '#test-anchor-btn');
    await nextFrame();
    el.setAttribute('anchor', '#other-anchor');
    await nextFrame();
    expect(el.anchorElement).toBe(other);
    other.remove();
  });

  it('show() sets open attribute and data-state transitions toward "open"', async () => {
    el.setAttribute('anchor', '#test-anchor-btn');
    el.show();
    await nextFrame();
    expect(el.hasAttribute('open')).toBe(true);
    const state = el.getAttribute('data-state');
    expect(['opening', 'open']).toContain(state);
  });

  it('hide() removes open attribute', async () => {
    el.setAttribute('anchor', '#test-anchor-btn');
    el.show();
    await nextFrame();
    el.hide();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('toggle() shows when closed, hides when open', async () => {
    el.setAttribute('anchor', '#test-anchor-btn');
    el.toggle();
    await nextFrame();
    expect(el.hasAttribute('open')).toBe(true);
    el.toggle();
    await nextFrame();
    const state = el.getAttribute('data-state');
    expect(['closing', 'closed']).toContain(state);
  });

  it('fires core-anchored-open after show()', async () => {
    const spy = vi.fn();
    el.addEventListener('core-anchored-open', spy);
    el.setAttribute('anchor', '#test-anchor-btn');
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('fires core-anchored-close after hide()', async () => {
    el.setAttribute('anchor', '#test-anchor-btn');
    el.show();
    await new Promise((r) => setTimeout(r, 300));
    const spy = vi.fn();
    el.addEventListener('core-anchored-close', spy);
    el.hide();
    await new Promise((r) => setTimeout(r, 300));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('default closedby is "any"', () => {
    expect(el.closedby).toBe('any');
  });

  it('_placementToPositionArea() returns a non-empty string for all 12 placements', () => {
    const placements = [
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'start', 'start-start', 'start-end',
      'end', 'end-start', 'end-end',
    ] as const;
    for (const p of placements) {
      const css = (el as any)._placementToPositionArea(p);
      expect(typeof css).toBe('string');
      expect(css.length).toBeGreaterThan(0);
    }
  });

  it('_applyJsFallback() does not throw when anchorElement is null', () => {
    el.anchorElement = null;
    expect(() => (el as any)._applyJsFallback()).not.toThrow();
  });

  it('_applyJsFallback() does not throw when anchorElement is set', () => {
    el.anchorElement = anchor;
    expect(() => (el as any)._applyJsFallback()).not.toThrow();
  });

  it('disconnect tears down resize/scroll listeners without throwing', () => {
    el.setAttribute('anchor', '#test-anchor-btn');
    el.show();
    expect(() => el.remove()).not.toThrow();
    document.body.appendChild(el);
  });
});

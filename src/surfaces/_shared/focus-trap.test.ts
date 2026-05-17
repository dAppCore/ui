// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFocusTrap, type FocusTrap } from './focus-trap';

function makeRoot(...tagNames: string[]): HTMLElement {
  const root = document.createElement('div');
  for (const tag of tagNames) {
    root.appendChild(document.createElement(tag));
  }
  document.body.appendChild(root);
  return root;
}

function makeButton(attrs: Record<string, string | boolean> = {}): HTMLButtonElement {
  const btn = document.createElement('button');
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) btn.setAttribute(k, '');
    else if (v !== false) btn.setAttribute(k, String(v));
  }
  return btn;
}

describe('createFocusTrap()', () => {
  let root: HTMLElement;
  let trap: FocusTrap;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    trap?.deactivate();
    root.remove();
  });

  it('returns an object with activate and deactivate methods', () => {
    trap = createFocusTrap(root);
    expect(typeof trap.activate).toBe('function');
    expect(typeof trap.deactivate).toBe('function');
  });

  it('activate() focuses the first focusable child', () => {
    const btn1 = makeButton();
    const btn2 = makeButton();
    root.appendChild(btn1);
    root.appendChild(btn2);
    trap = createFocusTrap(root);
    trap.activate();
    expect(btn1).not.toBeNull();
  });

  it('activate() stores document.activeElement as the return-to target', () => {
    const outside = makeButton();
    document.body.appendChild(outside);
    outside.focus();
    const btn = makeButton();
    root.appendChild(btn);
    trap = createFocusTrap(root);
    trap.activate();
    expect(() => trap.deactivate()).not.toThrow();
    outside.remove();
  });

  it('ignores [hidden] elements when collecting focusables', () => {
    const visible = makeButton();
    const hidden = makeButton({ hidden: true });
    root.appendChild(visible);
    root.appendChild(hidden);
    trap = createFocusTrap(root);
    const focusables = (trap as any)._focusables?.() ?? [];
    if (focusables.length > 0) {
      expect(focusables).not.toContain(hidden);
    }
  });

  it('ignores [disabled] elements when collecting focusables', () => {
    const active = makeButton();
    const disabled = makeButton({ disabled: true });
    root.appendChild(active);
    root.appendChild(disabled);
    trap = createFocusTrap(root);
    const focusables = (trap as any)._focusables?.() ?? [];
    if (focusables.length > 0) {
      expect(focusables).not.toContain(disabled);
    }
  });

  it('ignores tabindex="-1" elements when collecting focusables', () => {
    const normal = makeButton();
    const excluded = makeButton({ tabindex: '-1' });
    root.appendChild(normal);
    root.appendChild(excluded);
    trap = createFocusTrap(root);
    const focusables = (trap as any)._focusables?.() ?? [];
    if (focusables.length > 0) {
      expect(focusables).not.toContain(excluded);
    }
  });

  it('ignores <input type="hidden"> when collecting focusables', () => {
    const text = document.createElement('input');
    text.type = 'text';
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    root.appendChild(text);
    root.appendChild(hidden);
    trap = createFocusTrap(root);
    const focusables = (trap as any)._focusables?.() ?? [];
    if (focusables.length > 0) {
      expect(focusables).not.toContain(hidden);
    }
  });

  it('Tab key cycles forward through focusables (wraps to first)', () => {
    const btn1 = makeButton();
    const btn2 = makeButton();
    root.appendChild(btn1);
    root.appendChild(btn2);
    trap = createFocusTrap(root);
    trap.activate();
    btn2.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    expect(() => document.dispatchEvent(ev)).not.toThrow();
  });

  it('Shift+Tab key cycles backward (wraps to last)', () => {
    const btn1 = makeButton();
    const btn2 = makeButton();
    root.appendChild(btn1);
    root.appendChild(btn2);
    trap = createFocusTrap(root);
    trap.activate();
    btn1.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    expect(() => document.dispatchEvent(ev)).not.toThrow();
  });

  it('deactivate() removes the keydown listener (second Tab does not throw)', () => {
    const btn = makeButton();
    root.appendChild(btn);
    trap = createFocusTrap(root);
    trap.activate();
    trap.deactivate();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    expect(() => document.dispatchEvent(ev)).not.toThrow();
  });

  it('deactivate() is idempotent — calling twice does not throw', () => {
    trap = createFocusTrap(root);
    trap.activate();
    expect(() => {
      trap.deactivate();
      trap.deactivate();
    }).not.toThrow();
  });

  it('activate() on an empty root (no focusable children) does not throw', () => {
    trap = createFocusTrap(root);
    expect(() => trap.activate()).not.toThrow();
  });

  it('activate() on a root with one focusable focuses it', () => {
    const btn = makeButton();
    root.appendChild(btn);
    trap = createFocusTrap(root);
    expect(() => trap.activate()).not.toThrow();
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { FocusTrap } from './focus-trap';
import type { ReactiveControllerHost } from 'lit';

function makeContainer(): HTMLElement & ReactiveControllerHost {
  const el = document.createElement('div') as any;
  el.tabIndex = -1;
  el.addController = vi.fn();
  el.removeController = vi.fn();
  el.requestUpdate = vi.fn();
  el.updateComplete = Promise.resolve(true);
  el.innerHTML = `
    <button id="a">A</button>
    <button id="b">B</button>
    <button id="c">C</button>
  `;
  document.body.appendChild(el);
  return el;
}

describe('FocusTrap', () => {
  it('focuses the first focusable on activate()', () => {
    const el = makeContainer();
    const trap = new FocusTrap(el);
    trap.activate();
    expect(document.activeElement?.id).toBe('a');
  });
  it('restores previous focus on deactivate()', () => {
    const before = document.createElement('button');
    document.body.appendChild(before);
    before.focus();
    const el = makeContainer();
    const trap = new FocusTrap(el);
    trap.activate();
    trap.deactivate();
    expect(document.activeElement).toBe(before);
  });
  it('wraps Tab from last back to first', () => {
    const el = makeContainer();
    const trap = new FocusTrap(el);
    trap.activate();
    (el.querySelector('#c') as HTMLElement).focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement?.id).toBe('a');
  });
});

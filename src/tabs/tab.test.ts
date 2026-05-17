// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './tab';
import type { CoreTab } from './tab';

function makeTab(html = '<core-tab>Label</core-tab>'): CoreTab {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.querySelector('core-tab') as CoreTab;
}

describe('<core-tab>', () => {
  it('registers as core-tab custom element', () => {
    const el = makeTab();
    expect(el.tagName.toLowerCase()).toBe('core-tab');
    el.closest('div')!.remove();
  });

  it('reflects for attribute', () => {
    const el = makeTab('<core-tab for="panel-a">Label</core-tab>');
    expect(el.getAttribute('for')).toBe('panel-a');
    el.for = 'panel-b';
    expect(el.getAttribute('for')).toBe('panel-b');
    el.closest('div')!.remove();
  });

  it('reflects disabled boolean attribute', () => {
    const el = makeTab('<core-tab disabled>Label</core-tab>');
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(true);
    el.disabled = false;
    expect(el.hasAttribute('disabled')).toBe(false);
    el.closest('div')!.remove();
  });

  it('dispatches core-tab-click on click when not disabled', () => {
    const el = makeTab('<core-tab>Label</core-tab>');
    const handler = vi.fn();
    el.addEventListener('core-tab-click', handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    el.closest('div')!.remove();
  });

  it('does NOT dispatch core-tab-click when disabled', () => {
    const el = makeTab('<core-tab disabled>Label</core-tab>');
    const handler = vi.fn();
    el.addEventListener('core-tab-click', handler);
    el.click();
    expect(handler).not.toHaveBeenCalled();
    el.closest('div')!.remove();
  });
});

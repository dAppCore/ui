// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import './tabpanel';
import type { CoreTabpanel } from './tabpanel';

function makePanel(html = '<core-tabpanel>Content</core-tabpanel>'): CoreTabpanel {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.querySelector('core-tabpanel') as CoreTabpanel;
}

describe('<core-tabpanel>', () => {
  it('registers as core-tabpanel custom element', () => {
    const el = makePanel();
    expect(el.tagName.toLowerCase()).toBe('core-tabpanel');
    el.closest('div')!.remove();
  });

  it('reflects consumer-set id attribute', () => {
    const el = makePanel('<core-tabpanel id="general">Content</core-tabpanel>');
    expect(el.id).toBe('general');
    expect(el.tabId).toBe('general');
    el.closest('div')!.remove();
  });

  it('hidden attribute toggles visibility (parent sets it)', () => {
    const el = makePanel('<core-tabpanel id="a">Content</core-tabpanel>');
    expect(el.hidden).toBe(false);
    el.hidden = true;
    expect(el.hasAttribute('hidden')).toBe(true);
    el.hidden = false;
    expect(el.hasAttribute('hidden')).toBe(false);
    el.closest('div')!.remove();
  });

  it('selected getter reflects aria-selected set by parent', () => {
    const el = makePanel('<core-tabpanel>Content</core-tabpanel>');
    expect(el.selected).toBe(false);
    el.setAttribute('aria-selected', 'true');
    expect(el.selected).toBe(true);
    el.closest('div')!.remove();
  });
});

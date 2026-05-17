// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import './menu-separator';
import type { CoreMenuSeparator } from './menu-separator';

function makeSep(html = '<core-menu-separator></core-menu-separator>'): CoreMenuSeparator {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.querySelector('core-menu-separator') as CoreMenuSeparator;
}

describe('<core-menu-separator>', () => {
  it('registers as core-menu-separator custom element', () => {
    const el = makeSep();
    expect(el.tagName.toLowerCase()).toBe('core-menu-separator');
    el.closest('div')!.remove();
  });

  it('is light DOM — no shadow root', () => {
    const el = makeSep();
    expect(el.shadowRoot).toBeNull();
    el.closest('div')!.remove();
  });

  it('role="separator" set by parent (aria-orientation set externally)', () => {
    const el = makeSep();
    el.setAttribute('role', 'separator');
    el.setAttribute('aria-orientation', 'horizontal');
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
    el.closest('div')!.remove();
  });
});

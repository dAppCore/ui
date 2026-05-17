// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './menuitem';
import type { CoreMenuitem } from './menuitem';

function makeItem(html = '<core-menuitem>Label</core-menuitem>'): CoreMenuitem {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper.querySelector('core-menuitem') as CoreMenuitem;
}

describe('<core-menuitem>', () => {
  it('registers as core-menuitem custom element', () => {
    const el = makeItem();
    expect(el.tagName.toLowerCase()).toBe('core-menuitem');
    el.closest('div')!.remove();
  });

  it('reflects disabled boolean attribute synchronously', () => {
    const el = makeItem('<core-menuitem disabled>Label</core-menuitem>');
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(true);
    el.disabled = false;
    expect(el.hasAttribute('disabled')).toBe(false);
    expect(el.disabled).toBe(false);
    el.closest('div')!.remove();
  });

  it('reflects has-submenu boolean attribute synchronously', () => {
    const el = makeItem('<core-menuitem has-submenu>Label</core-menuitem>');
    expect(el.hasSubmenu).toBe(true);
    expect(el.hasAttribute('has-submenu')).toBe(true);
    el.hasSubmenu = false;
    expect(el.hasAttribute('has-submenu')).toBe(false);
    el.closest('div')!.remove();
  });

  it('value getter returns attribute value, falls back to textContent.trim()', () => {
    const el = makeItem('<core-menuitem value="save">Save File</core-menuitem>');
    expect(el.value).toBe('save');
    el.removeAttribute('value');
    expect(el.value).toBe('Save File');
    el.closest('div')!.remove();
  });

  it('dispatches core-menuitem-click on click when not disabled', () => {
    const el = makeItem('<core-menuitem>Label</core-menuitem>');
    const handler = vi.fn();
    el.addEventListener('core-menuitem-click', handler);
    el.click();
    expect(handler).toHaveBeenCalledOnce();
    el.closest('div')!.remove();
  });

  it('does NOT dispatch core-menuitem-click when disabled', () => {
    const el = makeItem('<core-menuitem disabled>Label</core-menuitem>');
    const handler = vi.fn();
    el.addEventListener('core-menuitem-click', handler);
    el.click();
    expect(handler).not.toHaveBeenCalled();
    el.closest('div')!.remove();
  });
});

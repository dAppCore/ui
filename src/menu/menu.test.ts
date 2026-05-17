// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { describe, it, expect, vi } from 'vitest';
import './menuitem';
import './menu-separator';
import './menu';
import type { CoreMenu } from './menu';
import type { CoreMenuitem } from './menuitem';

// ── helpers ──────────────────────────────────────────────────────────────────

async function makeMenu(inner: string): Promise<CoreMenu> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<core-menu>${inner}</core-menu>`;
  document.body.appendChild(wrapper);
  const el = wrapper.querySelector('core-menu') as CoreMenu;
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

function cleanup(el: CoreMenu): void {
  el.closest('div')?.remove();
}

const THREE_ITEMS = `
  <core-menuitem>New file</core-menuitem>
  <core-menuitem>Open</core-menuitem>
  <core-menuitem>Save</core-menuitem>
`;

const WITH_DISABLED = `
  <core-menuitem>New file</core-menuitem>
  <core-menuitem disabled>Open recent</core-menuitem>
  <core-menuitem>Save</core-menuitem>
`;

// ── baseline ─────────────────────────────────────────────────────────────────

describe('<core-menu> — baseline', () => {
  it('registers as core-menu custom element', async () => {
    const el = await makeMenu(THREE_ITEMS);
    expect(el.tagName.toLowerCase()).toBe('core-menu');
    cleanup(el);
  });

  it('slotchange reads <core-menuitem> children into _items (excludes separators)', async () => {
    const el = await makeMenu(`
      <core-menuitem>One</core-menuitem>
      <core-menu-separator></core-menu-separator>
      <core-menuitem>Two</core-menuitem>
    `);
    expect((el as any)._items.length).toBe(2);
    cleanup(el);
  });

  it('sets role="menu" on the [part="menu"] shadow container', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const part = el.shadowRoot?.querySelector('[part="menu"]');
    expect(part?.getAttribute('role')).toBe('menu');
    cleanup(el);
  });

  it('sets aria-orientation="vertical" by default', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const part = el.shadowRoot?.querySelector('[part="menu"]');
    expect(part?.getAttribute('aria-orientation')).toBe('vertical');
    cleanup(el);
  });

  it('sets role="menuitem" on each <core-menuitem>', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const items = el.querySelectorAll('core-menuitem');
    items.forEach((item) => {
      expect(item.getAttribute('role')).toBe('menuitem');
    });
    cleanup(el);
  });

  it('sets role="separator" on <core-menu-separator>', async () => {
    const el = await makeMenu(`
      <core-menuitem>One</core-menuitem>
      <core-menu-separator></core-menu-separator>
      <core-menuitem>Two</core-menuitem>
    `);
    const sep = el.querySelector('core-menu-separator');
    expect(sep?.getAttribute('role')).toBe('separator');
    cleanup(el);
  });

  it('roving tabindex: first non-disabled item gets tabindex="0", others -1', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    expect(items[2].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });

  it('disabled item gets aria-disabled="true"', async () => {
    const el = await makeMenu(WITH_DISABLED);
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].hasAttribute('aria-disabled')).toBe(false);
    expect(items[1].getAttribute('aria-disabled')).toBe('true');
    cleanup(el);
  });

  it('click on enabled item fires core-menu-select with {item, index, value}', async () => {
    const el = await makeMenu(`<core-menuitem value="new">New file</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    const item = el.querySelector('core-menuitem') as HTMLElement;
    item.click();
    expect(detail).toBeDefined();
    expect(detail.value).toBe('new');
    expect(detail.index).toBe(0);
    cleanup(el);
  });

  it('core-menu-select value falls back to textContent.trim() when no value attr', async () => {
    const el = await makeMenu(`<core-menuitem>Save File</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    const item = el.querySelector('core-menuitem') as HTMLElement;
    item.click();
    expect(detail.value).toBe('Save File');
    cleanup(el);
  });

  it('click on disabled item does NOT fire core-menu-select', async () => {
    const el = await makeMenu(`<core-menuitem disabled>Disabled</core-menuitem>`);
    const handler = vi.fn();
    el.addEventListener('core-menu-select', handler);
    const item = el.querySelector('core-menuitem') as HTMLElement;
    item.click();
    expect(handler).not.toHaveBeenCalled();
    cleanup(el);
  });

  it('Escape fires core-menu-close (cancellable)', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const handler = vi.fn();
    el.addEventListener('core-menu-close', handler);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    cleanup(el);
  });

  it('preventDefault on core-menu-close keeps menu open (open attr stays)', async () => {
    const el = await makeMenu(THREE_ITEMS);
    el.setAttribute('open', '');
    el.addEventListener('core-menu-close', (e: Event) => { e.preventDefault(); });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.hasAttribute('open')).toBe(true);
    cleanup(el);
  });

  it('focusFirst() sets tabindex="0" on first non-disabled item', async () => {
    const el = await makeMenu(WITH_DISABLED);
    el.focusFirst();
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('focusLast() sets tabindex="0" on last non-disabled item', async () => {
    const el = await makeMenu(WITH_DISABLED);
    el.focusLast();
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('focusItem(index) sets tabindex="0" on item at given index', async () => {
    const el = await makeMenu(THREE_ITEMS);
    el.focusItem(2);
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });

  it('focusItem(el) sets tabindex="0" on specified element ref', async () => {
    const el = await makeMenu(THREE_ITEMS);
    const items = el.querySelectorAll('core-menuitem');
    el.focusItem(items[1] as CoreMenuitem);
    expect(items[1].getAttribute('tabindex')).toBe('0');
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });
});

// ── Keyboard navigation ───────────────────────────────────────────────────

describe('<core-menu> — keyboard navigation + type-ahead', () => {
  it('ArrowDown (vertical) moves focus to next non-disabled item', async () => {
    const el = await makeMenu(THREE_ITEMS);
    // Initial focus is on index 0. ArrowDown → index 1.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    cleanup(el);
  });

  it('ArrowUp (vertical) moves focus to previous item, wrapping at top', async () => {
    const el = await makeMenu(THREE_ITEMS);
    // Start at index 0. ArrowUp wraps to last (index 2).
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('ArrowDown skips disabled items in the middle', async () => {
    const el = await makeMenu(WITH_DISABLED);
    // index 0 focused. ArrowDown → skip index 1 (disabled) → index 2.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('Home key focuses first non-disabled item', async () => {
    const el = await makeMenu(THREE_ITEMS);
    // Move to last first, then Home.
    el.focusItem(2);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('End key focuses last non-disabled item', async () => {
    const el = await makeMenu(THREE_ITEMS);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[2].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('Enter key activates focused item → fires core-menu-select', async () => {
    const el = await makeMenu(`<core-menuitem value="open">Open</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(detail).toBeDefined();
    expect(detail.value).toBe('open');
    cleanup(el);
  });

  it('Space key (" ") activates focused item → fires core-menu-select', async () => {
    const el = await makeMenu(`<core-menuitem value="save">Save</core-menuitem>`);
    let detail: any;
    el.addEventListener('core-menu-select', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    // Real-browser space char — ' ' (single space character, v0.4 T6 pattern).
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(detail).toBeDefined();
    expect(detail.value).toBe('save');
    cleanup(el);
  });

  it('type-ahead: typing "s" focuses first item starting with "s"', async () => {
    const el = await makeMenu(`
      <core-menuitem>New file</core-menuitem>
      <core-menuitem>Open</core-menuitem>
      <core-menuitem>Save</core-menuitem>
      <core-menuitem>Settings</core-menuitem>
    `);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    // "Save" is the first item (from focused+1=1) starting with "s"
    expect(items[2].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('type-ahead: multi-char within 500ms refines match', async () => {
    const el = await makeMenu(`
      <core-menuitem>Save</core-menuitem>
      <core-menuitem>Settings</core-menuitem>
      <core-menuitem>Sort</core-menuitem>
    `);
    // Type 's' — matches Save (index 0, searching from -1+1=0).
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }));
    // Type 'e' immediately (within 500ms window) — buffer is now "se", matches Settings.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true }));
    const items = el.querySelectorAll('core-menuitem');
    expect(items[1].getAttribute('tabindex')).toBe('0');
    cleanup(el);
  });

  it('all-disabled keyboard nav is a no-op (no infinite loop)', async () => {
    const el = await makeMenu(`
      <core-menuitem disabled>Disabled A</core-menuitem>
      <core-menuitem disabled>Disabled B</core-menuitem>
    `);
    expect(() => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }).not.toThrow();
    cleanup(el);
  });
});

// ── Submenu tests ─────────────────────────────────────────────────────────

describe('<core-menu> — submenu open/close', () => {
  const WITH_SUBMENU = `
    <core-menuitem>New file</core-menuitem>
    <core-menuitem has-submenu>Export
      <core-menu>
        <core-menuitem value="pdf">As PDF</core-menuitem>
        <core-menuitem value="html">As HTML</core-menuitem>
      </core-menu>
    </core-menuitem>
    <core-menuitem>Save</core-menuitem>
  `;

  it('clicking has-submenu trigger opens the nested <core-menu> (removes hidden)', async () => {
    const el = await makeMenu(WITH_SUBMENU);
    const trigger = el.querySelectorAll('core-menuitem')[1] as HTMLElement;
    const nested = trigger.querySelector('core-menu') as any;

    // Nested menu starts hidden.
    expect(nested.hasAttribute('hidden')).toBe(true);

    // Click the trigger item — parent handles core-menuitem-click.
    trigger.click();

    expect(nested.hasAttribute('hidden')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    cleanup(el);
  });

  it('ArrowRight (vertical) on has-submenu item opens submenu', async () => {
    const el = await makeMenu(WITH_SUBMENU);
    // Focus the trigger (index 1).
    el.focusItem(1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const trigger = el.querySelectorAll('core-menuitem')[1];
    const nested = trigger.querySelector('core-menu') as any;
    expect(nested.hasAttribute('hidden')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    cleanup(el);
  });

  it('ArrowLeft (vertical) closes active submenu and sets aria-expanded="false"', async () => {
    const el = await makeMenu(WITH_SUBMENU);
    // Open the submenu first.
    el.focusItem(1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    const trigger = el.querySelectorAll('core-menuitem')[1];
    const nested = trigger.querySelector('core-menu') as any;
    expect(nested.hasAttribute('hidden')).toBe(false);

    // ArrowLeft closes it.
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(nested.hasAttribute('hidden')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    cleanup(el);
  });

  it('only one submenu open at a time — opening second closes first', async () => {
    const el = await makeMenu(`
      <core-menuitem has-submenu>Export
        <core-menu>
          <core-menuitem value="pdf">As PDF</core-menuitem>
        </core-menu>
      </core-menuitem>
      <core-menuitem has-submenu>Share
        <core-menu>
          <core-menuitem value="email">By email</core-menuitem>
        </core-menu>
      </core-menuitem>
    `);
    // Use Array.from(el.children) — querySelectorAll('core-menuitem') returns
    // ALL descendants (depth-first), so nested items appear between top-level
    // triggers. el.children gives direct children only (happy-dom safe).
    const [trigger1, trigger2] = Array.from(el.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-menuitem',
    );
    const [nested1, nested2] = el.querySelectorAll('core-menu core-menu');

    // Open first submenu.
    (trigger1 as HTMLElement).click();
    expect((nested1 as Element).hasAttribute('hidden')).toBe(false);

    // Open second — first should auto-close.
    (trigger2 as HTMLElement).click();
    expect((nested1 as Element).hasAttribute('hidden')).toBe(true);
    expect((nested2 as Element).hasAttribute('hidden')).toBe(false);
    cleanup(el);
  });
});

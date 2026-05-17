// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { CoreMenuitem } from './menuitem';

export type MenuOrientation = 'vertical' | 'horizontal';

/**
 * `<core-menu>` — Shadow DOM menu container.
 *
 * Owns all state: orientation, focused index, type-ahead buffer, active submenu.
 * Reads `<core-menuitem>` + `<core-menu-separator>` children via slotchange +
 * MutationObserver (dual observation — v0.4 pattern), applies ARIA, manages
 * roving tabindex, controls submenu hidden attribute, runs keyboard nav +
 * type-ahead.
 *
 * Child observation uses `Array.from(this.children).filter(...)` rather than
 * `:scope >` querySelectorAll — the `:scope >` CSS child combinator is
 * unreliable in happy-dom (v0.4 T4 deviation). Equivalent in all real browsers.
 *
 * Attributes (manual sync getters/setters): orientation, open
 * Properties (read-only): items, focusedIndex
 * Methods: focusFirst(), focusLast(), focusItem(indexOrEl), close()
 * Events: core-menu-select (detail: {item, index, value}), core-menu-close (cancellable)
 * Parts: menu
 */
@customElement('core-menu')
export class CoreMenu extends LitElement {

  // ── Reflected attributes (manual sync — v0.4 T2 pattern) ─────────────────

  get orientation(): MenuOrientation {
    return (this.getAttribute('orientation') as MenuOrientation) ?? 'vertical';
  }
  set orientation(value: MenuOrientation) {
    this.setAttribute('orientation', value);
  }

  get open(): boolean {
    return this.hasAttribute('open');
  }
  set open(value: boolean) {
    if (value) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  // ── Internal state ───────────────────────────────────────────────────────

  _items: CoreMenuitem[] = [];
  _focusedIndex = -1;
  private _typeAheadBuffer = '';
  private _typeAheadTimer: number | null = null;
  _activeSubmenu: CoreMenu | null = null;

  private _slotObserver: MutationObserver | null = null;

  // ── Styles ───────────────────────────────────────────────────────────────

  static override styles = css`
    :host {
      display: block;
    }

    [part="menu"] {
      display: flex;
      flex-direction: column;
      background: var(--core-menu-bg, var(--core-ink-1));
      border: 1px solid var(--core-menu-border-color, var(--core-line-2));
      border-radius: var(--core-menu-radius, 8px);
      box-shadow: var(--core-menu-shadow, var(--core-shadow-2));
      padding: 4px 0;
      min-width: 160px;
      outline: none;
    }

    :host([orientation="horizontal"]) [part="menu"] {
      flex-direction: row;
      align-items: center;
      padding: 0 4px;
    }

    ::slotted(core-menu-separator) {
      display: block;
      border-top: 1px solid var(--core-menu-border-color, var(--core-line-2));
      margin: 4px 0;
    }

    :host([orientation="horizontal"]) ::slotted(core-menu-separator) {
      border-top: none;
      border-left: 1px solid var(--core-menu-border-color, var(--core-line-2));
      margin: 0 4px;
      align-self: stretch;
    }

    ::slotted(core-menuitem) {
      display: flex;
      align-items: center;
      padding: var(--core-menuitem-padding, 8px 12px);
      cursor: pointer;
      user-select: none;
      gap: 8px;
    }

    ::slotted(core-menuitem[data-focused]) {
      background: var(--core-menuitem-bg-active, var(--core-brand-50));
    }

    ::slotted(core-menuitem[aria-disabled="true"]) {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeydown);
    this.addEventListener('core-menuitem-click', this._onItemClick);
    this._slotObserver = new MutationObserver(() => this._onSlotChange());
    this._slotObserver.observe(this, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ['disabled', 'has-submenu'],
    });
    queueMicrotask(() => this._onSlotChange());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeydown);
    this.removeEventListener('core-menuitem-click', this._onItemClick);
    this._slotObserver?.disconnect();
    this._slotObserver = null;
    if (this._typeAheadTimer !== null) {
      clearTimeout(this._typeAheadTimer);
      this._typeAheadTimer = null;
    }
  }

  override firstUpdated(): void {
    const slot = this.shadowRoot!.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => this._onSlotChange());
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    return html`
      <div part="menu" role="menu" aria-orientation=${this.orientation}>
        <slot></slot>
      </div>
    `;
  }

  // ── Public API ───────────────────────────────────────────────────────────

  get items(): CoreMenuitem[] {
    return this._items;
  }

  get focusedIndex(): number {
    return this._focusedIndex;
  }

  focusFirst(): void {
    const idx = this._nextEnabledIndex(-1, 1);
    if (idx !== -1) this._setFocus(idx);
  }

  focusLast(): void {
    const idx = this._nextEnabledIndex(this._items.length, -1);
    if (idx !== -1) this._setFocus(idx);
  }

  focusItem(indexOrEl: number | CoreMenuitem): void {
    let index: number;
    if (typeof indexOrEl === 'number') {
      index = indexOrEl;
    } else {
      index = this._items.indexOf(indexOrEl);
    }
    if (index < 0 || index >= this._items.length) return;
    this._setFocus(index);
  }

  close(): void {
    if (this._activeSubmenu) {
      this._closeActiveSubmenu();
    }
    const event = new CustomEvent('core-menu-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) {
      this.open = false;
    }
  }

  // ── Slot handling ────────────────────────────────────────────────────────

  private _onSlotChange(): void {
    // Array.from(this.children).filter — `:scope >` unreliable in happy-dom
    // (v0.4 T4 deviation; equivalent in all real browsers).
    this._items = Array.from(this.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-menuitem',
    ) as CoreMenuitem[];

    const seps = Array.from(this.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-menu-separator',
    );

    this._items.forEach((item, i) => {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('data-menuitem-index', String(i));

      if (item.disabled) {
        item.setAttribute('aria-disabled', 'true');
      } else {
        item.removeAttribute('aria-disabled');
      }

      if (item.hasSubmenu) {
        item.setAttribute('aria-haspopup', 'menu');
        const nested = Array.from(item.children).find(
          (c) => c.tagName.toLowerCase() === 'core-menu',
        ) as CoreMenu | undefined;
        if (nested && !nested.open) {
          nested.setAttribute('hidden', '');
          item.setAttribute('aria-expanded', 'false');
        }
      } else {
        item.removeAttribute('aria-haspopup');
        item.removeAttribute('aria-expanded');
      }
    });

    // Separator aria-orientation is the perpendicular of the menu orientation.
    seps.forEach((sep) => {
      sep.setAttribute('role', 'separator');
      sep.setAttribute(
        'aria-orientation',
        this.orientation === 'horizontal' ? 'vertical' : 'horizontal',
      );
    });

    const firstEnabled = this._nextEnabledIndex(-1, 1);
    this._items.forEach((item, i) => {
      item.setAttribute('tabindex', i === firstEnabled ? '0' : '-1');
    });
    this._focusedIndex = firstEnabled;

    this._items.forEach((item) => item.removeAttribute('data-focused'));
    if (firstEnabled !== -1) {
      this._items[firstEnabled].setAttribute('data-focused', '');
    }
  }

  // ── Focus helpers ────────────────────────────────────────────────────────

  private _setFocus(index: number): void {
    this._items.forEach((item, i) => {
      if (i === index) {
        item.setAttribute('tabindex', '0');
        item.setAttribute('data-focused', '');
        // focus() no-op in happy-dom — assert via tabindex attribute instead.
        // Playwright sweep covers actual focus movement.
        if (typeof item.focus === 'function') item.focus();
      } else {
        item.setAttribute('tabindex', '-1');
        item.removeAttribute('data-focused');
      }
    });
    this._focusedIndex = index;
  }

  private _nextEnabledIndex(from: number, delta: number): number {
    const len = this._items.length;
    if (len === 0) return -1;
    let steps = 0;
    let i = ((from + delta) % len + len) % len;
    while (steps < len) {
      if (!this._items[i].disabled) return i;
      i = ((i + delta) % len + len) % len;
      steps++;
    }
    return -1;
  }

  // ── Activation ───────────────────────────────────────────────────────────

  private _activateItem(index: number): void {
    if (index < 0 || index >= this._items.length) return;
    const item = this._items[index];
    if (item.disabled) return;

    if (item.hasSubmenu) {
      this._openSubmenu(item);
      return;
    }

    this.dispatchEvent(new CustomEvent('core-menu-select', {
      bubbles: true,
      composed: true,
      detail: { item, index, value: item.value },
    }));
  }

  // ── Submenu management ───────────────────────────────────────────────────

  private _openSubmenu(triggerItem: CoreMenuitem): void {
    if (this._activeSubmenu) {
      this._closeActiveSubmenu();
    }
    const nested = Array.from(triggerItem.children).find(
      (c) => c.tagName.toLowerCase() === 'core-menu',
    ) as CoreMenu | undefined;
    if (!nested) return;

    triggerItem.setAttribute('aria-expanded', 'true');
    nested.removeAttribute('hidden');
    nested.open = true;
    this._activeSubmenu = nested;
    queueMicrotask(() => nested.focusFirst());
  }

  private _closeActiveSubmenu(): void {
    if (!this._activeSubmenu) return;
    const sub = this._activeSubmenu;
    const trigger = this._items.find((item) =>
      Array.from(item.children).some((c) => c === sub),
    );
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    sub.setAttribute('hidden', '');
    sub.open = false;
    this._activeSubmenu = null;
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private _onItemClick = (e: Event): void => {
    const customEv = e as CustomEvent;
    const item = customEv.detail?.item as CoreMenuitem | undefined;
    if (!item) return;
    const index = this._items.indexOf(item);
    if (index < 0) return;
    this._setFocus(index);
    this._activateItem(index);
    e.stopPropagation();
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    const { key } = e;
    const isVertical = this.orientation === 'vertical';
    const isHorizontal = this.orientation === 'horizontal';
    let handled = false;
    const focused = this._focusedIndex;

    if ((isVertical && key === 'ArrowDown') || (isHorizontal && key === 'ArrowRight')) {
      const next = this._nextEnabledIndex(focused, 1);
      if (next !== -1) this._setFocus(next);
      handled = true;
    } else if ((isVertical && key === 'ArrowUp') || (isHorizontal && key === 'ArrowLeft')) {
      const prev = this._nextEnabledIndex(focused, -1);
      if (prev !== -1) this._setFocus(prev);
      handled = true;
    } else if (key === 'Home') {
      const first = this._nextEnabledIndex(-1, 1);
      if (first !== -1) this._setFocus(first);
      handled = true;
    } else if (key === 'End') {
      const last = this._nextEnabledIndex(this._items.length, -1);
      if (last !== -1) this._setFocus(last);
      handled = true;
    } else if (key === ' ' || key === 'Space' || key === 'Enter') {
      // Real browsers: key === ' '. happy-dom: 'Space'. W3C APG: Enter.
      // Accept all three (v0.4 T6 carry-forward).
      this._activateItem(focused);
      handled = true;
    } else if (isVertical && key === 'ArrowRight') {
      if (focused >= 0 && this._items[focused]?.hasSubmenu) {
        this._openSubmenu(this._items[focused]);
        handled = true;
      }
    } else if (isVertical && key === 'ArrowLeft') {
      if (this._activeSubmenu) {
        this._closeActiveSubmenu();
        if (focused >= 0) this._setFocus(focused);
        handled = true;
      }
    } else if (key === 'Escape') {
      const event = new CustomEvent('core-menu-close', {
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
      if (!event.defaultPrevented) {
        this.open = false;
        if (this._activeSubmenu) this._closeActiveSubmenu();
      }
      handled = true;
    } else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this._handleTypeAhead(key);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // ── Type-ahead ───────────────────────────────────────────────────────────

  private _handleTypeAhead(char: string): void {
    this._typeAheadBuffer += char.toLowerCase();

    if (this._typeAheadTimer !== null) clearTimeout(this._typeAheadTimer);
    this._typeAheadTimer = window.setTimeout(() => {
      this._typeAheadBuffer = '';
      this._typeAheadTimer = null;
    }, 500);

    const buf = this._typeAheadBuffer;
    const len = this._items.length;
    const start = this._focusedIndex >= 0 ? this._focusedIndex : -1;

    for (let step = 1; step <= len; step++) {
      const i = ((start + step) % len + len) % len;
      const item = this._items[i];
      if (item.disabled) continue;
      const label = (item.textContent ?? '').trim().toLowerCase();
      if (label.startsWith(buf)) {
        this._setFocus(i);
        return;
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-menu': CoreMenu;
  }
}

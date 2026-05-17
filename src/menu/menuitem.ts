// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * `<core-menuitem>` — light-DOM trigger for `<core-menu>`.
 *
 * Never renders its own shadow root — children pass through to consumer's DOM.
 * The parent `<core-menu>` reads this element's attributes and sets ARIA
 * properties (`role`, `aria-disabled`, `aria-haspopup`, `aria-expanded`,
 * `tabindex`) after slotchange. Also sets `data-menuitem-index` and
 * `data-focused` data attributes for index tracking and CSS focus styling.
 *
 * Click handler dispatches `core-menuitem-click` (internal, bubbles, composed)
 * so the parent can own selection logic. Disabled items suppress the event.
 *
 *   <core-menuitem>New file</core-menuitem>
 *   <core-menuitem disabled>Open recent</core-menuitem>
 *   <core-menuitem value="save" has-submenu>Export</core-menuitem>
 *
 * Attributes (reflected synchronously): disabled, has-submenu, value
 * Properties (read-only, set by parent): selected (via data-focused), index (via data-menuitem-index)
 * Slots: default (label), start (leading icon), end (trailing content)
 * Internal events: core-menuitem-click (bubbles, composed)
 *
 * Note: `disabled`, `has-submenu`, and `value` use manual getter/setter pairs
 * that call setAttribute/removeAttribute synchronously rather than Lit's async
 * `@property({ reflect: true })`. This keeps attribute state coherent
 * immediately after property assignment — important for the parent `<core-menu>`
 * which reads these attributes during slotchange without an intervening microtask.
 * Mirrors the v0.4 CoreTab pattern.
 */
@customElement('core-menuitem')
export class CoreMenuitem extends LitElement {
  protected override createRenderRoot() {
    return this;
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get hasSubmenu(): boolean {
    return this.hasAttribute('has-submenu');
  }
  set hasSubmenu(value: boolean) {
    if (value) {
      this.setAttribute('has-submenu', '');
    } else {
      this.removeAttribute('has-submenu');
    }
  }

  get value(): string {
    return this.getAttribute('value') ?? this.textContent?.trim() ?? '';
  }
  set value(v: string) {
    if (v) {
      this.setAttribute('value', v);
    } else {
      this.removeAttribute('value');
    }
  }

  get selected(): boolean {
    return this.hasAttribute('data-focused');
  }

  get index(): number {
    const i = parseInt(this.dataset['menuitemIndex'] ?? '-1', 10);
    return isNaN(i) ? -1 : i;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._onClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onClick);
  }

  private _onClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('core-menuitem-click', {
      bubbles: true,
      composed: true,
      detail: { item: this },
    }));
  };

  override render(): undefined {
    return undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-menuitem': CoreMenuitem;
  }
}

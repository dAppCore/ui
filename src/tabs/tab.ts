// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * `<core-tab>` — light-DOM trigger for `<core-tabs>`.
 *
 * Never renders its own shadow root — children pass through to consumer's DOM.
 * The parent `<core-tabs>` reads this element's attributes and sets ARIA
 * properties (`role`, `aria-selected`, `aria-controls`, `aria-disabled`,
 * `tabindex`) and the `selected` + `index` read-only properties after
 * slotchange pairing resolution.
 *
 * Click handler dispatches `core-tab-click` (internal, bubbles, composed)
 * so the parent can own selection logic. Disabled tabs suppress the event.
 *
 *   <core-tab for="general">General</core-tab>
 *   <core-tab for="billing" disabled>Billing</core-tab>
 *
 * Attributes (reflected): for, disabled
 * Properties (read-only, set by parent): selected, index
 * Internal events: core-tab-click (bubbles, composed)
 *
 * Note: `for` and `disabled` use manual getter/setter pairs that call
 * setAttribute/removeAttribute synchronously rather than Lit's async
 * `@property({ reflect: true })`. This keeps attribute state coherent
 * immediately after property assignment — important for the parent
 * `<core-tabs>` which reads these attributes during slotchange without
 * an intervening microtask.
 */
@customElement('core-tab')
export class CoreTab extends LitElement {
  // Light DOM — no shadow root.
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Explicit pairing: matches a `<core-tabpanel id="...">`.
   * Reflected synchronously via manual getter/setter.
   */
  get for(): string {
    return this.getAttribute('for') ?? '';
  }
  set for(value: string) {
    if (value) {
      this.setAttribute('for', value);
    } else {
      this.removeAttribute('for');
    }
  }

  /**
   * Non-interactive when true. Parent sets `aria-disabled` and skips in nav.
   * Reflected synchronously via manual getter/setter.
   */
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

  /**
   * Whether this tab is the currently active tab.
   * Read-only — set by the parent `<core-tabs>` after pairing.
   * The parent also reflects `aria-selected` from this value.
   */
  get selected(): boolean {
    return this.getAttribute('aria-selected') === 'true';
  }

  /**
   * Slot position within the tablist (raw, including disabled siblings).
   * Read-only — set by the parent `<core-tabs>` after pairing.
   */
  get index(): number {
    const i = parseInt(this.dataset['tabIndex'] ?? '-1', 10);
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
    this.dispatchEvent(new CustomEvent('core-tab-click', {
      bubbles: true,
      composed: true,
      detail: { tab: this },
    }));
  };

  override render(): undefined {
    return undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-tab': CoreTab;
  }
}

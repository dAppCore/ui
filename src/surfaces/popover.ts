// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreAnchoredElement } from './_shared/anchored-element';

/**
 * `<core-popover>` — anchored floating panel.
 *
 *   <core-button id="more-btn">More</core-button>
 *   <core-popover anchor="#more-btn" placement="bottom-start" offset="8">
 *     <core-menu>
 *       <core-menu-item>Edit</core-menu-item>
 *       <core-menu-item>Delete</core-menu-item>
 *     </core-menu>
 *   </core-popover>
 *
 * Attributes (reflected):
 *   open         boolean
 *   anchor       CSS selector string
 *   placement    12-value enum (default 'bottom')
 *   offset       px integer (default 4)
 *   closedby     'any'|'closerequest'|'none' (default 'any')
 *   autofocus    boolean (default false) — focuses first focusable on open
 *
 * Properties: anchorElement: HTMLElement | null (programmatic anchor)
 * Methods: show(), hide(), toggle()
 * Events: core-popover-open, core-popover-close
 * Slots: default
 * Parts: popover
 * Vars: --core-popover-bg, --core-popover-shadow, --core-popover-radius,
 *       --core-popover-padding
 */
@customElement('core-popover')
export class CorePopover extends CoreAnchoredElement {
  // autofocus is a native HTMLElement field; we use override to shadow it
  // with a Lit-managed property. useDefineForClassFields: false in tsconfig
  // ensures the decorator wins over the class field definition.
  @property({ type: Boolean, reflect: true }) override autofocus = false;

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: var(--core-overlay-z-index, 100);
      --core-popover-bg: var(--core-ink-1, #fff);
      --core-popover-shadow: var(--core-shadow-2);
      --core-popover-radius: var(--core-radius-md, 8px);
      --core-popover-padding: 8px;
    }
    :host([data-state="opening"]),
    :host([data-state="open"]),
    :host([data-state="closing"]) {
      display: block;
    }
    :host([data-state="opening"]) { opacity: 0; }
    :host([data-state="open"]) {
      opacity: 1;
      transition: opacity var(--core-overlay-duration, 200ms) var(--core-overlay-easing, cubic-bezier(0.4,0,0.2,1));
    }
    :host([data-state="closing"]) { pointer-events: none; }
    @media (prefers-reduced-motion: reduce) {
      :host { transition: none !important; }
    }
    [part="popover"] {
      background: var(--core-popover-bg);
      border-radius: var(--core-popover-radius);
      box-shadow: var(--core-popover-shadow);
      padding: var(--core-popover-padding);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('core-anchored-open', this._onAnchoredOpen);
    this.addEventListener('core-anchored-close', this._onAnchoredClose);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('core-anchored-open', this._onAnchoredOpen);
    this.removeEventListener('core-anchored-close', this._onAnchoredClose);
  }

  private _onAnchoredOpen = (): void => {
    if (this.autofocus) {
      const focusable = this.shadowRoot?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
    this.dispatchEvent(new CustomEvent('core-popover-open', { bubbles: true, composed: true }));
  };

  private _onAnchoredClose = (): void => {
    this.dispatchEvent(new CustomEvent('core-popover-close', { bubbles: true, composed: true }));
  };

  override render() {
    return html`<div part="popover"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-popover': CorePopover;
  }
}

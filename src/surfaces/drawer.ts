// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreOverlayElement } from './_shared/overlay-element';

export type DrawerSide = 'start' | 'end' | 'top' | 'bottom';

/**
 * `<core-drawer>` — edge-attached panel overlay.
 *
 *   <core-drawer modal side="end" closedby="any">
 *     <h2 slot="header">Cart (3 items)</h2>
 *     <core-list>…</core-list>
 *     <div slot="footer"><core-button>Checkout</core-button></div>
 *   </core-drawer>
 *
 * Attributes (reflected):
 *   open          boolean
 *   modal         boolean — default true
 *   side          'start'|'end'|'top'|'bottom' — default 'end'
 *   closedby      'any'|'closerequest'|'none' — default 'any'
 *
 * Methods: show(), showModal(), close(returnValue?), toggle()
 * Properties: returnValue: string
 * Events: core-drawer-open, core-drawer-close (detail: { returnValue }), core-drawer-cancel (cancelable)
 * Slots: default (body), header, footer
 * Parts: drawer, header, body, footer
 * Vars: --core-drawer-width, --core-drawer-height, --core-drawer-bg,
 *       --core-drawer-radius, --core-drawer-shadow, --core-drawer-padding
 *
 * Logical sides respect writing direction: `start` = inline-start
 * (left in LTR, right in RTL), `end` = inline-end.
 */
@customElement('core-drawer')
export class CoreDrawer extends CoreOverlayElement {
  @property({ reflect: true }) side: DrawerSide = 'end';

  // Override base default closedby from "closerequest" to "any" for drawers.
  override closedby: 'any' | 'closerequest' | 'none' = 'any';

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      inset: 0;
      z-index: var(--core-overlay-z-index, 100);
      background: var(--core-overlay-backdrop, oklch(0% 0 0 / 0.5));
      --core-drawer-width: 380px;
      --core-drawer-height: 50vh;
      --core-drawer-bg: var(--core-ink-1, #fff);
      --core-drawer-radius: 0;
      --core-drawer-shadow: var(--core-shadow-3);
      --core-drawer-padding: 24px;
    }
    :host([data-state="opening"]),
    :host([data-state="open"]),
    :host([data-state="closing"]) {
      display: flex;
    }
    :host([side="end"])    { justify-content: flex-end;   align-items: stretch; }
    :host([side="start"])  { justify-content: flex-start;  align-items: stretch; }
    :host([side="top"])    { align-items: flex-start;     justify-content: stretch; flex-direction: column; }
    :host([side="bottom"]) { align-items: flex-end;       justify-content: stretch; flex-direction: column; }
    :host([data-state="closing"]) { pointer-events: none; }

    [part="drawer"] {
      display: flex;
      flex-direction: column;
      background: var(--core-drawer-bg);
      border-radius: var(--core-drawer-radius);
      box-shadow: var(--core-drawer-shadow);
      overflow: hidden;
      width: var(--core-drawer-width);
      height: 100%;
    }
    :host([side="top"]) [part="drawer"],
    :host([side="bottom"]) [part="drawer"] {
      width: 100%;
      height: var(--core-drawer-height);
    }

    :host([side="end"][data-state="opening"]) [part="drawer"]    { transform: translateX(100%); }
    :host([side="start"][data-state="opening"]) [part="drawer"]  { transform: translateX(-100%); }
    :host([side="top"][data-state="opening"]) [part="drawer"]    { transform: translateY(-100%); }
    :host([side="bottom"][data-state="opening"]) [part="drawer"] { transform: translateY(100%); }
    :host([data-state="open"]) [part="drawer"] {
      transform: none;
      transition: transform var(--core-overlay-duration, 200ms) var(--core-overlay-easing, cubic-bezier(0.4,0,0.2,1));
    }
    :host([data-state="closing"]) [part="drawer"] {
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      [part="drawer"] { transition: none !important; }
    }

    [part="header"] {
      padding: var(--core-drawer-padding);
      padding-bottom: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    [part="header"]:not(:has(slot[name="header"] *)) { display: none; }
    [part="body"] {
      padding: var(--core-drawer-padding);
      flex: 1;
      overflow-y: auto;
    }
    [part="footer"] {
      padding: var(--core-drawer-padding);
      padding-top: 0;
    }
    [part="footer"]:not(:has(slot[name="footer"] *)) { display: none; }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'dialog');
    this.addEventListener('core-overlay-open', this._onOverlayOpen);
    this.addEventListener('core-overlay-close', this._onOverlayClose);
    this.addEventListener('core-overlay-cancel', this._onOverlayCancel);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('core-overlay-open', this._onOverlayOpen);
    this.removeEventListener('core-overlay-close', this._onOverlayClose);
    this.removeEventListener('core-overlay-cancel', this._onOverlayCancel);
  }

  private _onOverlayOpen = (): void => {
    this.setAttribute('aria-modal', String(this.modal));
    this.dispatchEvent(new CustomEvent('core-drawer-open', { bubbles: true, composed: true }));
  };

  private _onOverlayClose = (ev: Event): void => {
    this.removeAttribute('aria-modal'); // clean up before dispatching
    const detail = (ev as CustomEvent).detail ?? {};
    this.dispatchEvent(new CustomEvent('core-drawer-close', {
      bubbles: true,
      composed: true,
      detail: { returnValue: detail.returnValue ?? this.returnValue },
    }));
  };

  private _onOverlayCancel = (ev: Event): void => {
    const cancel = new CustomEvent('core-drawer-cancel', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(cancel);
    if (cancel.defaultPrevented) {
      ev.preventDefault();
    }
  };

  override render() {
    return html`
      <div part="drawer">
        <div part="header"><slot name="header"></slot></div>
        <div part="body"><slot></slot></div>
        <div part="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-drawer': CoreDrawer;
  }
}

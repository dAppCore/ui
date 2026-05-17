// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreOverlayElement } from './_shared/overlay-element';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * `<core-dialog>` — modal or non-modal dialog surface.
 *
 *   <core-dialog modal size="md" closedby="closerequest">
 *     <h2 slot="header">Confirm deletion</h2>
 *     <p>This action cannot be undone.</p>
 *     <div slot="footer">
 *       <core-button onclick="this.closest('core-dialog').close('cancel')">Cancel</core-button>
 *       <core-button onclick="this.closest('core-dialog').close('confirm')">Delete</core-button>
 *     </div>
 *   </core-dialog>
 *
 * Attributes (reflected):
 *   open          boolean — drives state machine
 *   modal         boolean — default true; false = non-modal
 *   size          'sm'|'md'|'lg'|'xl'|'full' — default 'md'
 *   closedby      'any'|'closerequest'|'none' — default 'closerequest'
 *
 * Methods: show(), showModal(), close(returnValue?), toggle()
 * Properties: returnValue: string
 * Events:
 *   core-dialog-open    — fired when data-state reaches "open"
 *   core-dialog-close   — fired when data-state reaches "closed" (detail: { returnValue })
 *   core-dialog-cancel  — cancellable; fired on ESC before close
 * Slots: default (body), header, footer
 * Parts: dialog, header, body, footer
 * Vars: --core-dialog-width-{sm,md,lg,xl,full}, --core-dialog-radius,
 *       --core-dialog-padding, --core-dialog-bg, --core-dialog-shadow
 */
@customElement('core-dialog')
export class CoreDialog extends CoreOverlayElement {
  @property({ reflect: true }) size: DialogSize = 'md';

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      inset: 0;
      align-items: center;
      justify-content: center;
      z-index: var(--core-overlay-z-index, 100);
      background: var(--core-overlay-backdrop, oklch(0% 0 0 / 0.5));
      --core-dialog-width-sm:   360px;
      --core-dialog-width-md:   540px;
      --core-dialog-width-lg:   720px;
      --core-dialog-width-xl:   960px;
      --core-dialog-width-full: 100%;
      --core-dialog-radius: var(--core-radius-lg, 12px);
      --core-dialog-padding: 24px;
      --core-dialog-bg: var(--core-ink-1, #fff);
      --core-dialog-shadow: var(--core-shadow-3);
    }
    :host([data-state="opening"]),
    :host([data-state="open"]),
    :host([data-state="closing"]) {
      display: flex;
    }
    :host([data-state="closing"]) { pointer-events: none; }
    :host([data-state="opening"]) { opacity: 0; }
    :host([data-state="open"]) {
      opacity: 1;
      transition: opacity var(--core-overlay-duration, 200ms) var(--core-overlay-easing, cubic-bezier(0.4,0,0.2,1));
    }
    @media (prefers-reduced-motion: reduce) {
      :host { transition: none !important; }
    }
    [part="dialog"] {
      position: relative;
      display: flex;
      flex-direction: column;
      width: var(--core-dialog-width-md);
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 48px);
      background: var(--core-dialog-bg);
      border-radius: var(--core-dialog-radius);
      box-shadow: var(--core-dialog-shadow);
      overflow: hidden;
    }
    :host([size="sm"]) [part="dialog"] { width: var(--core-dialog-width-sm); }
    :host([size="lg"]) [part="dialog"] { width: var(--core-dialog-width-lg); }
    :host([size="xl"]) [part="dialog"] { width: var(--core-dialog-width-xl); }
    :host([size="full"]) [part="dialog"] {
      width: var(--core-dialog-width-full);
      max-width: none;
      height: 100%;
      max-height: none;
      border-radius: 0;
    }
    [part="header"] {
      padding: var(--core-dialog-padding);
      padding-bottom: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    [part="header"]:not(:has(slot[name="header"] *)) { display: none; }
    [part="body"] {
      padding: var(--core-dialog-padding);
      flex: 1;
      overflow-y: auto;
    }
    [part="footer"] {
      padding: var(--core-dialog-padding);
      padding-top: 0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
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
    this.dispatchEvent(new CustomEvent('core-dialog-open', { bubbles: true, composed: true }));
  };

  private _onOverlayClose = (ev: Event): void => {
    const detail = (ev as CustomEvent).detail ?? {};
    this.dispatchEvent(new CustomEvent('core-dialog-close', {
      bubbles: true,
      composed: true,
      detail: { returnValue: detail.returnValue ?? this.returnValue },
    }));
  };

  private _onOverlayCancel = (ev: Event): void => {
    const cancel = new CustomEvent('core-dialog-cancel', {
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
      <div part="dialog" role="document">
        <div part="header"><slot name="header"></slot></div>
        <div part="body"><slot></slot></div>
        <div part="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-dialog': CoreDialog;
  }
}

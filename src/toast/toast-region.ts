// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { CoreToast } from './toast';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * `<core-toast-region>` — Shadow DOM container for stacked toasts.
 *
 *   <core-toast-region position="bottom-center">
 *     <core-toast severity="info">Hello</core-toast>
 *   </core-toast-region>
 *
 * Attributes (manual sync getter/setter):
 *   position: 6 corners (default 'top-right')
 *
 * Properties (read-only):
 *   toasts: CoreToast[]   — current slotted <core-toast> children
 *   toastCount: number
 *
 * Methods:
 *   addToast(toast: CoreToast): void    — append + call show()
 *   removeToast(toast: CoreToast): void — call toast.close()
 *   clear(): void                       — close all toasts
 *
 * Slots: default — accepts <core-toast> children
 * Parts: region
 * ARIA: role="region" + aria-label="Notifications"
 *
 * Child observation: slotchange (primary) + MutationObserver (backup).
 * Array.from(this.children).filter(...) — avoids :scope > (v0.4 T4 pattern).
 * Sets --core-toast-slide-from CSS variable per position via :host([position]) rules.
 */
@customElement('core-toast-region')
export class CoreToastRegion extends LitElement {

  // ── Reflected attributes (manual sync) ───────────────────────────────────

  get position(): ToastPosition {
    return (this.getAttribute('position') as ToastPosition) ?? 'top-right';
  }
  set position(value: ToastPosition) {
    this.setAttribute('position', value);
  }

  // ── Internal state ───────────────────────────────────────────────────────

  private _slotObserver: MutationObserver | null = null;

  // ── Styles ───────────────────────────────────────────────────────────────

  static override styles = css`
    :host {
      position: fixed;
      z-index: var(--core-overlay-z-index, 100);
      display: flex;
      flex-direction: column;
      gap: var(--core-toast-region-gap, 8px);
      pointer-events: none;
      margin: var(--core-toast-region-margin, 16px);
    }

    :host([position="top-left"]) {
      top: 0;
      left: 0;
      --core-toast-slide-from: -20px;
    }
    :host([position="top-center"]) {
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      --core-toast-slide-from: -20px;
    }
    :host([position="top-right"]) {
      top: 0;
      right: 0;
      --core-toast-slide-from: -20px;
    }
    :host([position="bottom-left"]) {
      bottom: 0;
      left: 0;
      flex-direction: column-reverse;
      --core-toast-slide-from: 20px;
    }
    :host([position="bottom-center"]) {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      flex-direction: column-reverse;
      --core-toast-slide-from: 20px;
    }
    :host([position="bottom-right"]) {
      bottom: 0;
      right: 0;
      flex-direction: column-reverse;
      --core-toast-slide-from: 20px;
    }

    ::slotted(core-toast) {
      transition: transform var(--core-overlay-duration, 200ms) var(--core-overlay-easing, cubic-bezier(0.4, 0, 0.2, 1));
    }
  `;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'region');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Notifications');
    }
    if (!this.hasAttribute('position')) {
      this.setAttribute('position', 'top-right');
    }
    this._slotObserver = new MutationObserver(() => this._syncToasts());
    this._slotObserver.observe(this, { childList: true, subtree: false });
    queueMicrotask(() => this._syncToasts());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._slotObserver?.disconnect();
    this._slotObserver = null;
  }

  override firstUpdated(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => this._syncToasts());
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    return html`
      <div part="region">
        <slot></slot>
      </div>
    `;
  }

  // ── Public API ───────────────────────────────────────────────────────────

  get toasts(): CoreToast[] {
    return Array.from(this.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-toast',
    ) as CoreToast[];
  }

  get toastCount(): number {
    return this.toasts.length;
  }

  addToast(toast: CoreToast): void {
    this.appendChild(toast);
    toast.show();
  }

  removeToast(toast: CoreToast): void {
    toast.close();
  }

  clear(): void {
    // Copy array before iterating — close() removes from DOM, mutating the list
    const toasts = this.toasts.slice();
    toasts.forEach((t) => t.close());
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private _syncToasts(): void {
    // No-op presently — toasts getter is live. Hook reserved for future
    // ordered animation coordination (v0.10.1 scope).
    void 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-toast-region': CoreToastRegion;
  }
}

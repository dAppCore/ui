// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreAnchoredElement } from './_shared/anchored-element';

let _tooltipUid = 0;

/**
 * `<core-tooltip>` — hover/focus-triggered descriptor tooltip.
 *
 *   <core-button id="save-btn"><core-icon name="save"/></core-button>
 *   <core-tooltip anchor="#save-btn" placement="top" delay-in="700">
 *     Save (⌘S)
 *   </core-tooltip>
 *
 * Attributes (reflected):
 *   anchor       CSS selector string
 *   placement    12-value enum (default 'top')
 *   offset       px integer (default 6)
 *   delay-in     ms (default 700) — hover delay before show
 *   delay-out    ms (default 0) — delay after hover-out before hide
 *
 * Properties: anchorElement: HTMLElement | null
 * Methods: show(), hide() — programmatic, bypasses delay
 * Events: core-tooltip-open, core-tooltip-close
 * Slots: default (tooltip content)
 * Parts: tooltip
 *
 * Auto-binding:
 *   On connect: resolves anchorElement, attaches mouseenter/focusin/
 *   mouseleave/focusout listeners on anchor. aria-describedby is set
 *   on the anchor to include this tooltip's id (previous value preserved
 *   and restored on disconnect).
 *
 * Never autofocuses — tooltips describe content; stealing focus is
 * hostile and violates WCAG 2.4.3.
 */
@customElement('core-tooltip')
export class CoreTooltip extends CoreAnchoredElement {
  @property({ type: Number, attribute: 'delay-in' }) delayIn = 700;
  @property({ type: Number, attribute: 'delay-out' }) delayOut = 0;

  // Override base defaults for tooltip.
  override placement = 'top' as const;
  override offset = 6;

  private _showTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;
  private _boundAnchor: HTMLElement | null = null;
  private _prevDescribedby: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.id) {
      this.id = `core-tooltip-${++_tooltipUid}`;
    }
    this.setAttribute('role', 'tooltip');
    this.addEventListener('core-anchored-open', this._onAnchoredOpen);
    this.addEventListener('core-anchored-close', this._onAnchoredClose);
    Promise.resolve().then(() => this._bindAnchor());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearTimers();
    this._unbindAnchor();
    this.removeEventListener('core-anchored-open', this._onAnchoredOpen);
    this.removeEventListener('core-anchored-close', this._onAnchoredClose);
  }

  private _bindAnchor(): void {
    const target = this.anchorElement;
    if (!target || target === this._boundAnchor) return;
    this._unbindAnchor();
    this._boundAnchor = target;

    const existing = target.getAttribute('aria-describedby');
    this._prevDescribedby = existing;
    const ids = existing ? `${existing} ${this.id}` : this.id;
    target.setAttribute('aria-describedby', ids);

    target.addEventListener('mouseenter', this._onMouseEnter);
    target.addEventListener('mouseleave', this._onMouseLeave);
    target.addEventListener('focusin', this._onFocusIn);
    target.addEventListener('focusout', this._onFocusOut);
  }

  private _unbindAnchor(): void {
    const target = this._boundAnchor;
    if (!target) return;

    if (this._prevDescribedby !== null) {
      target.setAttribute('aria-describedby', this._prevDescribedby);
    } else {
      const current = target.getAttribute('aria-describedby') ?? '';
      const updated = current
        .split(' ')
        .filter((id) => id !== this.id)
        .join(' ')
        .trim();
      if (updated) {
        target.setAttribute('aria-describedby', updated);
      } else {
        target.removeAttribute('aria-describedby');
      }
    }
    this._prevDescribedby = null;

    target.removeEventListener('mouseenter', this._onMouseEnter);
    target.removeEventListener('mouseleave', this._onMouseLeave);
    target.removeEventListener('focusin', this._onFocusIn);
    target.removeEventListener('focusout', this._onFocusOut);
    this._boundAnchor = null;
  }

  private _onMouseEnter = (): void => {
    this._clearHideTimer();
    if (this.delayIn > 0) {
      this._showTimer = setTimeout(() => this.show(), this.delayIn);
    } else {
      this.show();
    }
  };

  private _onMouseLeave = (): void => {
    this._clearShowTimer();
    if (this.delayOut > 0) {
      this._hideTimer = setTimeout(() => this.hide(), this.delayOut);
    } else {
      this.hide();
    }
  };

  private _onFocusIn = (): void => {
    this._clearHideTimer();
    this.show();
  };

  private _onFocusOut = (): void => {
    this._clearShowTimer();
    this.hide();
  };

  private _clearShowTimer(): void {
    if (this._showTimer !== null) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
  }

  private _clearHideTimer(): void {
    if (this._hideTimer !== null) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  private _clearTimers(): void {
    this._clearShowTimer();
    this._clearHideTimer();
  }

  private _onAnchoredOpen = (): void => {
    this.dispatchEvent(new CustomEvent('core-tooltip-open', { bubbles: true, composed: true }));
  };

  private _onAnchoredClose = (): void => {
    this.dispatchEvent(new CustomEvent('core-tooltip-close', { bubbles: true, composed: true }));
  };

  static override styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: calc(var(--core-overlay-z-index, 100) + 1);
      pointer-events: none;
      --core-tooltip-bg: var(--core-tooltip-bg, oklch(15% 0 0));
      --core-tooltip-fg: var(--core-tooltip-fg, oklch(98% 0 0));
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
    [part="tooltip"] {
      background: var(--core-tooltip-bg);
      color: var(--core-tooltip-fg);
      border-radius: var(--core-radius-sm, 6px);
      padding: 4px 8px;
      font-size: 13px;
      line-height: 1.4;
      white-space: nowrap;
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;

  override render() {
    return html`<div part="tooltip"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-tooltip': CoreTooltip;
  }
}

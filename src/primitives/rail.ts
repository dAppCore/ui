// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

/**
 * `<core-rail>` — sidebar / navigation item with active state, badge slot,
 * and anchor-or-button activation.
 *
 *   <core-rail href="/dashboard" active>Dashboard</core-rail>
 *
 *   <core-rail to="/settings">
 *     <core-icon slot="leading" name="search" decorative></core-icon>
 *     Settings
 *     <core-pill slot="trailing" size="sm" state="brand">3</core-pill>
 *   </core-rail>
 *
 * Attributes (reflected):
 *   active    boolean
 *   disabled  boolean
 *   href      string — renders inner <a href>
 *   to        string — emits `core-rail-navigate` event with detail.to on activation
 *
 * Slots: default (label), 'leading' (icon), 'trailing' (badge or chevron)
 * Parts: base, label, icon-leading, icon-trailing
 * Events: core-rail-navigate (bubbles, composed) when `to` set and activated
 * Vars:  --core-rail-{height, padding-x, radius, bg, bg-active, bg-hover,
 *                     fg, fg-active}
 */
@customElement('core-rail')
export class CoreRail extends CoreElement {
  @property({ reflect: true, type: Boolean }) active = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true }) href = '';
  @property({ reflect: true }) to = '';

  private _onActivate = (ev: Event): void => {
    if (this.disabled) {
      ev.preventDefault();
      return;
    }
    if (!this.to) return;
    ev.preventDefault();
    this.dispatchEvent(new CustomEvent('core-rail-navigate', {
      bubbles: true,
      composed: true,
      detail: { to: this.to },
    }));
  };

  private _onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    if (this.disabled) return;
    if (!this.to && !this.href) return;
    ev.preventDefault();
    if (this.to) {
      this.dispatchEvent(new CustomEvent('core-rail-navigate', {
        bubbles: true,
        composed: true,
        detail: { to: this.to },
      }));
    } else {
      // href mode: let the anchor click natively
      (this.querySelector('[part="base"]') as HTMLAnchorElement)?.click();
    }
  };

  override render() {
    const inner = html`
      <span part="icon-leading"><slot name="leading"></slot></span>
      <span part="label"><slot></slot></span>
      <span part="icon-trailing"><slot name="trailing"></slot></span>
    `;
    if (this.href) {
      return html`
        <a
          part="base"
          href=${this.href}
          ?aria-current=${this.active ? 'page' : nothing}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          @click=${this._onActivate}
          @keydown=${this._onKeyDown}
        >${inner}</a>
      `;
    }
    return html`
      <button
        part="base"
        type="button"
        ?disabled=${this.disabled}
        aria-pressed=${this.active ? 'true' : 'false'}
        @click=${this._onActivate}
        @keydown=${this._onKeyDown}
      >${inner}</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-rail': CoreRail;
  }
}

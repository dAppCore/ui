// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-card.ts (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

export type CardElevation = 'flat' | 'raised' | 'floating';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * `<core-card>` — surface primitive with elevation + padding controls
 * and optional header/footer/media slots. Set `interactive` to make the
 * card focusable and activatable (Enter/Space → click).
 *
 *   <core-card elevation="raised" padding="md" interactive>
 *     <div slot="media"><img src="..."></div>
 *     <h3 slot="header">Title</h3>
 *     Body copy...
 *     <div slot="footer"><core-button>Action</core-button></div>
 *   </core-card>
 */
@customElement('core-card')
export class CoreCard extends CoreElement {
  @property({ reflect: true }) elevation: CardElevation = 'flat';
  @property({ reflect: true }) padding: CardPadding = 'md';
  @property({ reflect: true, type: Boolean }) interactive = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._syncTabIndex();
    this.addEventListener('keydown', this._onKeyDown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('interactive')) this._syncTabIndex();
  }

  private _syncTabIndex(): void {
    if (this.interactive) this.tabIndex = 0;
    else if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
  }

  private _onKeyDown = (ev: KeyboardEvent): void => {
    if (!this.interactive) return;
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    // If the keydown originated inside a nested interactive (<a>, <button>,
    // <core-button>), let it handle its own activation.
    const target = ev.target as Element | null;
    if (target && target !== this && target.closest('a,button,[role="button"]')) return;
    ev.preventDefault();
    this.click();
  };

  override render() {
    return html`
      <div part="base">
        <div part="media"><slot name="media"></slot></div>
        <div part="header"><slot name="header"></slot></div>
        <div part="body"><slot></slot></div>
        <div part="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-card': CoreCard;
  }
}

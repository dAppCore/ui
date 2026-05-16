// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-status-dot.ts (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

export type StatusDotState = 'good' | 'warn' | 'bad' | 'info' | 'neutral';
export type StatusDotSize = 'sm' | 'md' | 'lg';

/**
 * `<core-status-dot>` — a small coloured indicator for surfacing state.
 *
 * Attributes (reflected):
 *   state    'good' | 'warn' | 'bad' | 'info' | 'neutral'  (default 'neutral')
 *   size     'sm' | 'md' | 'lg'                            (default 'md')
 *   pulse    boolean — animated pulsing ring
 *
 * Parts: base, indicator
 * Vars:  --core-status-dot-{size, fill, pulse-duration}
 *
 *   <core-status-dot state="good" size="md" pulse></core-status-dot>
 */
@customElement('core-status-dot')
export class CoreStatusDot extends CoreElement {
  @property({ reflect: true }) state: StatusDotState = 'neutral';
  @property({ reflect: true }) size: StatusDotSize = 'md';
  @property({ reflect: true, type: Boolean }) pulse = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'status');
  }

  override render() {
    return html`
      <span part="base">
        <span part="indicator"></span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-status-dot': CoreStatusDot;
  }
}

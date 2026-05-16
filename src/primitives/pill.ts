// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-pill.ts (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

export type PillState =
  | 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type PillSize = 'sm' | 'md';

/**
 * `<core-pill>` — small inline label with state colour. Use for tags,
 * badges, counters, status chips.
 *
 * Attributes (reflected):
 *   state  'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'  (default 'neutral')
 *   size   'sm' | 'md'                                                       (default 'md')
 *
 * Slots: default (text), 'leading' (icon), 'trailing' (icon or counter)
 * Parts: base, label, icon-leading, icon-trailing
 * Vars:  --core-pill-{height, padding-x, radius, bg, fg, border-color, font-size}
 *
 *   <core-pill state="success">
 *     <core-icon slot="leading" name="check" decorative></core-icon>
 *     Active
 *   </core-pill>
 */
@customElement('core-pill')
export class CorePill extends CoreElement {
  @property({ reflect: true }) state: PillState = 'neutral';
  @property({ reflect: true }) size: PillSize = 'md';

  override render() {
    return html`
      <span part="base">
        <span part="icon-leading"><slot name="leading"></slot></span>
        <span part="label"><slot></slot></span>
        <span part="icon-trailing"><slot name="trailing"></slot></span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-pill': CorePill;
  }
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

export type LabelSize = 'sm' | 'md' | 'lg';

/**
 * `<core-label>` — label primitive wrapping a real `<label>` element for
 * native HTML labelling semantics. Supports `for` association and an
 * optional required-indicator (`*`).
 *
 * Attributes (reflected):
 *   for       string — id of the associated form control
 *   required  boolean — adds a `*` required indicator
 *   size      'sm' | 'md' | 'lg' (default 'md')
 *
 * Slots: default (label text)
 * Parts: base, required-indicator
 * Vars:  --core-label-{font-size, fg, gap, required-color}
 *
 *   <core-label for="email" required>Email</core-label>
 *   <input id="email" type="email">
 */
@customElement('core-label')
export class CoreLabel extends CoreElement {
  @property({ reflect: true }) for = '';
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true }) size: LabelSize = 'md';

  override render() {
    return html`
      <label part="base" for=${this.for}>
        <slot></slot>
        ${this.required ? html`<span part="required-indicator" aria-hidden="true">*</span>` : null}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-label': CoreLabel;
  }
}

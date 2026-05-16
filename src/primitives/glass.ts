// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/mac-window.ts MacGlass class (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

/**
 * `<core-glass>` — frosted-surface primitive using `backdrop-filter: blur(...)`
 * and a tinted overlay. Falls back to opaque background where backdrop-filter
 * isn't supported (via @supports query in glass.css).
 *
 * Attributes (reflected):
 *   dark    boolean — switches between light + dark tint
 *   radius  <length> — corner radius (default: var(--core-radius-lg))
 *
 * Slots: default
 * Parts: base, layer-blur, layer-tint
 * Vars:  --core-glass-{radius, blur, tint, tint-dark, tint-fallback, border-color}
 *
 *   <core-glass dark radius="20px">
 *     <div class="content">Floating panel</div>
 *   </core-glass>
 */
@customElement('core-glass')
export class CoreGlass extends CoreElement {
  @property({ reflect: true, type: Boolean }) dark = false;
  @property({ reflect: true }) radius = '';

  override render() {
    const radiusStyle = this.radius ? `--core-glass-radius: ${this.radius};` : '';
    return html`
      <div part="base" style=${radiusStyle}>
        <div part="layer-blur"></div>
        <div part="layer-tint"></div>
        <div part="content"><slot></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-glass': CoreGlass;
  }
}

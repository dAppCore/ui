// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-icon.ts (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { CoreElement } from './_shared/light-dom';
import { getIcon } from './icons/registry';
import { registerDefaultIcons } from './icons/defaults';

// Side-effect: register the 12 default icons when this module loads.
// Trade-off: defeats tree-shaking of unused defaults (~2KB gzipped for
// the full set). Consumers who want only their own icons can import
// registerIcon directly from './icons/registry' and skip this module.
registerDefaultIcons();

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;

// One warn per missing name across the session.
const warnedNames = new Set<string>();

/**
 * `<core-icon>` — registry-driven icon primitive with slot escape hatch.
 *
 *   <core-icon name="check"></core-icon>
 *   <core-icon name="search" size="lg"></core-icon>
 *   <core-icon decorative name="chevron-down"></core-icon>
 *   <core-icon><svg>...</svg></core-icon>                <!-- one-off via slot -->
 *
 * Attributes (reflected):
 *   name        registered icon key
 *   size        'xs'|'sm'|'md'|'lg'|'xl' or any length (default 'md')
 *   decorative  boolean — applies aria-hidden="true"
 *
 * Parts: base
 * Vars:  --core-icon-{size, color}
 */
@customElement('core-icon')
export class CoreIcon extends CoreElement {
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) size: IconSize = 'md';
  @property({ reflect: true, type: Boolean }) decorative = false;

  override updated(changed: Map<string, unknown>): void {
    // a11y wiring on the host element (not in render template) so the
    // attributes appear directly on <core-icon>, where AT will see them.
    if (this.decorative) {
      this.setAttribute('aria-hidden', 'true');
      this.removeAttribute('aria-label');
    } else {
      this.removeAttribute('aria-hidden');
      if (!this.hasAttribute('aria-label')) {
        const entry = getIcon(this.name);
        if (entry?.title) this.setAttribute('aria-label', entry.title);
      }
    }

    // Size attribute: named sizes (xs/sm/md/lg/xl) are handled by CSS
    // attribute selectors. Arbitrary lengths (e.g. "20px") need to set
    // --core-icon-size inline so the CSS picks them up.
    if (changed.has('size')) {
      const named = ['xs', 'sm', 'md', 'lg', 'xl'];
      if (this.size && !named.includes(this.size)) {
        this.style.setProperty('--core-icon-size', this.size);
      } else {
        this.style.removeProperty('--core-icon-size');
      }
    }
  }

  private _hasSlottedSvg(): boolean {
    return Array.from(this.children).some(
      (c) => c.tagName.toLowerCase() === 'svg',
    );
  }

  override render() {
    // Slot wins: if the consumer placed an <svg> child, render only that.
    if (this._hasSlottedSvg()) {
      return html`<span part="base"><slot></slot></span>`;
    }
    const entry = getIcon(this.name);
    if (!entry) {
      if (this.name && !warnedNames.has(this.name)) {
        warnedNames.add(this.name);
        console.warn(`[core-icon] No icon registered for name "${this.name}".`);
      }
      return html`<span part="base"></span>`;
    }
    // Registry markup is consumer-controlled (via registerIcon).
    // No sanitisation: it's the consumer's responsibility to not
    // pass user-supplied SVG into the registry.
    return html`<span part="base">${unsafeHTML(entry.svg)}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-icon': CoreIcon;
  }
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * `<core-menu-separator>` — light-DOM visual divider for `<core-menu>`.
 *
 * Never renders its own shadow root — purely a semantic and visual divider.
 * The parent `<core-menu>` sets `role="separator"` and `aria-orientation`
 * after slotchange. Not focusable, not activatable — keyboard nav skips it
 * entirely. Not included in the parent's `_items: CoreMenuitem[]` array.
 *
 * Visual rendering is owned by the parent `<core-menu>` Shadow DOM CSS,
 * which targets `core-menu-separator` (or `[role="separator"]`) with
 * `border-top: 1px solid var(--core-menu-border-color); margin: 4px 0;`.
 *
 *   <core-menu-separator></core-menu-separator>
 *
 * Attributes: none (all ARIA set by parent)
 */
@customElement('core-menu-separator')
export class CoreMenuSeparator extends LitElement {
  protected override createRenderRoot() {
    return this;
  }

  override render(): undefined {
    return undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-menu-separator': CoreMenuSeparator;
  }
}

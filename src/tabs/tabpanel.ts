// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * `<core-tabpanel>` — light-DOM panel for `<core-tabs>`.
 *
 * Never renders its own shadow root — consumer content passes through.
 * The parent `<core-tabs>` reads `id`, toggles the native `hidden`
 * attribute, and sets ARIA (`role="tabpanel"`, `aria-labelledby`,
 * `tabindex="0"`) after slotchange pairing resolution.
 *
 * Consumer sets `id` for explicit pairing with `<core-tab for="...">`.
 * If absent, the parent auto-generates a stable ID
 * (`core-tabpanel-{tabsUid}-{index}`).
 *
 *   <core-tabpanel id="general">General settings here.</core-tabpanel>
 *
 * Attributes: id (standard, consumer-set), hidden (boolean, set by parent)
 * Properties (read-only, set by parent): selected, index, tabId
 */
@customElement('core-tabpanel')
export class CoreTabpanel extends LitElement {
  // Light DOM — no shadow root.
  protected override createRenderRoot() {
    return this;
  }

  /**
   * The effective ID for this panel — consumer-set `id` or auto-generated.
   * Read-only. Set by the parent `<core-tabs>` after pairing.
   */
  get tabId(): string {
    return this.id || this.dataset['panelId'] || '';
  }

  /**
   * Whether this panel is currently displayed.
   * Read-only — mirrors `aria-selected` set by the parent `<core-tabs>`.
   */
  get selected(): boolean {
    return this.getAttribute('aria-selected') === 'true';
  }

  /**
   * Slot position within the panel list (raw, including unpaired panels).
   * Read-only — set by the parent `<core-tabs>` after pairing.
   */
  get index(): number {
    const i = parseInt(this.dataset['panelIndex'] ?? '-1', 10);
    return isNaN(i) ? -1 : i;
  }

  override render(): undefined {
    return undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-tabpanel': CoreTabpanel;
  }
}

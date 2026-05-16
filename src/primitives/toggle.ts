// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-toggle.ts (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

export type ToggleSize = 'sm' | 'md' | 'lg';

/**
 * `<core-toggle>` — switch-style boolean input. role="switch", form-associated
 * via ElementInternals.
 *
 *   <core-toggle name="notify" checked>Notify me</core-toggle>
 *
 * Attributes (reflected):
 *   checked   boolean
 *   disabled  boolean
 *   name      string
 *   value     string (default 'on') — value contributed to FormData when checked
 *   size      'sm' | 'md' | 'lg'    (default 'md')
 *
 * Slots: default (label text)
 * Parts: base, track, thumb, label
 * Events: core-change (bubbles, composed) with detail: { checked }
 * Vars:  --core-toggle-{height, track-color, track-color-checked,
 *                       thumb-size, thumb-color, thumb-color-checked, radius}
 */
@customElement('core-toggle')
export class CoreToggle extends CoreElement {
  static formAssociated = true;

  @property({ reflect: true, type: Boolean }) checked = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = 'on';
  @property({ reflect: true }) size: ToggleSize = 'md';

  private _internals: ElementInternals | null;

  constructor() {
    super();
    // happy-dom (15.x) doesn't ship ElementInternals; guard so the
    // element still constructs in tests. Real browsers always have it.
    this._internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'switch');
    if (!this.hasAttribute('tabindex') && !this.disabled) this.tabIndex = 0;
    this.addEventListener('click', this._onActivate);
    this.addEventListener('keydown', this._onKeyDown);
    this._syncInternals();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onActivate);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  override updated(changed: Map<string, unknown>): void {
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');
    if (changed.has('checked') || changed.has('value') || changed.has('name')) {
      this._syncInternals();
    }
  }

  private _syncInternals(): void {
    this._internals?.setFormValue(this.checked ? this.value : null);
  }

  formResetCallback(): void {
    this.checked = false;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  private _onActivate = (ev: Event): void => {
    if (this.disabled) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      return;
    }
    this._toggle();
  };

  private _onKeyDown = (ev: KeyboardEvent): void => {
    if (this.disabled) return;
    if (ev.key !== ' ' && ev.key !== 'Enter') return;
    ev.preventDefault();
    this._toggle();
  };

  private _toggle(): void {
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('core-change', {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked },
    }));
  }

  override render() {
    return html`
      <span part="base">
        <span part="track">
          <span part="thumb"></span>
        </span>
        <span part="label"><slot></slot></span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-toggle': CoreToggle;
  }
}

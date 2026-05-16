// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-radio-group.ts (2026-05-07).
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreFormElement } from './_shared/form-element';

export type RadioSize = 'sm' | 'md' | 'lg';

/**
 * `<core-radio>` — styled radio button (dot in a circle). Matches
 * <core-toggle>'s visual language. Used as a child of
 * <core-radio-group> which manages the single-selection state.
 *
 *   <core-radio-group name="plan" value="pro">
 *     <core-radio value="free">Free</core-radio>
 *     <core-radio value="pro">Pro</core-radio>
 *     <core-radio value="enterprise">Enterprise</core-radio>
 *   </core-radio-group>
 *
 * Standalone <core-radio> (outside a group) does NOT validate or
 * contribute to a form — the group does that.
 *
 * Attributes (reflected): name, value, checked, required, disabled, size
 * Slots: default (label text)
 * Parts: base, dot, label
 * Events: core-change with detail: { checked, value }
 * Vars: --core-radio-{size, bg, border-color, dot-color, dot-color-checked,
 *                     bg-checked, border-color-checked}
 */
@customElement('core-radio')
export class CoreRadio extends CoreFormElement {
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';
  @property({ reflect: true, type: Boolean }) checked = false;
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true }) size: RadioSize = 'md';

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      --core-radio-size: 16px;
      --core-radio-bg: var(--core-ink-1, #fff);
      --core-radio-border-color: var(--core-line-2);
      --core-radio-dot-color: transparent;
      --core-radio-dot-color-checked: var(--core-fg-0, #fff);
      --core-radio-bg-checked: var(--core-brand-500);
      --core-radio-border-color-checked: var(--core-brand-500);
    }
    :host([size="sm"]) { --core-radio-size: 14px; }
    :host([size="lg"]) { --core-radio-size: 20px; }
    :host([disabled]) { cursor: not-allowed; opacity: 0.5; }
    [part="base"] {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    [part="dot"] {
      position: relative;
      width: var(--core-radio-size);
      height: var(--core-radio-size);
      background: var(--core-radio-bg);
      border: 1px solid var(--core-radio-border-color);
      border-radius: 50%;
      flex-shrink: 0;
    }
    :host([checked]) [part="dot"] {
      background: var(--core-radio-bg-checked);
      border-color: var(--core-radio-border-color-checked);
    }
    [part="dot"]::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40%;
      height: 40%;
      border-radius: 50%;
      background: var(--core-radio-dot-color);
    }
    :host([checked]) [part="dot"]::after { background: var(--core-radio-dot-color-checked); }
    input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: inherit;
    }
    [part="label"]:empty { display: none; }
  `;

  override updated(): void {
    this._setFormValue(this.checked ? this.value : null);
  }

  override formResetCallback(): void {
    this.checked = false;
    this._setFormValue(null);
  }

  private _onChange = (ev: Event): void => {
    const target = ev.target as HTMLInputElement;
    this.checked = target.checked;
    this.dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true,
      detail: { checked: this.checked, value: this.value },
    }));
  };

  override render() {
    return html`
      <span part="base">
        <span part="dot">
          <input
            type="radio"
            name=${this.name || nothing}
            .value=${this.value}
            .checked=${this.checked}
            ?required=${this.required}
            ?disabled=${this.disabled}
            @change=${this._onChange}
          />
        </span>
        <span part="label"><slot></slot></span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-radio': CoreRadio;
  }
}

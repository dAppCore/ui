// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — no upstream in core/ide.
import { html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { CoreFormElement } from './_shared/form-element';

export type CheckboxSize = 'sm' | 'md' | 'lg';

/**
 * `<core-checkbox>` — box-with-tick checkbox input. Form-associated
 * via ElementInternals; native inner <input type="checkbox"> for
 * accessibility + keyboard handling.
 *
 *   <core-checkbox name="terms" required>I accept the terms</core-checkbox>
 *
 * Different from <core-toggle> (v0.5): toggle is a switch (track +
 * thumb sliding); checkbox is a box with a tick. Semantically and
 * visually distinct.
 *
 * Attributes (reflected): name, value (default "on"), checked, indeterminate,
 *                         required, disabled, size ('sm'|'md'|'lg'; default 'md')
 *
 * Slots: default (label text), hint, error
 * Parts: base, box, tick, label, hint, error
 * Events: core-change with detail: { checked }
 * Vars: --core-checkbox-{size, bg, border-color, border-color-focus,
 *                        tick-color, bg-checked, border-color-checked, radius}
 */
@customElement('core-checkbox')
export class CoreCheckbox extends CoreFormElement {
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = 'on';
  @property({ reflect: true, type: Boolean }) checked = false;
  @property({ reflect: true, type: Boolean }) indeterminate = false;
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true }) size: CheckboxSize = 'md';

  @query('input') private _inner!: HTMLInputElement;

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      --core-checkbox-size: 16px;
      --core-checkbox-bg: var(--core-ink-1, #fff);
      --core-checkbox-border-color: var(--core-line-2);
      --core-checkbox-border-color-focus: var(--core-brand-500);
      --core-checkbox-tick-color: var(--core-fg-0, #fff);
      --core-checkbox-bg-checked: var(--core-brand-500);
      --core-checkbox-border-color-checked: var(--core-brand-500);
      --core-checkbox-radius: var(--core-radius-sm);
    }
    :host([size="sm"]) { --core-checkbox-size: 14px; }
    :host([size="lg"]) { --core-checkbox-size: 20px; }
    :host([disabled]) { cursor: not-allowed; opacity: 0.5; }
    [part="base"] {
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
    }
    [part="box"] {
      position: relative;
      width: var(--core-checkbox-size);
      height: var(--core-checkbox-size);
      background: var(--core-checkbox-bg);
      border: 1px solid var(--core-checkbox-border-color);
      border-radius: var(--core-checkbox-radius);
      flex-shrink: 0;
    }
    :host([checked]) [part="box"], :host([indeterminate]) [part="box"] {
      background: var(--core-checkbox-bg-checked);
      border-color: var(--core-checkbox-border-color-checked);
    }
    [part="tick"] {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--core-checkbox-tick-color);
      opacity: 0;
    }
    :host([checked]) [part="tick"] { opacity: 1; }
    :host([indeterminate]) [part="tick"] { opacity: 1; }
    input {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: inherit;
    }
    input:focus-visible + [part="tick"], [part="box"]:has(input:focus-visible) {
      outline: 2px solid var(--core-checkbox-border-color-focus);
      outline-offset: 2px;
    }
    [part="label"]:empty { display: none; }
    [part="hint"], [part="error"] { font-size: 12px; flex-basis: 100%; }
    [part="hint"] { color: var(--core-fg-3); }
    [part="error"] { color: var(--core-danger-500); }
    [part="hint"]:not(:has(*)), [part="error"]:not(:has(*)) { display: none; }
  `;

  override updated(): void {
    if (this._inner) {
      this._inner.indeterminate = this.indeterminate;
      this._setValidity(this._inner.validity, this._inner.validationMessage, this._inner);
    }
    this._setFormValue(this.checked ? this.value : null);
  }

  override formResetCallback(): void {
    this.checked = false;
    this.indeterminate = false;
    this._setFormValue(null);
  }

  private _onChange = (ev: Event): void => {
    const target = ev.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false; // user click clears indeterminate
    this.dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true,
      detail: { checked: this.checked },
    }));
  };

  override render() {
    return html`
      <span part="base">
        <span part="box">
          <input
            type="checkbox"
            name=${this.name || nothing}
            .value=${this.value}
            .checked=${this.checked}
            ?required=${this.required}
            ?disabled=${this.disabled}
            @change=${this._onChange}
          />
          <span part="tick" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${this.indeterminate
                ? html`<line x1="3" y1="8" x2="13" y2="8"></line>`
                : html`<polyline points="3 8.5 6.5 12 13 4.5"></polyline>`}
            </svg>
          </span>
        </span>
        <span part="label"><slot></slot></span>
        <span part="hint"><slot name="hint"></slot></span>
        <span part="error"><slot name="error"></slot></span>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-checkbox': CoreCheckbox;
  }
}

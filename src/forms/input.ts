// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-input.ts (2026-05-07).
import { html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { CoreFormElement } from './_shared/form-element';

export type InputType =
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * `<core-input>` — single-line text input with form-association, full
 * Constraint Validation, slotted hint/error, and icon-attribute support.
 *
 *   <core-input type="email" name="email" required leading-icon="search">
 *     <span slot="hint">Your work email</span>
 *     <span slot="error">Email is required</span>
 *   </core-input>
 *
 * Attributes (reflected):
 *   type           'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' (default 'text')
 *   name           string
 *   value          string
 *   placeholder    string
 *   required       boolean
 *   disabled       boolean
 *   readonly       boolean
 *   pattern        string (RegExp source)
 *   minlength      number
 *   maxlength      number
 *   min, max, step number (only meaningful for type="number")
 *   autocomplete   string
 *   leading-icon   string (looks up v0.5 icon registry)
 *   trailing-icon  string
 *   size           'sm' | 'md' | 'lg'
 *
 * Slots: 'hint', 'error'
 * Parts: base, input, leading, trailing, hint, error
 * Events: core-input + core-change (composed, bubbles) with detail: { value }
 * Vars: --core-input-{height, padding-x, font-size, bg, fg, border-color,
 *                     border-color-focus, border-color-invalid, radius,
 *                     hint-color, error-color}
 */
@customElement('core-input')
export class CoreInput extends CoreFormElement {
  @property({ reflect: true }) type: InputType = 'text';
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true, type: Boolean }) readonly = false;
  @property({ reflect: true }) pattern = '';
  @property({ reflect: true, type: Number }) minlength: number | null = null;
  @property({ reflect: true, type: Number }) maxlength: number | null = null;
  @property({ reflect: true }) min = '';
  @property({ reflect: true }) max = '';
  @property({ reflect: true }) step = '';
  @property({ reflect: true }) autocomplete = '';
  @property({ reflect: true, attribute: 'leading-icon' }) leadingIcon = '';
  @property({ reflect: true, attribute: 'trailing-icon' }) trailingIcon = '';
  @property({ reflect: true }) size: InputSize = 'md';

  @query('input') private _inner!: HTMLInputElement;

  static override styles = css`
    :host {
      display: inline-block;
      width: 100%;
      --core-input-height: 32px;
      --core-input-padding-x: 12px;
      --core-input-font-size: 13px;
      --core-input-bg: var(--core-ink-1, #fff);
      --core-input-fg: var(--core-fg-0, #000);
      --core-input-border-color: var(--core-line-2);
      --core-input-border-color-focus: var(--core-brand-500);
      --core-input-border-color-invalid: var(--core-danger-500);
      --core-input-radius: var(--core-radius-md);
      --core-input-hint-color: var(--core-fg-3);
      --core-input-error-color: var(--core-danger-500);
    }
    :host([size="sm"]) { --core-input-height: 26px; --core-input-padding-x: 10px; --core-input-font-size: 12px; }
    :host([size="lg"]) { --core-input-height: 40px; --core-input-padding-x: 14px; --core-input-font-size: 15px; }
    [part="base"] {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    [part="control"] {
      display: flex;
      align-items: center;
      gap: 6px;
      height: var(--core-input-height);
      padding: 0 var(--core-input-padding-x);
      background: var(--core-input-bg);
      color: var(--core-input-fg);
      border: 1px solid var(--core-input-border-color);
      border-radius: var(--core-input-radius);
      font-size: var(--core-input-font-size);
      transition: border-color 120ms ease;
    }
    [part="control"]:focus-within { border-color: var(--core-input-border-color-focus); }
    [part="control"]:has(input:user-invalid) { border-color: var(--core-input-border-color-invalid); }
    [part="input"] {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: 0;
      outline: 0;
      color: inherit;
      font: inherit;
    }
    [part="input"]:disabled { cursor: not-allowed; opacity: 0.5; }
    [part="leading"]:empty, [part="trailing"]:empty { display: none; }
    [part="leading"], [part="trailing"] {
      display: inline-flex;
      align-items: center;
    }
    [part="hint"], [part="error"] {
      font-size: 12px;
    }
    [part="hint"] { color: var(--core-input-hint-color); }
    [part="error"] { color: var(--core-input-error-color); }
    [part="hint"]:not(:has(*)), [part="error"]:not(:has(*)) { display: none; }
  `;

  override updated(): void {
    // Sync inner input's validity to ElementInternals so <form>.checkValidity()
    // walks this custom element correctly.
    if (this._inner) {
      this._setValidity(
        this._inner.validity,
        this._inner.validationMessage,
        this._inner,
      );
    }
  }

  override formResetCallback(): void {
    this.value = '';
    this._setFormValue(null);
  }

  private _onInput = (ev: Event): void => {
    const target = ev.target as HTMLInputElement;
    this.value = target.value;
    this._setFormValue(target.value || null);
    this._setValidity(target.validity, target.validationMessage, target);
    this.dispatchEvent(new CustomEvent('core-input', {
      bubbles: true, composed: true, detail: { value: target.value },
    }));
  };

  private _onChange = (ev: Event): void => {
    const target = ev.target as HTMLInputElement;
    this.dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true, detail: { value: target.value },
    }));
  };

  private _renderIcon(name: string) {
    if (!name) return nothing;
    return html`<core-icon name=${name} size="sm" decorative></core-icon>`;
  }

  override render() {
    return html`
      <div part="base">
        <div part="control">
          <span part="leading">${this._renderIcon(this.leadingIcon)}</span>
          <input
            part="input"
            type=${this.type}
            name=${this.name || nothing}
            .value=${this.value}
            placeholder=${this.placeholder || nothing}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            pattern=${this.pattern || nothing}
            minlength=${this.minlength ?? nothing}
            maxlength=${this.maxlength ?? nothing}
            min=${this.min || nothing}
            max=${this.max || nothing}
            step=${this.step || nothing}
            autocomplete=${this.autocomplete || nothing}
            @input=${this._onInput}
            @change=${this._onChange}
          />
          <span part="trailing">${this._renderIcon(this.trailingIcon)}</span>
        </div>
        <div part="hint"><slot name="hint"></slot></div>
        <div part="error"><slot name="error"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-input': CoreInput;
  }
}

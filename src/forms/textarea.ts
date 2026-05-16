// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-input.ts (2026-05-07).
import { html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { CoreFormElement } from './_shared/form-element';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaWrap = 'soft' | 'hard' | 'off';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

/**
 * `<core-textarea>` — multi-line text input with form-association,
 * full Constraint Validation, slotted hint/error.
 *
 *   <core-textarea name="bio" rows="4" maxlength="500">
 *     <span slot="hint">Up to 500 characters.</span>
 *   </core-textarea>
 *
 * Attributes (reflected):
 *   name, value, placeholder, required, disabled, readonly
 *   rows (default 3), cols, minlength, maxlength
 *   wrap ('soft'|'hard'|'off'), resize ('none'|'vertical'|'horizontal'|'both'; default 'vertical')
 *   autocomplete, size ('sm'|'md'|'lg'; default 'md')
 *
 * Slots: 'hint', 'error'
 * Parts: base, textarea, hint, error
 * Events: core-input + core-change with detail: { value }
 * Vars: --core-textarea-{padding, font-size, bg, fg, border-color,
 *                        border-color-focus, border-color-invalid,
 *                        radius, min-height, hint-color, error-color}
 */
@customElement('core-textarea')
export class CoreTextarea extends CoreFormElement {
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';
  @property({ reflect: true }) placeholder = '';
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true, type: Boolean }) readonly = false;
  @property({ reflect: true, type: Number }) rows = 3;
  @property({ reflect: true, type: Number }) cols: number | null = null;
  @property({ reflect: true, type: Number }) minlength: number | null = null;
  @property({ reflect: true, type: Number }) maxlength: number | null = null;
  @property({ reflect: true }) wrap: TextareaWrap | '' = '';
  @property({ reflect: true }) resize: TextareaResize = 'vertical';
  @property({ reflect: true }) autocomplete = '';
  @property({ reflect: true }) size: TextareaSize = 'md';

  @query('textarea') private _inner!: HTMLTextAreaElement;

  static override styles = css`
    :host {
      display: inline-block;
      width: 100%;
      --core-textarea-padding: 8px 12px;
      --core-textarea-font-size: 13px;
      --core-textarea-bg: var(--core-ink-1, #fff);
      --core-textarea-fg: var(--core-fg-0, #000);
      --core-textarea-border-color: var(--core-line-2);
      --core-textarea-border-color-focus: var(--core-brand-500);
      --core-textarea-border-color-invalid: var(--core-danger-500);
      --core-textarea-radius: var(--core-radius-md);
      --core-textarea-min-height: 72px;
      --core-textarea-hint-color: var(--core-fg-3);
      --core-textarea-error-color: var(--core-danger-500);
    }
    :host([size="sm"]) { --core-textarea-font-size: 12px; --core-textarea-padding: 6px 10px; }
    :host([size="lg"]) { --core-textarea-font-size: 15px; --core-textarea-padding: 10px 14px; }
    [part="base"] {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    [part="textarea"] {
      width: 100%;
      min-height: var(--core-textarea-min-height);
      padding: var(--core-textarea-padding);
      background: var(--core-textarea-bg);
      color: var(--core-textarea-fg);
      border: 1px solid var(--core-textarea-border-color);
      border-radius: var(--core-textarea-radius);
      font-size: var(--core-textarea-font-size);
      font-family: inherit;
      transition: border-color 120ms ease;
      box-sizing: border-box;
    }
    [part="textarea"]:focus { outline: none; border-color: var(--core-textarea-border-color-focus); }
    [part="textarea"]:user-invalid { border-color: var(--core-textarea-border-color-invalid); }
    [part="textarea"]:disabled { cursor: not-allowed; opacity: 0.5; }
    :host([resize="none"]) [part="textarea"] { resize: none; }
    :host([resize="vertical"]) [part="textarea"] { resize: vertical; }
    :host([resize="horizontal"]) [part="textarea"] { resize: horizontal; }
    :host([resize="both"]) [part="textarea"] { resize: both; }
    [part="hint"], [part="error"] { font-size: 12px; }
    [part="hint"] { color: var(--core-textarea-hint-color); }
    [part="error"] { color: var(--core-textarea-error-color); }
    [part="hint"]:not(:has(*)), [part="error"]:not(:has(*)) { display: none; }
  `;

  override updated(): void {
    if (this._inner) {
      this._setValidity(this._inner.validity, this._inner.validationMessage, this._inner);
    }
  }

  override formResetCallback(): void {
    this.value = '';
    this._setFormValue(null);
  }

  private _onInput = (ev: Event): void => {
    const target = ev.target as HTMLTextAreaElement;
    this.value = target.value;
    this._setFormValue(target.value || null);
    this._setValidity(target.validity, target.validationMessage, target);
    this.dispatchEvent(new CustomEvent('core-input', {
      bubbles: true, composed: true, detail: { value: target.value },
    }));
  };

  private _onChange = (ev: Event): void => {
    const target = ev.target as HTMLTextAreaElement;
    this.dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true, detail: { value: target.value },
    }));
  };

  override render() {
    return html`
      <div part="base">
        <textarea
          part="textarea"
          name=${this.name || nothing}
          .value=${this.value}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          rows=${this.rows}
          cols=${this.cols ?? nothing}
          minlength=${this.minlength ?? nothing}
          maxlength=${this.maxlength ?? nothing}
          wrap=${this.wrap || nothing}
          autocomplete=${this.autocomplete || nothing}
          @input=${this._onInput}
          @change=${this._onChange}
        ></textarea>
        <div part="hint"><slot name="hint"></slot></div>
        <div part="error"><slot name="error"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-textarea': CoreTextarea;
  }
}

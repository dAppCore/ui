// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-select.ts (2026-05-07).
import { html, css, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { CoreFormElement } from './_shared/form-element';

export type SelectSize = 'sm' | 'md' | 'lg';

/**
 * `<core-select>` — native inner <select> with light-DOM option
 * re-projection. Form-associated, full Constraint Validation.
 *
 *   <core-select name="plan" required>
 *     <option value="">— Choose —</option>
 *     <option value="free">Free</option>
 *     <option value="pro">Pro</option>
 *   </core-select>
 *
 *   <core-select name="tags" multiple>
 *     <option value="a">A</option>
 *     <option value="b">B</option>
 *   </core-select>
 *
 * Attributes (reflected): name, value, required, disabled, size, multiple, leading-icon
 *
 * Slots: hint, error. Host children of type <option>/<optgroup> are
 *        re-projected into the Shadow-DOM-internal <select> on connect
 *        and on MutationObserver child-list changes.
 *
 * Parts: base, select, leading, hint, error
 * Events: core-change with detail: { value, selectedValues }
 *         (selectedValues populated only when multiple is set)
 * Vars: --core-select-{height, padding-x, font-size, bg, fg, border-color,
 *                      border-color-focus, border-color-invalid, radius,
 *                      hint-color, error-color}
 */
@customElement('core-select')
export class CoreSelect extends CoreFormElement {
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true, type: Boolean }) multiple = false;
  @property({ reflect: true }) size: SelectSize = 'md';
  @property({ reflect: true, attribute: 'leading-icon' }) leadingIcon = '';

  @query('select') private _inner!: HTMLSelectElement;

  private _observer: MutationObserver | null = null;

  static override styles = css`
    :host {
      display: inline-block;
      width: 100%;
      --core-select-height: 32px;
      --core-select-padding-x: 12px;
      --core-select-font-size: 13px;
      --core-select-bg: var(--core-ink-1, #fff);
      --core-select-fg: var(--core-fg-0, #000);
      --core-select-border-color: var(--core-line-2);
      --core-select-border-color-focus: var(--core-brand-500);
      --core-select-border-color-invalid: var(--core-danger-500);
      --core-select-radius: var(--core-radius-md);
      --core-select-hint-color: var(--core-fg-3);
      --core-select-error-color: var(--core-danger-500);
    }
    :host([size="sm"]) { --core-select-height: 26px; --core-select-padding-x: 10px; --core-select-font-size: 12px; }
    :host([size="lg"]) { --core-select-height: 40px; --core-select-padding-x: 14px; --core-select-font-size: 15px; }
    [part="base"] {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    [part="control"] {
      display: flex;
      align-items: center;
      gap: 6px;
      height: var(--core-select-height);
      padding: 0 var(--core-select-padding-x);
      background: var(--core-select-bg);
      color: var(--core-select-fg);
      border: 1px solid var(--core-select-border-color);
      border-radius: var(--core-select-radius);
      font-size: var(--core-select-font-size);
      transition: border-color 120ms ease;
    }
    [part="control"]:focus-within { border-color: var(--core-select-border-color-focus); }
    [part="control"]:has(select:user-invalid) { border-color: var(--core-select-border-color-invalid); }
    [part="select"] {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: 0;
      outline: 0;
      color: inherit;
      font: inherit;
      appearance: auto;
    }
    :host([multiple]) [part="select"] { min-height: 80px; appearance: none; padding: 4px; }
    [part="select"]:disabled { cursor: not-allowed; opacity: 0.5; }
    [part="leading"]:empty { display: none; }
    [part="leading"] {
      display: inline-flex;
      align-items: center;
    }
    [part="hint"], [part="error"] { font-size: 12px; }
    [part="hint"] { color: var(--core-select-hint-color); }
    [part="error"] { color: var(--core-select-error-color); }
    [part="hint"]:not(:has(*)), [part="error"]:not(:has(*)) { display: none; }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    // Re-project on initial paint + on any child-list change.
    this._observer = new MutationObserver(() => this._projectOptions());
    this._observer.observe(this, { childList: true, subtree: false });
    // Initial projection runs after first updateComplete (so _inner exists).
    queueMicrotask(() => this._projectOptions());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = null;
  }

  private _projectOptions(): void {
    if (!this._inner) return;
    // Snapshot current selection so re-projection preserves it.
    const oldValue = this._inner.value;
    const oldSelected = Array.from(this._inner.options)
      .filter((o) => o.selected).map((o) => o.value);
    // Clone the host <option>/<optgroup> children into the inner <select>.
    // Clone instead of move so the host's DOM stays authoritative for the
    // consumer's view of the tree.
    this._inner.innerHTML = '';
    for (const child of Array.from(this.children)) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'option' || tag === 'optgroup') {
        this._inner.appendChild(child.cloneNode(true));
      }
    }
    // Restore selection: prefer explicit `value` prop > snapshot.
    if (this.multiple) {
      const wanted = new Set(oldSelected);
      Array.from(this._inner.options).forEach((o) => {
        o.selected = wanted.has(o.value);
      });
    } else {
      this._inner.value = this.value || oldValue;
    }
    this._syncFormValue();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('value') && this._inner && !this.multiple) {
      this._inner.value = this.value;
    }
    if (this._inner) {
      this._setValidity(this._inner.validity, this._inner.validationMessage, this._inner);
    }
  }

  override formResetCallback(): void {
    this.value = '';
    this._projectOptions();
  }

  private _syncFormValue(): void {
    if (!this._inner) return;
    if (this.multiple) {
      // Multiple-select FormData serialisation: one entry per selected
      // value sharing the same `name`. Matches native <select multiple>.
      const data = new FormData();
      for (const opt of Array.from(this._inner.options)) {
        if (opt.selected) data.append(this.name || 'value', opt.value);
      }
      this._internals?.setFormValue(data);
    } else {
      this._setFormValue(this._inner.value || null);
    }
  }

  private _onChange = (): void => {
    if (!this._inner) return;
    if (this.multiple) {
      const selectedValues = Array.from(this._inner.options)
        .filter((o) => o.selected).map((o) => o.value);
      this.value = selectedValues.join(',');
      this.dispatchEvent(new CustomEvent('core-change', {
        bubbles: true, composed: true,
        detail: { value: this.value, selectedValues },
      }));
    } else {
      this.value = this._inner.value;
      this.dispatchEvent(new CustomEvent('core-change', {
        bubbles: true, composed: true,
        detail: { value: this.value },
      }));
    }
    this._syncFormValue();
    this._setValidity(this._inner.validity, this._inner.validationMessage, this._inner);
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
          <select
            part="select"
            name=${this.name || nothing}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?multiple=${this.multiple}
            @change=${this._onChange}
          ></select>
        </div>
        <div part="hint"><slot name="hint"></slot></div>
        <div part="error"><slot name="error"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-select': CoreSelect;
  }
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — semantics ported from
// core/ide/frontend/lit/src/elements/forms/lethean-radio-group.ts (2026-05-07).
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreFormElement } from './_shared/form-element';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

interface CoreRadioChild extends HTMLElement {
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
}

/**
 * `<core-radio-group>` — single-selection wrapper for <core-radio>
 * children. Manages the group-level value via ElementInternals;
 * propagates name + disabled to children; un-checks siblings when
 * one is selected.
 *
 *   <core-radio-group name="plan" value="pro" required>
 *     <core-radio value="free">Free</core-radio>
 *     <core-radio value="pro">Pro</core-radio>
 *     <core-radio value="enterprise">Enterprise</core-radio>
 *     <span slot="hint">Choose one plan.</span>
 *     <span slot="error">A plan is required.</span>
 *   </core-radio-group>
 *
 * The group's `name` overwrites any individual radio's `name` to
 * enforce single-group semantics. Required validation happens at the
 * group level (ValueMissing when no child is checked).
 *
 * Attributes (reflected): name, value, required, disabled, orientation
 * Slots: default (<core-radio> children), hint, error
 * Parts: base, group, hint, error
 * Events: core-change with detail: { value }
 * Vars: --core-radio-group-{gap, hint-color, error-color}
 */
@customElement('core-radio-group')
export class CoreRadioGroup extends CoreFormElement {
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';
  @property({ reflect: true, type: Boolean }) required = false;
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true }) orientation: RadioGroupOrientation = 'vertical';

  private _observer: MutationObserver | null = null;

  static override styles = css`
    :host {
      display: block;
      --core-radio-group-gap: 8px;
      --core-radio-group-hint-color: var(--core-fg-3);
      --core-radio-group-error-color: var(--core-danger-500);
    }
    [part="base"] {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    [part="group"] {
      display: flex;
      gap: var(--core-radio-group-gap);
    }
    :host([orientation="vertical"]) [part="group"] { flex-direction: column; }
    :host([orientation="horizontal"]) [part="group"] { flex-direction: row; flex-wrap: wrap; }
    [part="hint"], [part="error"] { font-size: 12px; }
    [part="hint"] { color: var(--core-radio-group-hint-color); }
    [part="error"] { color: var(--core-radio-group-error-color); }
    [part="hint"]:not(:has(*)), [part="error"]:not(:has(*)) { display: none; }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('core-change', this._onChildChange);
    this._observer = new MutationObserver(() => this._syncChildren());
    this._observer.observe(this, { childList: true, subtree: false });
    queueMicrotask(() => this._syncChildren());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('core-change', this._onChildChange);
    this._observer?.disconnect();
    this._observer = null;
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('name') || changed.has('disabled') || changed.has('value')) {
      this._syncChildren();
    }
    this._setFormValue(this.value || null);
    this._setValidity(
      this.required && !this.value ? { valueMissing: true } : {},
      this.required && !this.value ? 'Please select an option.' : undefined,
    );
  }

  override formResetCallback(): void {
    this.value = '';
    this._syncChildren();
  }

  /** Walk <core-radio> children: propagate name+disabled, set checked from value. */
  private _syncChildren(): void {
    const radios = Array.from(this.querySelectorAll('core-radio')) as unknown as CoreRadioChild[];
    let derivedValue = this.value;
    // If no explicit value, pick up the first checked child as the group's value.
    if (!derivedValue) {
      const first = radios.find((r) => r.checked);
      if (first) derivedValue = first.value;
    }
    for (const radio of radios) {
      radio.name = this.name; // group's name wins
      radio.disabled = this.disabled || radio.disabled;
      radio.checked = radio.value === derivedValue;
    }
    if (derivedValue !== this.value) this.value = derivedValue;
  }

  /** A child <core-radio> emitted core-change → the group becomes the source of truth. */
  private _onChildChange = (ev: Event): void => {
    const target = ev.target as Element;
    if (target.tagName.toLowerCase() !== 'core-radio') return;
    const detail = (ev as CustomEvent).detail as { checked: boolean; value: string };
    if (!detail.checked) return;
    this.value = detail.value;
    this._syncChildren();
    // Re-emit at the group level so consumers listen on the group, not the child.
    ev.stopPropagation();
    this.dispatchEvent(new CustomEvent('core-change', {
      bubbles: true, composed: true,
      detail: { value: this.value },
    }));
  };

  override render() {
    return html`
      <div part="base">
        <div part="group">
          <slot></slot>
        </div>
        <div part="hint"><slot name="hint"></slot></div>
        <div part="error"><slot name="error"></slot></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-radio-group': CoreRadioGroup;
  }
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — no upstream in core/ide.
import { LitElement } from 'lit';

/**
 * Base class for every CoreUI v0.7 form-input primitive (input, textarea,
 * select, checkbox, radio, radio-group).
 *
 * Provides:
 *   - `static formAssociated = true` for native <form> participation
 *   - `attachInternals()` guarded for happy-dom (returns null)
 *   - the full Constraint Validation API surface (checkValidity,
 *     reportValidity, setValidity, validity, validationMessage,
 *     willValidate, setCustomValidity)
 *   - `formResetCallback`, `formDisabledCallback`,
 *     `formStateRestoreCallback` lifecycle hooks (override where needed)
 *
 * Subclasses extend this and implement `name`, `disabled`, `required`
 * as @property fields. The default `formDisabledCallback` mirrors the
 * form-level disable to `this.disabled` — override if a primitive
 * needs to also disable children (e.g. <core-radio-group>).
 *
 * Uses default Lit Shadow DOM render root (no createRenderRoot
 * override) — Shadow DOM is the v0.7 contract per RFC §4 exception
 * (slot distribution for hint/error content is a legit reason).
 *
 * Usage example:
 *
 *   import { CoreFormElement } from './_shared/form-element';
 *   import { customElement, property } from 'lit/decorators.js';
 *   import { html, css } from 'lit';
 *
 *   @customElement('core-input')
 *   export class CoreInput extends CoreFormElement {
 *     @property({ reflect: true }) name = '';
 *     @property({ reflect: true, type: Boolean }) disabled = false;
 *     @property({ reflect: true, type: Boolean }) required = false;
 *     // ... etc
 *   }
 */
export abstract class CoreFormElement extends LitElement {
  static formAssociated = true;

  protected _internals: ElementInternals | null;

  abstract name: string;
  abstract disabled: boolean;
  abstract required: boolean;

  constructor() {
    super();
    this._internals = typeof this.attachInternals === 'function'
      ? this.attachInternals()
      : null;
  }

  // ── Constraint Validation API surface ──────────────────────────

  get form(): HTMLFormElement | null {
    return this._internals?.form ?? null;
  }

  get validity(): ValidityState | null {
    return this._internals?.validity ?? null;
  }

  get validationMessage(): string {
    return this._internals?.validationMessage ?? '';
  }

  get willValidate(): boolean {
    return this._internals?.willValidate ?? false;
  }

  checkValidity(): boolean {
    return this._internals?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    return this._internals?.reportValidity() ?? true;
  }

  setCustomValidity(message: string): void {
    this._internals?.setValidity(
      message ? { customError: true } : {},
      message,
    );
  }

  /** Protected helper for subclasses to sync their inner native input's
   *  validity to ElementInternals. Pass the inner element as anchor so
   *  the browser's default `reportValidity()` UI points at the right
   *  element. */
  protected _setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement,
  ): void {
    this._internals?.setValidity(flags, message, anchor);
  }

  /** Protected helper for subclasses to push the current value into
   *  ElementInternals so `new FormData(form)` picks it up. */
  protected _setFormValue(value: FormDataEntryValue | null): void {
    this._internals?.setFormValue(value);
  }

  // ── Form lifecycle callbacks ───────────────────────────────────

  formResetCallback(): void {
    // Subclass overrides — default no-op.
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formStateRestoreCallback(
    _state: FormDataEntryValue | null,
    _mode: 'restore' | 'autocomplete',
  ): void {
    // Subclass overrides for state restoration on browser back-navigation.
  }
}

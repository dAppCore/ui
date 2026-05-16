// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-button.ts (2026-05-07).
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * `<core-button>` — interactive primitive backed by a native `<button>` in
 * light DOM, with ElementInternals for `type="submit"` form participation.
 *
 *   <core-button variant="primary" size="md">Save</core-button>
 *   <core-button type="submit">Submit</core-button>          (inside <form>)
 *   <core-button loading>Saving…</core-button>
 *   <core-button variant="ghost">
 *     <core-icon slot="leading" name="plus" decorative></core-icon>
 *     Add
 *   </core-button>
 *
 * Attributes (reflected):
 *   variant   'primary' | 'secondary' | 'ghost' | 'danger'   (default 'secondary')
 *   size      'sm' | 'md' | 'lg'                              (default 'md')
 *   disabled  boolean
 *   type      'button' | 'submit' | 'reset'                   (default 'button')
 *   loading   boolean — shows spinner, sets aria-busy
 *
 * Slots: default (label), 'leading' (icon), 'trailing' (icon)
 * Parts: base, label, icon-leading, icon-trailing, spinner
 * Vars:  --core-button-{height, padding-x, radius, bg, fg, border-color,
 *                       font-size, bg-hover, bg-active}
 */
@customElement('core-button')
export class CoreButton extends CoreElement {
  static formAssociated = true;

  @property({ reflect: true }) variant: ButtonVariant = 'secondary';
  @property({ reflect: true }) size: ButtonSize = 'md';
  @property({ reflect: true, type: Boolean }) disabled = false;
  @property({ reflect: true }) type: ButtonType = 'button';
  @property({ reflect: true, type: Boolean }) loading = false;

  private _internals: ElementInternals | null;

  constructor() {
    super();
    // happy-dom (15.x) doesn't ship ElementInternals; guard so the
    // element still constructs in tests. Real browsers always have it.
    this._internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : null;
    // Listen on the host so `coreButton.click()` also dispatches our
    // submit/reset semantics. The inner <button> click bubbles here too,
    // so a single handler covers both invocation paths.
    this.addEventListener('click', this._onClick);
  }

  override updated(): void {
    this.setAttribute('aria-busy', this.loading ? 'true' : 'false');
  }

  private _onClick = (ev: MouseEvent): void => {
    if (this.disabled || this.loading) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      return;
    }
    // Two click paths reach this handler (it's bound to the host):
    //   (a) bubbled click from the inner <button>: the browser is
    //       already running the native submit/reset pipeline because
    //       the inner element has type="submit"|"reset". Don't
    //       double-fire here.
    //   (b) direct click on the host (e.g. coreButton.click()): no
    //       native submission, so synthesise via ElementInternals.form
    //       (spec-correct) or a closest('form') fallback (happy-dom).
    if (ev.target !== this) {
      return;
    }
    if (this.type === 'submit') {
      const form = this._internals?.form ?? this.closest('form');
      form?.requestSubmit();
    } else if (this.type === 'reset') {
      const form = this._internals?.form ?? this.closest('form');
      form?.reset();
    }
  };

  override render() {
    return html`
      <button
        part="base"
        type=${this.type}
        ?disabled=${this.disabled || this.loading}
      >
        <span part="icon-leading"><slot name="leading"></slot></span>
        <span part="label"><slot></slot></span>
        <span part="icon-trailing"><slot name="trailing"></slot></span>
        ${this.loading
          ? html`<span part="spinner" aria-hidden="true"></span>`
          : null}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-button': CoreButton;
  }
}

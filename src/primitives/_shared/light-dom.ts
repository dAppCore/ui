// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { LitElement } from 'lit';

/**
 * Base class for every CoreUI primitive. Renders into light DOM so that
 * `--core-*` design tokens cascade through and skin layers can target
 * internal elements via standard attribute selectors (`core-button [part="base"]`)
 * rather than the Shadow-DOM-only `::part()` pseudo-element.
 *
 * Light DOM also means form-associated native children (`<button>`, `<input>`)
 * participate in `<form>` submission without ElementInternals plumbing.
 *
 * Usage:
 *
 *   import { CoreElement } from './_shared/light-dom';
 *   import { html } from 'lit';
 *   import { customElement } from 'lit/decorators.js';
 *
 *   @customElement('core-foo')
 *   export class CoreFoo extends CoreElement {
 *     render() { return html`<div part="base"><slot></slot></div>`; }
 *   }
 */
export class CoreElement extends LitElement {
  // Lit's base returns `HTMLElement | DocumentFragment`. Default CoreUI
  // primitives render into the host (light DOM, `HTMLElement` branch), but
  // structural primitives (e.g. `<core-router>`, `<core-route>`) override
  // this to return a detached `DocumentFragment` so the host's children
  // survive Lit's template commits. Widening the return type lets those
  // overrides typecheck cleanly.
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }
}

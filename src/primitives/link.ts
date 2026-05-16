// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.6 — minimal router; no upstream in core/ide.
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { CoreElement } from './_shared/light-dom';
import { routerContext, type RouterState } from './_shared/router-context';

/**
 * `<core-link>` — internal-navigation link backed by a real `<a href>` so
 * right-click ("Open in new tab"), middle-click, and Cmd/Ctrl-click behave
 * exactly like a native link. Plain left-click intercepts and routes via the
 * ancestor `<core-router>`.
 *
 *   <core-link to="/about">About</core-link>
 *   <core-link to="/users/42">Profile</core-link>
 *
 * Attributes (reflected):
 *   to   string — destination path (no leading `#`)
 *
 * The host hoists its original child nodes into a managed `<a>` whose
 * `href` is computed from the active router mode:
 *   hash mode    → `href="#/about"`
 *   history mode → `href="/about"`
 *
 * Slots: default (label) — rendered inside the managed `<a>`.
 */
@customElement('core-link')
export class CoreLink extends CoreElement {
  @property({ reflect: true }) to = '';

  private _anchor: HTMLAnchorElement | null = null;

  private _consumer = new ContextConsumer(this, {
    context: routerContext,
    subscribe: true,
    callback: () => this._syncHref(),
  });

  /**
   * Light-DOM "ghost" render root (see router.ts): keeps Lit's reactive
   * lifecycle wired without letting templates wipe the manually-managed
   * `<a>` we hoist into the host's light DOM.
   */
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return document.createDocumentFragment();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // When parsed from HTML, children may not yet be appended at the time
    // `connectedCallback` fires (the HTML parser appends children *after*
    // the element is connected). Defer to a microtask so we hoist a fully-
    // parsed set of children into the managed `<a>`.
    queueMicrotask(() => this._ensureAnchor());
    this._syncHref();
  }

  override updated(): void {
    this._syncHref();
  }

  private _ensureAnchor(): void {
    if (this._anchor && this._anchor.parentNode === this) {
      // anchor already created — pull in any stragglers that landed after
      // the first hoist (rare; covers slow re-parenting).
      let n: ChildNode | null = this.firstChild;
      while (n) {
        const next: ChildNode | null = n.nextSibling;
        if (n !== this._anchor) this._anchor.appendChild(n);
        n = next;
      }
      return;
    }
    const a = document.createElement('a');
    // Hoist the consumer's original children into the anchor so they
    // appear as the link's label.
    while (this.firstChild) a.appendChild(this.firstChild);
    a.addEventListener('click', this._onClick);
    this.appendChild(a);
    this._anchor = a;
    this._syncHref();
  }

  private _syncHref(): void {
    if (!this._anchor) return;
    const router: RouterState | undefined = this._consumer.value;
    const mode = router?.mode ?? 'hash';
    const href = mode === 'history' ? this.to : '#' + this.to;
    this._anchor.setAttribute('href', href);
  }

  private _onClick = (ev: MouseEvent): void => {
    // Defer to the browser for any non-plain left-click. Right-click is
    // button !== 0; middle-click is button === 1; modifier keys (Cmd/Ctrl/
    // Shift/Alt/Meta) all signal "user wants special behaviour" — let them.
    if (ev.button !== 0) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (ev.defaultPrevented) return;
    const router = this._consumer.value;
    if (!router) return;
    ev.preventDefault();
    router.navigate(this.to);
  };

  override render() {
    // See createRenderRoot — renders into a detached fragment; the real
    // anchor is managed imperatively in connectedCallback/updated.
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-link': CoreLink;
  }
}

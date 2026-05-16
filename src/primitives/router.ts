// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.6 — minimal router; no upstream in core/ide.
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextProvider } from '@lit/context';
import { CoreElement } from './_shared/light-dom';
import {
  routerContext, type RouterMode, type RouterState,
} from './_shared/router-context';

/**
 * `<core-router>` — owns route state and broadcasts it via `@lit/context` to
 * descendant `<core-route>` and `<core-link>` elements.
 *
 *   <core-router mode="hash">
 *     <core-link to="/">Home</core-link>
 *     <core-link to="/about">About</core-link>
 *     <core-route path="/"><h1>Home</h1></core-route>
 *     <core-route path="/about"><h1>About</h1></core-route>
 *     <core-route path="/users/:id"><user-detail></user-detail></core-route>
 *     <core-route path="*"><h1>Not found</h1></core-route>
 *   </core-router>
 *
 * Attributes (reflected):
 *   mode   'hash' | 'history'   (default 'hash')
 *
 * Slots: default — `<core-route>` + `<core-link>` children.
 * Parts: base
 * Events: core-route-change (bubbles, composed) with detail: { path, query }
 * Property: query — URLSearchParams for the current URL (read-only).
 */
@customElement('core-router')
export class CoreRouter extends CoreElement {
  @property({ reflect: true }) mode: RouterMode = 'hash';
  @property({ attribute: false }) path = '/';
  @property({ attribute: false }) query: URLSearchParams = new URLSearchParams();

  private _provider = new ContextProvider(this, {
    context: routerContext,
    initialValue: this._buildState('/', new URLSearchParams()),
  });

  /**
   * Light-DOM "ghost" pattern: render into a detached fragment so Lit's
   * template never wipes the consumer's `<core-route>` / `<core-link>`
   * children. The router only needs to expose context + dispatch events;
   * there's no visual chrome to commit. We still write `part="base"` to
   * the host so external skin layers can target it.
   */
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return document.createDocumentFragment();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('part')) this.setAttribute('part', 'base');
    window.addEventListener('hashchange', this._onLocationChange);
    window.addEventListener('popstate', this._onLocationChange);
    this._syncFromLocation();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onLocationChange);
    window.removeEventListener('popstate', this._onLocationChange);
  }

  private _onLocationChange = (): void => {
    this._syncFromLocation();
  };

  private _syncFromLocation(): void {
    const raw = this.mode === 'history'
      ? window.location.pathname + window.location.search
      : (window.location.hash.slice(1) || '/');
    const [pathPart, queryPart] = raw.split('?');
    const path = normalisePath(pathPart || '/');
    const query = new URLSearchParams(queryPart ?? '');
    this.path = path;
    this.query = query;
    this._provider.setValue(this._buildState(path, query));
    this.dispatchEvent(new CustomEvent('core-route-change', {
      bubbles: true,
      composed: true,
      detail: { path, query },
    }));
  }

  private _navigate = (to: string): void => {
    if (this.mode === 'history') {
      window.history.pushState({}, '', to);
      this._syncFromLocation();
    } else {
      // setting location.hash fires `hashchange` which calls _syncFromLocation
      window.location.hash = to;
    }
  };

  private _buildState(path: string, query: URLSearchParams): RouterState {
    return { path, mode: this.mode, query, navigate: this._navigate };
  }

  override render() {
    // Renders into a detached DocumentFragment (see createRenderRoot above)
    // — keeps Lit's reactive update loop wired while leaving the host's
    // light-DOM children (routes + links) untouched.
    return html``;
  }
}

/** Strip trailing `/` (except for root) so `/about` and `/about/` match the same route. */
function normalisePath(p: string): string {
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

declare global {
  interface HTMLElementTagNameMap {
    'core-router': CoreRouter;
  }
}

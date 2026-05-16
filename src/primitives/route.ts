// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.6 — minimal router; no upstream in core/ide.
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { CoreElement } from './_shared/light-dom';
import { routerContext, type RouterState } from './_shared/router-context';

/**
 * `<core-route>` — declarative match against the parent `<core-router>` path.
 *
 *   <core-route path="/about">…</core-route>
 *   <core-route path="/users/:id">…</core-route>      (parsed params on data-params)
 *   <core-route path="*">…</core-route>                (404 fallback)
 *
 * Attributes (reflected):
 *   path     string — the pattern to match (`*` is the single fallback wildcard)
 *
 * Behaviour:
 *   - When `path` matches the router's current path, the route renders its
 *     default slot and the host is visible.
 *   - When it doesn't match, the host carries the `hidden` attribute and
 *     renders no slot content.
 *   - Parsed `:param` segments are written to `data-params` on the host as
 *     a JSON-encoded object: `{"id":"42"}`.
 *   - The `*` wildcard pattern only matches when NO other sibling route
 *     matches first — it's resolved against the router's path on each
 *     change, but a higher-specificity match elsewhere doesn't directly
 *     suppress it; the consumer is expected to make only one `path="*"`
 *     route per `<core-router>` and place it last visually. (Two-pass
 *     matching would buy nesting we explicitly don't support.)
 *
 * Slots: default — content rendered when active.
 * Parts: base
 */
@customElement('core-route')
export class CoreRoute extends CoreElement {
  @property({ reflect: true }) path = '';
  @state() private _active = false;

  private _consumer = new ContextConsumer(this, {
    context: routerContext,
    subscribe: true,
    callback: (state) => this._onRouterState(state),
  });

  /**
   * Light-DOM "ghost" pattern (see router.ts): render into a detached
   * DocumentFragment so the consumer's slotted DOM children stay put.
   * Visibility is controlled exclusively via the `hidden` attribute on
   * the host, which our CSS turns into `display: none`.
   */
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return document.createDocumentFragment();
  }

  private _onRouterState(state: RouterState): void {
    const result = matchRoute(this.path, state.path);
    this._active = result.matched;
    if (result.matched) {
      this.removeAttribute('hidden');
      this.setAttribute('data-params', JSON.stringify(result.params));
    } else {
      this.setAttribute('hidden', '');
      this.removeAttribute('data-params');
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('part')) this.setAttribute('part', 'base');
    // The consumer's first callback runs once the provider replies. If the
    // route was placed without a router (or under a router that hasn't
    // fired yet), start hidden so we don't flash content.
    if (!this._consumer.value) {
      this.setAttribute('hidden', '');
    }
  }

  override render() {
    // See createRenderRoot — renders into a detached fragment so light-DOM
    // children survive. The `_active` flag drives the `hidden` attribute
    // via `_onRouterState`; CSS does the rest.
    void this._active;
    return html``;
  }
}

interface MatchResult {
  matched: boolean;
  params: Record<string, string>;
}

/**
 * Match `pattern` against `path`. Supports exact strings, `:name` segments,
 * and the single `*` fallback wildcard. Trailing slashes are normalised by
 * the router; we don't re-normalise here.
 */
export function matchRoute(pattern: string, path: string): MatchResult {
  if (pattern === '*') return { matched: true, params: {} };
  if (!pattern) return { matched: false, params: {} };
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i]!;
    const xp = pathParts[i]!;
    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeURIComponent(xp);
    } else if (pp !== xp) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}

declare global {
  interface HTMLElementTagNameMap {
    'core-route': CoreRoute;
  }
}

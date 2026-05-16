// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.6 — minimal router; no upstream in core/ide.
import { createContext } from '@lit/context';

/**
 * Mode for `<core-router>`:
 *   'hash'    — read/write `location.hash` (default; works under file://)
 *   'history' — read `location.pathname`, write via `history.pushState`
 */
export type RouterMode = 'hash' | 'history';

/**
 * Shared state published by `<core-router>` and consumed by
 * descendant `<core-route>` / `<core-link>` elements.
 *
 *   path  — the current URL path (no leading `#`, with leading `/`)
 *   mode  — hash | history
 *   query — parsed query string (`URLSearchParams`, never null)
 *   navigate — imperative navigation hook for `<core-link>`; the
 *              router is the sole writer so links don't need to know
 *              which mode is active.
 */
export interface RouterState {
  path: string;
  mode: RouterMode;
  query: URLSearchParams;
  navigate: (to: string) => void;
}

export const routerContext = createContext<RouterState>('core-router');

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { addAbortableListener } from './listener';

export class ClickOutsideController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private ctrl: AbortController | null = null;
  active = false;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    private onOutside: (ev: Event) => void,
  ) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void { /* call activate() manually when open */ }
  hostDisconnected(): void { this.deactivate(); }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.ctrl = addAbortableListener(document, 'pointerdown', (ev) => {
      const target = ev.composedPath()[0] as Node;
      if (!this.host.contains(target)) this.onOutside(ev);
    });
  }

  deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.ctrl?.abort();
    this.ctrl = null;
  }
}

/** Plain-function variant for non-Lit hosts. Returns an abort controller. */
export function watchClickOutside(
  el: Element,
  onOutside: (ev: Event) => void,
): AbortController {
  return addAbortableListener(document, 'pointerdown', (ev) => {
    const target = ev.composedPath()[0] as Node;
    if (!el.contains(target)) onOutside(ev);
  });
}

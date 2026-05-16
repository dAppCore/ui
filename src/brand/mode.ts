// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { MutationObserverController } from '../dom/observer';

export type Mode = 'light' | 'dark' | null;

export function getMode(el: Element = document.documentElement): Mode {
  let cur: Element | null = el;
  while (cur) {
    const m = cur.getAttribute?.('data-mode');
    if (m === 'light' || m === 'dark') return m;
    cur = cur.parentElement;
  }
  return null;
}

export class ModeController implements ReactiveController {
  value: Mode;
  private observer: MutationObserverController;

  constructor(private host: ReactiveControllerHost & Element) {
    this.value = getMode(host);
    this.observer = new MutationObserverController(
      host,
      () => document.documentElement,
      { attributes: true, attributeFilter: ['data-mode'], subtree: true },
    );
    host.addController(this);
  }

  hostConnected(): void { this.refresh(); }
  hostUpdated(): void { this.refresh(); }

  private refresh(): void {
    const next = getMode(this.host);
    if (next !== this.value) {
      this.value = next;
      this.host.requestUpdate();
    }
  }
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { MutationObserverController } from '../dom/observer';

/**
 * Walk ancestors looking for the nearest [data-brand] attribute.
 * Returns the raw string (lib stays brand-neutral; consumers register new
 * brand CSS files like brand-foo.css without touching library types) or
 * null if no ancestor sets one.
 */
export function getBrand(el: Element = document.documentElement): string | null {
  let cur: Element | null = el;
  while (cur) {
    const b = cur.getAttribute?.('data-brand');
    if (b) return b;
    cur = cur.parentElement;
  }
  return null;
}

export class BrandController implements ReactiveController {
  value: string | null;
  /** Convenience reader for --core-brand-name on the host's scope. */
  get name(): string {
    return getComputedStyle(this.host).getPropertyValue('--core-brand-name').trim().replace(/^"|"$/g, '');
  }

  private observer: MutationObserverController;

  constructor(private host: ReactiveControllerHost & Element) {
    this.value = getBrand(host);
    this.observer = new MutationObserverController(
      host,
      () => document.documentElement,
      { attributes: true, attributeFilter: ['data-brand'], subtree: true },
    );
    host.addController(this);
  }

  hostConnected(): void { this.refresh(); }
  hostUpdated(): void { this.refresh(); }

  private refresh(): void {
    const next = getBrand(this.host);
    if (next !== this.value) {
      this.value = next;
      this.host.requestUpdate();
    }
  }
}

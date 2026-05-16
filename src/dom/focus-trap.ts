// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { addAbortableListener } from './listener';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

export class FocusTrap implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private ctrl: AbortController | null = null;
  private previouslyFocused: Element | null = null;
  active = false;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void { /* call activate() manually when trap should engage */ }
  hostDisconnected(): void { this.deactivate(); }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.previouslyFocused = document.activeElement;
    const focusables = this.host.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusables.length > 0) focusables[0].focus();
    else this.host.focus({ preventScroll: true });
    this.ctrl = addAbortableListener(this.host, 'keydown', (ev) => {
      if (ev.key !== 'Tab') return;
      const list = Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (list.length === 0) { ev.preventDefault(); return; }
      const first = list[0], last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (ev.shiftKey && (active === first || !this.host.contains(active))) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && active === last) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.ctrl?.abort();
    this.ctrl = null;
    if (this.previouslyFocused instanceof HTMLElement) {
      this.previouslyFocused.focus({ preventScroll: true });
    }
    this.previouslyFocused = null;
  }
}

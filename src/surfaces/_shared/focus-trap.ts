// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.

/**
 * Pure focus-trap utility for CoreUI v0.8 surfaces.
 *
 * Used by CoreOverlayElement (overlay-element.ts) when a dialog or
 * drawer is opened in non-modal mode with the `trap` attribute present.
 * Modal dialogs opened via .showModal() get the browser's native focus
 * trap instead — this utility is only for the non-modal path.
 *
 * Usage:
 *   import { createFocusTrap } from './_shared/focus-trap';
 *   const trap = createFocusTrap(this.shadowRoot ?? this);
 *   trap.activate();   // on open
 *   trap.deactivate(); // on close
 */

export interface FocusTrap {
  activate(): void;
  deactivate(): void;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(',');

function getFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.hidden && !el.closest('[hidden]') && el.tabIndex !== -1,
  );
}

export function createFocusTrap(root: HTMLElement): FocusTrap {
  let returnFocus: Element | null = null;
  let active = false;

  function focusables(): HTMLElement[] {
    return getFocusables(root);
  }

  function onKeydown(ev: Event): void {
    if (!active) return;
    const e = ev as KeyboardEvent;
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const focused = document.activeElement as HTMLElement;
    if (e.shiftKey) {
      if (focused === first || !root.contains(focused)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (focused === last || !root.contains(focused)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return {
    // Expose _focusables as an internal helper so tests can inspect the
    // collection without simulating full keyboard events.
    // TypeScript: we cast via `any` in tests only; the public interface
    // only exposes activate/deactivate.
    // @ts-expect-error — intentional internal test hook
    _focusables: focusables,

    activate() {
      if (active) return;
      returnFocus = document.activeElement;
      active = true;
      document.addEventListener('keydown', onKeydown, true);
      const items = focusables();
      if (items.length > 0) {
        items[0].focus();
      }
    },

    deactivate() {
      if (!active) return;
      active = false;
      document.removeEventListener('keydown', onKeydown, true);
      if (returnFocus && typeof (returnFocus as HTMLElement).focus === 'function') {
        (returnFocus as HTMLElement).focus();
      }
      returnFocus = null;
    },
  };
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type FocusHandle = Element | null;

/** Capture the currently-focused element so it can be restored later. */
export function saveFocus(): FocusHandle {
  return document.activeElement;
}

/** Restore focus to a handle previously returned by saveFocus(). No-op if null. */
export function restoreFocus(handle: FocusHandle): void {
  if (handle instanceof HTMLElement) {
    handle.focus({ preventScroll: true });
  }
}

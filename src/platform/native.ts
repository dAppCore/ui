// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type NativeShell = 'wails' | 'ios-app' | 'ipados-app' | null;

/** Returns true if we're running inside a known native shell. */
export function isNativeShell(): boolean {
  return getNativeShell() !== null;
}

/**
 * Identify the host native shell, if any.
 * - Wails: `window.go` is injected by the Wails runtime.
 * - iOS/iPadOS app: WKWebView userAgent + presence of `webkit.messageHandlers`.
 */
export function getNativeShell(): NativeShell {
  const w = window as unknown as Record<string, unknown>;
  if (w.go) return 'wails';
  const wk = (w.webkit as { messageHandlers?: unknown } | undefined)?.messageHandlers;
  if (wk) {
    const ua = navigator.userAgent;
    if (/iPad/.test(ua)) return 'ipados-app';
    if (/iPhone|iPod/.test(ua)) return 'ios-app';
  }
  return null;
}

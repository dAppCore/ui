// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// Cross-platform keyboard shortcut matching. "cmd" resolves to Meta on macOS
// and Control elsewhere; key-match deliberately knows about platform/ for this.

import { getPlatform } from '../platform/platform';

export interface Shortcut {
  /** Lowercased key (e.g. "k", "enter", "arrowdown"). */
  key: string;
  /** Modifier set, normalised. */
  cmd: boolean;     // ⌘ on macOS, Ctrl elsewhere
  ctrl: boolean;    // Control specifically (NOT auto-mapped from cmd)
  shift: boolean;
  alt: boolean;
}

/**
 * Parse a shortcut like "cmd+k", "shift+ctrl+a", "alt+arrowleft".
 * Order of modifiers doesn't matter. Key is the last segment.
 */
export function parseShortcut(s: string): Shortcut {
  const parts = s.toLowerCase().split('+').map((p) => p.trim());
  const key = parts.pop() ?? '';
  const mods = new Set(parts);
  return {
    key,
    cmd: mods.has('cmd') || mods.has('mod'),
    ctrl: mods.has('ctrl'),
    shift: mods.has('shift'),
    alt: mods.has('alt') || mods.has('option'),
  };
}

/**
 * Check whether a KeyboardEvent matches a shortcut string.
 * "cmd+k" matches Meta+K on macOS and Ctrl+K elsewhere.
 */
export function matchKey(ev: KeyboardEvent, shortcut: string | Shortcut): boolean {
  const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut;
  const isMac = getPlatform() === 'macos' || getPlatform() === 'ios';
  const cmdHeld = isMac ? ev.metaKey : ev.ctrlKey;
  if (s.cmd && !cmdHeld) return false;
  if (!s.cmd && cmdHeld && !s.ctrl) return false;
  if (s.ctrl && !ev.ctrlKey) return false;
  if (s.shift !== ev.shiftKey) return false;
  if (s.alt !== ev.altKey) return false;
  return ev.key.toLowerCase() === s.key;
}

/**
 * Render a shortcut for display: "cmd+k" → "⌘K" on macOS, "Ctrl+K" elsewhere.
 */
export function formatShortcut(shortcut: string | Shortcut): string {
  const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut;
  const isMac = getPlatform() === 'macos' || getPlatform() === 'ios';
  const parts: string[] = [];
  if (s.cmd)   parts.push(isMac ? '⌘' : 'Ctrl');
  if (s.ctrl)  parts.push(isMac ? '⌃' : 'Ctrl');
  if (s.alt)   parts.push(isMac ? '⌥' : 'Alt');
  if (s.shift) parts.push(isMac ? '⇧' : 'Shift');
  parts.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
  return isMac ? parts.join('') : parts.join('+');
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
// Default icon set — 12 essential icons shipping with CoreUI.
// All 16×16 viewBox, currentColor stroke, stroke-width 1.5, fill none
// where applicable. Single visual style across the set.

import { registerIcon, type IconEntry } from './registry';

export const DEFAULT_ICON_NAMES = [
  'check', 'x',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'plus', 'minus',
  'info', 'warning', 'danger',
  'search',
] as const;

export type DefaultIconName = typeof DEFAULT_ICON_NAMES[number];

const SVG_OPEN =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
  'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';
const SVG_CLOSE = '</svg>';

const wrap = (inner: string): string => `${SVG_OPEN}${inner}${SVG_CLOSE}`;

const DEFAULTS: Record<DefaultIconName, IconEntry> = {
  'check':           { svg: wrap('<path d="M3 8.5 L6.5 12 L13 4.5"/>'),
                       title: 'Check' },
  'x':               { svg: wrap('<path d="M4 4 L12 12 M12 4 L4 12"/>'),
                       title: 'Close' },
  'chevron-up':      { svg: wrap('<path d="M4 10 L8 6 L12 10"/>'),
                       title: 'Chevron up' },
  'chevron-down':    { svg: wrap('<path d="M4 6 L8 10 L12 6"/>'),
                       title: 'Chevron down' },
  'chevron-left':    { svg: wrap('<path d="M10 4 L6 8 L10 12"/>'),
                       title: 'Chevron left' },
  'chevron-right':   { svg: wrap('<path d="M6 4 L10 8 L6 12"/>'),
                       title: 'Chevron right' },
  'plus':            { svg: wrap('<path d="M8 3 L8 13 M3 8 L13 8"/>'),
                       title: 'Add' },
  'minus':           { svg: wrap('<path d="M3 8 L13 8"/>'),
                       title: 'Remove' },
  'info':            { svg: wrap(
                         '<circle cx="8" cy="8" r="6.5"/>' +
                         '<path d="M8 11 L8 7.5"/>' +
                         '<circle cx="8" cy="5.2" r="0.1" fill="currentColor"/>'),
                       title: 'Info' },
  'warning':         { svg: wrap(
                         '<path d="M8 2 L14 13 L2 13 Z"/>' +
                         '<path d="M8 6 L8 9.5"/>' +
                         '<circle cx="8" cy="11.5" r="0.1" fill="currentColor"/>'),
                       title: 'Warning' },
  'danger':          { svg: wrap(
                         '<circle cx="8" cy="8" r="6.5"/>' +
                         '<path d="M5 5 L11 11 M11 5 L5 11"/>'),
                       title: 'Danger' },
  'search':          { svg: wrap(
                         '<circle cx="7" cy="7" r="4.5"/>' +
                         '<path d="M10.5 10.5 L13 13"/>'),
                       title: 'Search' },
};

/**
 * Register all 12 default icons. Idempotent — calling twice is a no-op
 * (registerIcon is last-write-wins, so a second call simply overwrites
 * with the same values).
 *
 * Imported as a side-effect by `src/primitives/icon.ts`; consumers
 * importing the icon custom element get the defaults for free.
 */
export function registerDefaultIcons(): void {
  for (const name of DEFAULT_ICON_NAMES) {
    registerIcon(name, DEFAULTS[name]);
  }
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.

/**
 * Standardised `part="…"` vocabulary used across CoreUI primitives.
 *
 * Skin layers target these via attribute selectors (light-DOM-faithful):
 *
 *   core-button [part="base"] { … }
 *   core-pill [part="icon-leading"] { … }
 *
 * (NOT `core-button::part(base)` — that pseudo-element is Shadow-DOM-only,
 * and CoreUI primitives are light DOM.)
 *
 * Per-component additional parts can be introduced where the standard
 * vocabulary doesn't fit; the names below are the canonical reusable set.
 */
export const PART = {
  /** The outer styled wrapper — every primitive has this. */
  BASE: 'base',
  /** User-visible text portion. */
  LABEL: 'label',
  /** Slotted or inline icon adjacent to label. */
  ICON_LEADING: 'icon-leading',
  ICON_TRAILING: 'icon-trailing',
  /** State-bearing visual (dot fill, switch thumb, etc.). */
  INDICATOR: 'indicator',
  /** Linear background channel (toggle, slider, sparkline). */
  TRACK: 'track',
  /** Movable indicator over a track. */
  THUMB: 'thumb',
  /** Individual interactive control inside a primitive (e.g. each window-controls button). */
  CONTROL: 'control',
  /** Data point markers on a sparkline. */
  MARKER: 'marker',
} as const;

export type PartName = typeof PART[keyof typeof PART];

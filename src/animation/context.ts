// SPDX-Licence-Identifier: EUPL-1.2
// Ported from: core/ide/frontend/lit/src/elements/animation/context.ts (2026-05-07).
// Context keys renamed from "lethean-timeline" / "lethean-sprite" to
// "core-timeline" / "core-sprite" for the brand-neutral identity.

import { createContext } from '@lit/context';

export interface TimelineState {
  time: number;       // current playhead in seconds
  duration: number;   // total stage duration
  playing: boolean;
  // Imperative seeks — only the stage mutates these; sprites read-only.
  setTime?: (t: number) => void;
  setPlaying?: (p: boolean) => void;
}

export interface SpriteState {
  localTime: number;  // seconds since sprite's start
  progress: number;   // 0..1 across the sprite's window (clamped)
  duration: number;   // sprite's window duration (end - start)
  visible: boolean;
}

export const timelineContext = createContext<TimelineState>('core-timeline');
export const spriteContext = createContext<SpriteState>('core-sprite');

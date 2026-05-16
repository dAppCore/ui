// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { timelineContext, spriteContext, type TimelineState, type SpriteState } from './context';

describe('animation context — keys + shapes', () => {
  it('exports the timeline context with the core-* key', () => {
    expect(String(timelineContext)).toContain('core-timeline');
  });
  it('exports the sprite context with the core-* key', () => {
    expect(String(spriteContext)).toContain('core-sprite');
  });
  it('TimelineState shape compiles', () => {
    const s: TimelineState = { time: 0, duration: 10, playing: false };
    expect(s.time).toBe(0);
  });
  it('SpriteState shape compiles', () => {
    const s: SpriteState = { localTime: 0, progress: 0, duration: 1, visible: true };
    expect(s.visible).toBe(true);
  });
});

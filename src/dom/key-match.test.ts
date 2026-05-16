// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { parseShortcut, matchKey, formatShortcut } from './key-match';

vi.mock('../platform/platform', () => ({ getPlatform: () => 'macos' }));

describe('parseShortcut', () => {
  it('parses cmd+k', () => {
    const s = parseShortcut('cmd+k');
    expect(s.cmd).toBe(true);
    expect(s.key).toBe('k');
  });
  it('parses shift+ctrl+a', () => {
    const s = parseShortcut('shift+ctrl+a');
    expect(s.shift && s.ctrl).toBe(true);
  });
  it('accepts "mod" as alias for cmd', () => {
    expect(parseShortcut('mod+k').cmd).toBe(true);
  });
});

describe('matchKey (macOS context)', () => {
  it('matches cmd+k via metaKey', () => {
    const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(matchKey(ev, 'cmd+k')).toBe(true);
  });
  it('rejects when modifier missing', () => {
    const ev = new KeyboardEvent('keydown', { key: 'k' });
    expect(matchKey(ev, 'cmd+k')).toBe(false);
  });
});

describe('formatShortcut (macOS context)', () => {
  it('renders ⌘K', () => {
    expect(formatShortcut('cmd+k')).toBe('⌘K');
  });
  it('renders ⇧⌘P', () => {
    expect(formatShortcut('shift+cmd+p')).toContain('⌘');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { describe, it, expect, beforeEach } from 'vitest';
import { listIcons, unregisterIcon, getIcon } from './registry';
import { registerDefaultIcons, DEFAULT_ICON_NAMES } from './defaults';

describe('default icon set', () => {
  beforeEach(() => {
    // Clean state.
    for (const name of listIcons()) unregisterIcon(name);
  });

  it('exposes 12 default icon names', () => {
    expect(DEFAULT_ICON_NAMES).toHaveLength(12);
    expect(DEFAULT_ICON_NAMES).toContain('check');
    expect(DEFAULT_ICON_NAMES).toContain('x');
    expect(DEFAULT_ICON_NAMES).toContain('chevron-up');
    expect(DEFAULT_ICON_NAMES).toContain('chevron-down');
    expect(DEFAULT_ICON_NAMES).toContain('chevron-left');
    expect(DEFAULT_ICON_NAMES).toContain('chevron-right');
    expect(DEFAULT_ICON_NAMES).toContain('plus');
    expect(DEFAULT_ICON_NAMES).toContain('minus');
    expect(DEFAULT_ICON_NAMES).toContain('info');
    expect(DEFAULT_ICON_NAMES).toContain('warning');
    expect(DEFAULT_ICON_NAMES).toContain('danger');
    expect(DEFAULT_ICON_NAMES).toContain('search');
  });

  it('registerDefaultIcons populates the registry with all 12', () => {
    registerDefaultIcons();
    for (const name of DEFAULT_ICON_NAMES) {
      const entry = getIcon(name);
      expect(entry, `icon "${name}" should be registered`).not.toBeNull();
      expect(entry?.svg).toContain('<svg');
      expect(entry?.svg).toContain('viewBox="0 0 16 16"');
    }
  });

  it('every default icon uses currentColor stroke for theming', () => {
    registerDefaultIcons();
    for (const name of DEFAULT_ICON_NAMES) {
      const svg = getIcon(name)?.svg ?? '';
      expect(svg, `icon "${name}" should use currentColor`).toContain('currentColor');
    }
  });

  it('every default icon has a title for a11y fallback', () => {
    registerDefaultIcons();
    for (const name of DEFAULT_ICON_NAMES) {
      const entry = getIcon(name);
      expect(entry?.title, `icon "${name}" should have a title`).toBeTruthy();
    }
  });

  it('is idempotent — calling registerDefaultIcons twice is safe', () => {
    registerDefaultIcons();
    registerDefaultIcons();
    expect(listIcons()).toHaveLength(12);
  });
});

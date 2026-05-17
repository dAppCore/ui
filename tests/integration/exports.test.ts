// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';

describe('exports smoke test — every package.json subpath imports cleanly', () => {
  it('@dappcore/ui (root)', async () => {
    const m = await import('../../index');
    expect(typeof m).toBe('object');
    // Spot-check that the star-export chain works.
    expect(typeof (m as any).parseColour).toBe('function');
  });
  it('./colour', async () => {
    const m = await import('../../src/colour/index');
    expect(typeof m.parseColour).toBe('function');
  });
  it('./math', async () => {
    const m = await import('../../src/math/index');
    expect(typeof m.Easing).toBe('object');
    expect(typeof m.clamp).toBe('function');
  });
  it('./animation', async () => {
    const m = await import('../../src/animation/index');
    expect(m.timelineContext).toBeDefined();
  });
  it('./dom', async () => {
    const m = await import('../../src/dom/index');
    expect(typeof m.FocusTrap).toBe('function');
  });
  it('./a11y', async () => {
    const m = await import('../../src/a11y/index');
    expect(typeof m.announce).toBe('function');
  });
  it('./platform', async () => {
    const m = await import('../../src/platform/index');
    expect(typeof m.getPlatform).toBe('function');
  });
  it('./brand', async () => {
    const m = await import('../../src/brand/index');
    expect(typeof m.getBrand).toBe('function');
  });
  it('./forms (v0.7 primitives bundled)', async () => {
    const m = await import('../../src/forms/index');
    // Tier 1 (v0.2)
    expect(typeof (m as any).CoreForm).toBe('function');
    expect(typeof (m as any).CoreField).toBe('function');
    // Tier 2 (v0.7)
    expect(typeof (m as any).CoreFormElement).toBe('function');
    expect(typeof (m as any).CoreInput).toBe('function');
    expect(typeof (m as any).CoreTextarea).toBe('function');
    expect(typeof (m as any).CoreSelect).toBe('function');
    expect(typeof (m as any).CoreCheckbox).toBe('function');
    expect(typeof (m as any).CoreRadio).toBe('function');
    expect(typeof (m as any).CoreRadioGroup).toBe('function');
  });

  it.each([
    '_shared/form-element', 'input', 'textarea', 'select',
    'checkbox', 'radio', 'radio-group',
  ])('./forms/%s individual subpath', async (name) => {
    const m = await import(`../../src/forms/${name}`);
    expect(typeof m).toBe('object');
  });
  it('./primitives', async () => {
    const m = await import('../../src/primitives/index');
    expect(typeof (m as any).CoreButton).toBe('function');
    expect(typeof (m as any).registerIcon).toBe('function');
  });
});

describe('exports smoke test — every CSS subpath loads as raw text', () => {
  it('tokens.css', async () => {
    const css = await import('../../src/tokens/tokens.css?raw');
    expect(css.default).toContain('--core-brand-500');
  });
  it('tokens/index.css', async () => {
    const css = await import('../../src/tokens/index.css?raw');
    expect(css.default).toContain('@import');
  });
  it('tokens/tailwind.css', async () => {
    const css = await import('../../src/tokens/tailwind.css?raw');
    expect(css.default).toContain('@theme');
  });
  it.each([
    'brand-hostuk', 'brand-lethean', 'brand-ofm',
    'platform-darwin', 'platform-ios',
  ])('tokens/%s.css', async (name) => {
    const css = await import(`../../src/tokens/${name}.css?raw`);
    expect(css.default.length).toBeGreaterThan(0);
  });
  it('primitives/index.css', async () => {
    const css = await import('../../src/primitives/index.css?raw');
    expect(css.default).toContain('@import');
  });
  it.each([
    'button', 'toggle', 'status-dot', 'pill', 'icon',
    'label', 'card', 'glass', 'window-controls', 'rail', 'sparkline',
    'router', 'route', 'link',
  ])('primitives/%s.css', async (name) => {
    const css = await import(`../../src/primitives/${name}.css?raw`);
    expect(css.default.length).toBeGreaterThan(0);
  });
});

// ── v0.8 surfaces ───────────────────────────────────────────────────────────

describe('@dappcore/ui/surfaces exports', () => {
  it('./surfaces — CoreDialog class resolves', async () => {
    const { CoreDialog } = await import('../../src/surfaces/index');
    expect(typeof CoreDialog).toBe('function');
  });

  it('./surfaces — CoreDrawer class resolves', async () => {
    const { CoreDrawer } = await import('../../src/surfaces/index');
    expect(typeof CoreDrawer).toBe('function');
  });

  it('./surfaces — CorePopover class resolves', async () => {
    const { CorePopover } = await import('../../src/surfaces/index');
    expect(typeof CorePopover).toBe('function');
  });

  it('./surfaces — CoreTooltip class resolves', async () => {
    const { CoreTooltip } = await import('../../src/surfaces/index');
    expect(typeof CoreTooltip).toBe('function');
  });

  it('./surfaces/_shared/overlay-element — CoreOverlayElement resolves', async () => {
    const { CoreOverlayElement } = await import('../../src/surfaces/_shared/overlay-element');
    expect(typeof CoreOverlayElement).toBe('function');
  });

  it('./surfaces/_shared/anchored-element — CoreAnchoredElement resolves', async () => {
    const { CoreAnchoredElement } = await import('../../src/surfaces/_shared/anchored-element');
    expect(typeof CoreAnchoredElement).toBe('function');
  });

  it('./surfaces/_shared/focus-trap — createFocusTrap resolves', async () => {
    const { createFocusTrap } = await import('../../src/surfaces/_shared/focus-trap');
    expect(typeof createFocusTrap).toBe('function');
  });

  it('./surfaces/_shared/anchor-position — supportsAnchorPositioning resolves', async () => {
    const { supportsAnchorPositioning } = await import('../../src/surfaces/_shared/anchor-position');
    expect(typeof supportsAnchorPositioning).toBe('function');
  });

  it('./surfaces/_shared/anchor-position — computePosition resolves', async () => {
    const { computePosition } = await import('../../src/surfaces/_shared/anchor-position');
    expect(typeof computePosition).toBe('function');
  });
});

// ── v0.4 tabs exports ────────────────────────────────────────────────────────

describe('@dappcore/ui/tabs exports', () => {
  it('exports ./tabs barrel (CoreTabs, CoreTab, CoreTabpanel)', async () => {
    const mod = await import('../../src/tabs/index');
    expect(typeof mod.CoreTabs).toBe('function');
    expect(typeof mod.CoreTab).toBe('function');
    expect(typeof mod.CoreTabpanel).toBe('function');
  });

  it('exports ./tabs/tabs', async () => {
    const mod = await import('../../src/tabs/tabs');
    expect(typeof mod.CoreTabs).toBe('function');
  });

  it('exports ./tabs/tab', async () => {
    const mod = await import('../../src/tabs/tab');
    expect(typeof mod.CoreTab).toBe('function');
  });

  it('exports ./tabs/tabpanel', async () => {
    const mod = await import('../../src/tabs/tabpanel');
    expect(typeof mod.CoreTabpanel).toBe('function');
  });
});

// ── menu (v0.9) ──────────────────────────────────────────────────────────────

it('@dappcore/ui/menu barrel exports CoreMenu, CoreMenuitem, CoreMenuSeparator', async () => {
  const mod = await import('../../src/menu/index');
  expect(typeof mod.CoreMenu).toBe('function');
  expect(typeof mod.CoreMenuitem).toBe('function');
  expect(typeof mod.CoreMenuSeparator).toBe('function');
});

it('@dappcore/ui/menu/menu exports CoreMenu', async () => {
  const mod = await import('../../src/menu/menu');
  expect(typeof mod.CoreMenu).toBe('function');
});

it('@dappcore/ui/menu/menuitem exports CoreMenuitem', async () => {
  const mod = await import('../../src/menu/menuitem');
  expect(typeof mod.CoreMenuitem).toBe('function');
});

it('@dappcore/ui/menu/menu-separator exports CoreMenuSeparator', async () => {
  const mod = await import('../../src/menu/menu-separator');
  expect(typeof mod.CoreMenuSeparator).toBe('function');
});

// ── v0.3 data-table exports ──────────────────────────────────────────────────

describe('@dappcore/ui/data-table exports', () => {
  it('exports ./data-table barrel', async () => {
    const mod = await import('../../src/data-table/index');
    expect(typeof mod.CoreDataTable).toBe('function');
    expect(typeof mod.CoreColumn).toBe('function');
  });

  it('exports ./data-table/column', async () => {
    const mod = await import('../../src/data-table/column');
    expect(typeof mod.CoreColumn).toBe('function');
  });

  it('exports ./data-table/data-table', async () => {
    const mod = await import('../../src/data-table/data-table');
    expect(typeof mod.CoreDataTable).toBe('function');
  });

  it('exports ./data-table/_shared/sort', async () => {
    const mod = await import('../../src/data-table/_shared/sort');
    expect(typeof mod.getComparator).toBe('function');
    expect(typeof mod.sortRows).toBe('function');
  });

  it('exports ./data-table/_shared/pagination', async () => {
    const mod = await import('../../src/data-table/_shared/pagination');
    expect(typeof mod.pageCount).toBe('function');
    expect(typeof mod.pageSlice).toBe('function');
    expect(typeof mod.pageWindow).toBe('function');
  });
});

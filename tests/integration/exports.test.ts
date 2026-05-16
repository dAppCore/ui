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
});

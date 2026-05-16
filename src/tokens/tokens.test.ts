// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

function readVar(name: string, scope: Element = document.documentElement): string {
  return getComputedStyle(scope).getPropertyValue(name).trim();
}

describe('core tokens — brand-neutral defaults', () => {
  beforeEach(async () => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    const css = await import('./tokens.css?raw');
    const style = document.createElement('style');
    style.textContent = css.default;
    document.head.appendChild(style);
  });

  it('exposes neutral brand scale at :root', () => {
    expect(readVar('--core-brand-500')).toMatch(/oklch\(/);
    expect(readVar('--core-brand-hue')).toBe('285');
    expect(readVar('--core-brand-name')).toContain('Core');
  });

  it('exposes ink, fg, line, state, radii, shadow, font tokens', () => {
    expect(readVar('--core-ink-0')).toMatch(/oklch\(/);
    expect(readVar('--core-fg-0')).toMatch(/oklch\(/);
    expect(readVar('--core-line-2')).toMatch(/color-mix/);
    expect(readVar('--core-success-500')).toMatch(/oklch\(/);
    expect(readVar('--core-radius-md')).toBe('8px');
    expect(readVar('--core-shadow-2')).toContain('rgba');
    expect(readVar('--core-font-sans')).toContain('Geist');
  });
});

describe('core tokens — manual mode override wins over media query', () => {
  beforeEach(async () => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    const css = await import('./tokens.css?raw');
    const style = document.createElement('style');
    style.textContent = css.default;
    document.head.appendChild(style);
  });

  it('flips ink scale when [data-mode="dark"] is set on root', () => {
    const light = readVar('--core-ink-0');
    document.documentElement.setAttribute('data-mode', 'dark');
    const dark = readVar('--core-ink-0');
    expect(dark).not.toBe(light);
    document.documentElement.removeAttribute('data-mode');
  });
});

describe('core tokens — brand switching via [data-brand]', () => {
  beforeEach(async () => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    // `?raw` imports return CSS as a literal string — @import directives
    // inside that string are never resolved by any runtime. Compose the
    // stylesheet manually by loading each component file in parallel.
    const [tokens, brandHostuk, brandLethean, brandOfm, platformDarwin, platformIos] = await Promise.all([
      import('./tokens.css?raw'),
      import('./brand-hostuk.css?raw'),
      import('./brand-lethean.css?raw'),
      import('./brand-ofm.css?raw'),
      import('./platform-darwin.css?raw'),
      import('./platform-ios.css?raw'),
    ]);
    const style = document.createElement('style');
    style.textContent = [
      tokens.default,
      brandHostuk.default,
      brandLethean.default,
      brandOfm.default,
      platformDarwin.default,
      platformIos.default,
    ].join('\n');
    document.head.appendChild(style);
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-brand');
  });

  it('flips brand hue when [data-brand="lethean"] set', () => {
    const neutral = readVar('--core-brand-hue');
    document.documentElement.setAttribute('data-brand', 'lethean');
    expect(readVar('--core-brand-hue')).toBe('270');
    expect(readVar('--core-brand-name')).toContain('Lethean');
    expect(readVar('--core-brand-500')).not.toBe(neutral);
  });

  it('flips brand to hostuk', () => {
    document.documentElement.setAttribute('data-brand', 'hostuk');
    expect(readVar('--core-brand-hue')).toBe('305');
    expect(readVar('--core-brand-name')).toContain('Host UK');
  });

  it('flips brand to ofm', () => {
    document.documentElement.setAttribute('data-brand', 'ofm');
    expect(readVar('--core-brand-hue')).toBe('28');
    expect(readVar('--core-brand-name')).toContain('OFM');
  });
});

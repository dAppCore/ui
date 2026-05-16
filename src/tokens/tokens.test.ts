// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

function loadStylesheet(href: string): Promise<HTMLLinkElement> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`failed to load ${href}`));
    document.head.appendChild(link);
  });
}

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
    // happy-dom does not follow `@import` directives inside <style> blocks,
    // so we compose index.css manually from its parts. Real browsers (and
    // the published index.css consumed via <link>) resolve @import natively.
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

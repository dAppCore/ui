# CoreUI v0.2 — Utils Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `/Users/snider/Code/dappcore/ui/docs/superpowers/specs/2026-05-16-coreui-utils-extraction-design.md`

**Goal:** Rescue framework-clean utilities from `core/ide/frontend/lit/` into `@dappcore/ui` as the v0.2 layer (tokens, colour, math, animation context, DOM, a11y, platform, brand) before the Lit UI in core/ide is retired.

**Architecture:** Eight new subdirs under `src/`, all additive (existing `crypto/`, `formatters/`, `forms/` untouched). Brand-neutral by default — every brand selection is additive over `[data-brand="…"]`. Oklch-first colour helpers. ReactiveController pattern for stateful + lifecycle-bound things (focus-trap, observers, brand/mode controllers); functions for pure reads. Tailwind v4 `@theme` bridge ships alongside raw tokens so the user's Tailwind workflow gets brand-aware utility classes (`bg-brand-500`, `rounded-md`) for free.

**Tech Stack:** Lit ^3.2.0 (existing dep), `@lit/context` ^1.1.0 (new dep), TypeScript ^5.6 strict, Vitest + happy-dom (existing test infra), W3C CSS Color Level 4 (oklch math + `color-mix`).

**Working directory:** All file paths below are relative to `/Users/snider/Code/dappcore/ui/` unless otherwise stated. The extraction *source* is `/Users/snider/Code/core/ide/frontend/lit/` and `/Users/snider/Code/core/ide/frontend/src/tokens.css` — read-only references for porting.

**Commit pacing:** 11 commits in dependency order, one per task. Conventional Commits (matches `git log` style in this repo). Co-author trailer: `Co-Authored-By: Virgil <virgil@lethean.io>`.

---

## Task 1: Extract design tokens (brand-neutral, prefers-color-scheme dark)

**Files:**
- Create: `src/tokens/tokens.css`
- Create: `src/tokens/brand-hostuk.css`
- Create: `src/tokens/brand-lethean.css`
- Create: `src/tokens/brand-ofm.css`
- Create: `src/tokens/platform-darwin.css`
- Create: `src/tokens/platform-ios.css`
- Create: `src/tokens/index.css`
- Create: `src/tokens/tokens.test.ts`
- Reference: `/Users/snider/Code/core/ide/frontend/src/tokens.css` (source palette)

### Steps

- [ ] **Step 1.1: Create the tokens directory**

```bash
mkdir -p src/tokens
```

- [ ] **Step 1.2: Write `src/tokens/tokens.test.ts` (failing — file doesn't exist yet)**

```ts
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
```

- [ ] **Step 1.3: Run test, confirm failure**

```bash
npx vitest run src/tokens/tokens.test.ts
```

Expected: FAIL (module not found — `tokens.css` doesn't exist yet).

- [ ] **Step 1.4: Write `src/tokens/tokens.css` — brand-neutral `:root` + dark via media query + `[data-mode]` overrides**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* New for @dappcore/ui v0.2 — adapted from core/ide/frontend/src/tokens.css
   (2026-05-07). Brand-neutral, prefers-color-scheme dark, [data-mode] override. */

:root {
  /* ── Surface (ink-on-paper metaphor) — LIGHT defaults ── */
  --core-ink-0: oklch(0.99 0.003 285);
  --core-ink-1: oklch(0.985 0.004 285);
  --core-ink-2: oklch(0.97 0.005 285);
  --core-ink-3: oklch(0.94 0.006 285);
  --core-ink-4: oklch(0.90 0.007 285);
  --core-ink-5: oklch(0.84 0.008 285);
  --core-ink-6: oklch(0.62 0.010 285);

  /* ── Foreground — LIGHT defaults ── */
  --core-fg-0: oklch(0.18 0.012 285);
  --core-fg-1: oklch(0.28 0.012 285);
  --core-fg-2: oklch(0.42 0.010 285);
  --core-fg-3: oklch(0.54 0.010 285);
  --core-fg-4: oklch(0.66 0.010 285);

  /* ── Hairlines (color-mix derived) ── */
  --core-line-1: color-mix(in oklch, var(--core-fg-0) 6%, transparent);
  --core-line-2: color-mix(in oklch, var(--core-fg-0) 12%, transparent);
  --core-line-3: color-mix(in oklch, var(--core-fg-0) 22%, transparent);

  /* ── Brand-neutral scale (low chroma, hue anchored to surface) ── */
  --core-brand-50:  oklch(0.96 0.008 285);
  --core-brand-100: oklch(0.90 0.012 285);
  --core-brand-200: oklch(0.82 0.015 285);
  --core-brand-300: oklch(0.72 0.018 285);
  --core-brand-400: oklch(0.62 0.020 285);
  --core-brand-500: oklch(0.54 0.020 285);
  --core-brand-600: oklch(0.46 0.018 285);
  --core-brand-700: oklch(0.38 0.015 285);
  --core-brand-800: oklch(0.30 0.012 285);
  --core-brand-900: oklch(0.22 0.010 285);

  --core-brand-name: "Core";
  --core-brand-hue: 285;
  --core-brand-secondary: var(--core-brand-400);

  /* ── Accent tints (always available; consumed by brand or state badges) ── */
  --core-gold-300: oklch(0.90 0.110 88);
  --core-gold-400: oklch(0.84 0.130 88);
  --core-gold-500: oklch(0.76 0.135 80);
  --core-gold-600: oklch(0.66 0.135 70);
  --core-ember-400: oklch(0.78 0.140 55);
  --core-ember-500: oklch(0.70 0.155 50);
  --core-ember-600: oklch(0.60 0.155 45);

  /* ── State colours ── */
  --core-success-400: oklch(0.78 0.110 165);
  --core-success-500: oklch(0.68 0.115 165);
  --core-warning-400: oklch(0.82 0.115 78);
  --core-warning-500: oklch(0.74 0.130 70);
  --core-danger-400:  oklch(0.74 0.140 22);
  --core-danger-500:  oklch(0.64 0.150 22);
  --core-info-400:    oklch(0.78 0.090 230);
  --core-info-500:    oklch(0.68 0.105 230);

  /* ── Radii ── */
  --core-radius-xs: 4px;
  --core-radius-sm: 6px;
  --core-radius-md: 8px;
  --core-radius-lg: 12px;
  --core-radius-xl: 16px;
  --core-radius-2xl: 22px;
  --core-radius-pill: 999px;

  /* ── Shadows — LIGHT defaults ── */
  --core-shadow-1: 0 1px 0 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(20,18,30,.06);
  --core-shadow-2: 0 1px 0 0 rgba(255,255,255,.6) inset, 0 4px 14px rgba(20,18,30,.08);
  --core-shadow-3: 0 1px 0 0 rgba(255,255,255,.6) inset, 0 12px 40px rgba(20,18,30,.12);

  /* ── Type (recommended fonts — consumers load them themselves) ── */
  --core-font-sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --core-font-mono: "Geist Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  --core-font-serif: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  --core-font-display: var(--core-font-sans);
}

/* ── DARK via prefers-color-scheme ── */
@media (prefers-color-scheme: dark) {
  :root {
    --core-ink-0: oklch(0.14 0.012 285);
    --core-ink-1: oklch(0.18 0.012 285);
    --core-ink-2: oklch(0.22 0.013 285);
    --core-ink-3: oklch(0.26 0.014 285);
    --core-ink-4: oklch(0.32 0.014 285);
    --core-ink-5: oklch(0.42 0.012 285);
    --core-ink-6: oklch(0.55 0.010 285);

    --core-fg-0: oklch(0.97 0.005 285);
    --core-fg-1: oklch(0.88 0.006 285);
    --core-fg-2: oklch(0.74 0.008 285);
    --core-fg-3: oklch(0.60 0.008 285);
    --core-fg-4: oklch(0.48 0.008 285);

    --core-line-1: color-mix(in oklch, var(--core-fg-0) 8%, transparent);
    --core-line-2: color-mix(in oklch, var(--core-fg-0) 14%, transparent);
    --core-line-3: color-mix(in oklch, var(--core-fg-0) 22%, transparent);

    --core-shadow-1: 0 1px 0 0 var(--core-line-1) inset, 0 1px 2px rgba(0,0,0,.25);
    --core-shadow-2: 0 1px 0 0 var(--core-line-1) inset, 0 4px 14px rgba(0,0,0,.35);
    --core-shadow-3: 0 1px 0 0 var(--core-line-2) inset, 0 12px 40px rgba(0,0,0,.5);
  }
}

/* ── Manual mode overrides — win over media query ── */
:root[data-mode="dark"], [data-mode="dark"] {
  --core-ink-0: oklch(0.14 0.012 285);
  --core-ink-1: oklch(0.18 0.012 285);
  --core-ink-2: oklch(0.22 0.013 285);
  --core-ink-3: oklch(0.26 0.014 285);
  --core-ink-4: oklch(0.32 0.014 285);
  --core-ink-5: oklch(0.42 0.012 285);
  --core-ink-6: oklch(0.55 0.010 285);

  --core-fg-0: oklch(0.97 0.005 285);
  --core-fg-1: oklch(0.88 0.006 285);
  --core-fg-2: oklch(0.74 0.008 285);
  --core-fg-3: oklch(0.60 0.008 285);
  --core-fg-4: oklch(0.48 0.008 285);

  --core-line-1: color-mix(in oklch, var(--core-fg-0) 8%, transparent);
  --core-line-2: color-mix(in oklch, var(--core-fg-0) 14%, transparent);
  --core-line-3: color-mix(in oklch, var(--core-fg-0) 22%, transparent);

  --core-shadow-1: 0 1px 0 0 var(--core-line-1) inset, 0 1px 2px rgba(0,0,0,.25);
  --core-shadow-2: 0 1px 0 0 var(--core-line-1) inset, 0 4px 14px rgba(0,0,0,.35);
  --core-shadow-3: 0 1px 0 0 var(--core-line-2) inset, 0 12px 40px rgba(0,0,0,.5);
}

:root[data-mode="light"], [data-mode="light"] {
  /* Re-assert :root light values so they win over the prefers-color-scheme media query. */
  --core-ink-0: oklch(0.99 0.003 285);
  --core-ink-1: oklch(0.985 0.004 285);
  --core-ink-2: oklch(0.97 0.005 285);
  --core-ink-3: oklch(0.94 0.006 285);
  --core-ink-4: oklch(0.90 0.007 285);
  --core-ink-5: oklch(0.84 0.008 285);
  --core-ink-6: oklch(0.62 0.010 285);

  --core-fg-0: oklch(0.18 0.012 285);
  --core-fg-1: oklch(0.28 0.012 285);
  --core-fg-2: oklch(0.42 0.010 285);
  --core-fg-3: oklch(0.54 0.010 285);
  --core-fg-4: oklch(0.66 0.010 285);

  --core-shadow-1: 0 1px 0 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(20,18,30,.06);
  --core-shadow-2: 0 1px 0 0 rgba(255,255,255,.6) inset, 0 4px 14px rgba(20,18,30,.08);
  --core-shadow-3: 0 1px 0 0 rgba(255,255,255,.6) inset, 0 12px 40px rgba(20,18,30,.12);
}
```

- [ ] **Step 1.5: Run test, confirm pass**

```bash
npx vitest run src/tokens/tokens.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 1.6: Write `src/tokens/brand-hostuk.css`**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* Adapted from core/ide/frontend/src/tokens.css (2026-05-07).
   Host UK / Vi royal purple — hue 305. */

[data-brand="hostuk"] {
  --core-brand-50:  oklch(0.96 0.020 305);
  --core-brand-100: oklch(0.90 0.045 305);
  --core-brand-200: oklch(0.82 0.080 305);
  --core-brand-300: oklch(0.72 0.115 305);
  --core-brand-400: oklch(0.62 0.145 305);
  --core-brand-500: oklch(0.54 0.160 305);
  --core-brand-600: oklch(0.46 0.155 305);
  --core-brand-700: oklch(0.38 0.130 305);
  --core-brand-800: oklch(0.30 0.105 305);
  --core-brand-900: oklch(0.22 0.075 305);
  --core-brand-name: "Host UK";
  --core-brand-hue: 305;
  --core-brand-secondary: var(--core-ember-500);
}
```

- [ ] **Step 1.7: Write `src/tokens/brand-lethean.css`**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* Adapted from core/ide/frontend/src/tokens.css (2026-05-07).
   Lethean indigo — hue 270. */

[data-brand="lethean"] {
  --core-brand-50:  oklch(0.96 0.018 270);
  --core-brand-100: oklch(0.90 0.042 270);
  --core-brand-200: oklch(0.82 0.075 270);
  --core-brand-300: oklch(0.72 0.110 270);
  --core-brand-400: oklch(0.64 0.140 270);
  --core-brand-500: oklch(0.56 0.155 270);
  --core-brand-600: oklch(0.48 0.150 270);
  --core-brand-700: oklch(0.40 0.125 270);
  --core-brand-800: oklch(0.32 0.100 270);
  --core-brand-900: oklch(0.24 0.075 270);
  --core-brand-name: "Lethean";
  --core-brand-hue: 270;
  --core-brand-secondary: var(--core-info-500);
}
```

- [ ] **Step 1.8: Write `src/tokens/brand-ofm.css`**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* Adapted from core/ide/frontend/src/tokens.css (2026-05-07).
   OFM warm rose-amber — hue 28. */

[data-brand="ofm"] {
  --core-brand-50:  oklch(0.96 0.022 28);
  --core-brand-100: oklch(0.90 0.050 28);
  --core-brand-200: oklch(0.82 0.085 28);
  --core-brand-300: oklch(0.74 0.120 28);
  --core-brand-400: oklch(0.66 0.145 28);
  --core-brand-500: oklch(0.58 0.160 28);
  --core-brand-600: oklch(0.50 0.150 28);
  --core-brand-700: oklch(0.42 0.125 28);
  --core-brand-800: oklch(0.34 0.100 28);
  --core-brand-900: oklch(0.26 0.075 28);
  --core-brand-name: "OFM";
  --core-brand-hue: 28;
  --core-brand-secondary: var(--core-gold-500);
}
```

- [ ] **Step 1.9: Write `src/tokens/platform-darwin.css`**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* Adapted from core/ide/frontend/src/tokens.css (2026-05-07).
   macOS / Darwin native profile — SF Pro + tighter radii. */

[data-platform="darwin"] {
  --core-font-sans:    -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", "Helvetica Neue", sans-serif;
  --core-font-mono:    "SF Mono", ui-monospace, "Menlo", monospace;
  --core-font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro", sans-serif;

  --core-radius-xs:  3px;
  --core-radius-sm:  4px;
  --core-radius-md:  6px;
  --core-radius-lg:  8px;
  --core-radius-xl:  10px;
  --core-radius-2xl: 14px;

  --core-line-1: color-mix(in oklch, var(--core-fg-0) 7%, transparent);
  --core-line-2: color-mix(in oklch, var(--core-fg-0) 13%, transparent);
}
```

- [ ] **Step 1.10: Write `src/tokens/platform-ios.css`**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* Adapted from core/ide/frontend/src/tokens.css (2026-05-07).
   iOS / iPadOS native profile — SF Pro Text + curvier radii. */

[data-platform="ios"], [data-platform="ipad"] {
  --core-font-sans:    -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", "Helvetica Neue", sans-serif;
  --core-font-mono:    "SF Mono", ui-monospace, Menlo, monospace;
  --core-font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro", sans-serif;

  --core-radius-xs:  4px;
  --core-radius-sm:  6px;
  --core-radius-md:  10px;
  --core-radius-lg:  14px;
  --core-radius-xl:  18px;
  --core-radius-2xl: 22px;
}
```

- [ ] **Step 1.11: Write `src/tokens/index.css` (aggregator)**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* @dappcore/ui — tokens + all brands + all platforms. */

@import "./tokens.css";
@import "./brand-hostuk.css";
@import "./brand-lethean.css";
@import "./brand-ofm.css";
@import "./platform-darwin.css";
@import "./platform-ios.css";
```

- [ ] **Step 1.12: Add brand-switching test to `src/tokens/tokens.test.ts`**

Append this `describe` block at the bottom of `src/tokens/tokens.test.ts`:

```ts
describe('core tokens — brand switching via [data-brand]', () => {
  beforeEach(async () => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    const css = await import('./index.css?raw');
    const style = document.createElement('style');
    style.textContent = css.default;
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
```

- [ ] **Step 1.13: Run all tokens tests, confirm pass**

```bash
npx vitest run src/tokens/tokens.test.ts
```

Expected: 6 passing tests (3 from earlier + 3 brand-switching).

- [ ] **Step 1.14: Commit**

```bash
git add src/tokens/
git commit -m "$(cat <<'EOF'
feat(tokens): extract core-* design tokens from core/ide

Brand-neutral :root with prefers-color-scheme dark + [data-mode]
override. Three opt-in brand files (hostuk hue 305, lethean hue 270,
ofm hue 28) and two platform profiles (darwin, ios/ipad). index.css
aggregates the lot.

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 2: Tailwind v4 `@theme` bridge

**Files:**
- Create: `src/tokens/tailwind.css`
- Create: `tests/integration/tailwind/fixture.html`
- Create: `tests/integration/tailwind/tailwind.test.ts`

### Steps

- [ ] **Step 2.1: Write `src/tokens/tailwind.css`**

```css
/* SPDX-Licence-Identifier: EUPL-1.2 */
/* @dappcore/ui — Tailwind v4 @theme bridge. Wraps the core tokens so
   utility classes (bg-brand-500, rounded-md, font-sans, shadow-2) work
   natively while [data-brand] / [data-mode] switching still flows
   through via late-bound var() resolution. */

@import "./index.css";

@theme {
  /* Brand scale → bg-brand-*, text-brand-*, border-brand-*, ring-brand-* */
  --color-brand-50:  var(--core-brand-50);
  --color-brand-100: var(--core-brand-100);
  --color-brand-200: var(--core-brand-200);
  --color-brand-300: var(--core-brand-300);
  --color-brand-400: var(--core-brand-400);
  --color-brand-500: var(--core-brand-500);
  --color-brand-600: var(--core-brand-600);
  --color-brand-700: var(--core-brand-700);
  --color-brand-800: var(--core-brand-800);
  --color-brand-900: var(--core-brand-900);

  /* Foreground → text-fg-*, bg-fg-* */
  --color-fg-0: var(--core-fg-0);
  --color-fg-1: var(--core-fg-1);
  --color-fg-2: var(--core-fg-2);
  --color-fg-3: var(--core-fg-3);
  --color-fg-4: var(--core-fg-4);

  /* Surface (ink) → bg-ink-* */
  --color-ink-0: var(--core-ink-0);
  --color-ink-1: var(--core-ink-1);
  --color-ink-2: var(--core-ink-2);
  --color-ink-3: var(--core-ink-3);
  --color-ink-4: var(--core-ink-4);
  --color-ink-5: var(--core-ink-5);
  --color-ink-6: var(--core-ink-6);

  /* Hairlines → border-line-*, bg-line-* */
  --color-line-1: var(--core-line-1);
  --color-line-2: var(--core-line-2);
  --color-line-3: var(--core-line-3);

  /* State colours */
  --color-success-400: var(--core-success-400);
  --color-success-500: var(--core-success-500);
  --color-warning-400: var(--core-warning-400);
  --color-warning-500: var(--core-warning-500);
  --color-danger-400:  var(--core-danger-400);
  --color-danger-500:  var(--core-danger-500);
  --color-info-400:    var(--core-info-400);
  --color-info-500:    var(--core-info-500);

  /* Accent tints */
  --color-gold-300:  var(--core-gold-300);
  --color-gold-400:  var(--core-gold-400);
  --color-gold-500:  var(--core-gold-500);
  --color-gold-600:  var(--core-gold-600);
  --color-ember-400: var(--core-ember-400);
  --color-ember-500: var(--core-ember-500);
  --color-ember-600: var(--core-ember-600);

  /* Radii → rounded-* */
  --radius-xs:   var(--core-radius-xs);
  --radius-sm:   var(--core-radius-sm);
  --radius-md:   var(--core-radius-md);
  --radius-lg:   var(--core-radius-lg);
  --radius-xl:   var(--core-radius-xl);
  --radius-2xl:  var(--core-radius-2xl);
  --radius-full: var(--core-radius-pill);

  /* Fonts → font-* */
  --font-sans:    var(--core-font-sans);
  --font-mono:    var(--core-font-mono);
  --font-serif:   var(--core-font-serif);
  --font-display: var(--core-font-display);

  /* Shadows → shadow-* */
  --shadow-1: var(--core-shadow-1);
  --shadow-2: var(--core-shadow-2);
  --shadow-3: var(--core-shadow-3);
}
```

- [ ] **Step 2.2: Smoke-test that the file parses (no syntax error)**

Add to `src/tokens/tokens.test.ts`:

```ts
describe('tailwind.css — bridge file', () => {
  it('imports without throwing', async () => {
    const css = await import('./tailwind.css?raw');
    expect(css.default).toContain('@theme');
    expect(css.default).toContain('--color-brand-500');
    expect(css.default).toContain('var(--core-brand-500)');
  });
});
```

- [ ] **Step 2.3: Run tests, confirm pass**

```bash
npx vitest run src/tokens/tokens.test.ts
```

Expected: 7 passing tests (6 from Task 1 + 1 from bridge smoke test).

- [ ] **Step 2.4: Commit**

```bash
git add src/tokens/tailwind.css src/tokens/tokens.test.ts
git commit -m "$(cat <<'EOF'
feat(tokens): tailwind v4 @theme bridge

Wraps --core-* tokens in Tailwind's expected namespaces (--color-*,
--radius-*, --font-*, --shadow-*) so utility classes like
bg-brand-500, rounded-md, font-sans, shadow-2 work natively. Brand
switching via [data-brand] still flows through because Tailwind
binds via var() indirection.

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 3: Oklch-first colour helpers

**Files:**
- Create: `src/colour/types.ts`
- Create: `src/colour/parse.ts` + `src/colour/parse.test.ts`
- Create: `src/colour/convert.ts` + `src/colour/convert.test.ts`
- Create: `src/colour/rotate.ts` + `src/colour/rotate.test.ts`
- Create: `src/colour/mix.ts` + `src/colour/mix.test.ts`
- Create: `src/colour/contrast.ts` + `src/colour/contrast.test.ts`
- Create: `src/colour/resolve.ts` + `src/colour/resolve.test.ts`
- Create: `src/colour/index.ts`

### Steps

- [ ] **Step 3.1: Create the colour directory**

```bash
mkdir -p src/colour
```

- [ ] **Step 3.2: Write `src/colour/types.ts` (shared `Colour` shape, no tests needed)**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

/**
 * Internal oklch representation used by every colour helper.
 *   l: 0..1 (lightness, perceptual)
 *   c: 0..~0.4 (chroma; sRGB rarely exceeds 0.37)
 *   h: 0..360 (hue, degrees)
 *   alpha: 0..1
 */
export interface Colour {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export interface RGB { r: number; g: number; b: number; alpha: number }
export interface HSL { h: number; s: number; l: number; alpha: number }
```

- [ ] **Step 3.3: Write `src/colour/parse.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { parseColour, formatOklch } from './parse';

describe('parseColour', () => {
  it('parses oklch() with alpha', () => {
    const c = parseColour('oklch(0.54 0.16 305 / 0.5)');
    expect(c.l).toBeCloseTo(0.54);
    expect(c.c).toBeCloseTo(0.16);
    expect(c.h).toBeCloseTo(305);
    expect(c.alpha).toBeCloseTo(0.5);
  });

  it('parses oklch() without alpha (defaults to 1)', () => {
    const c = parseColour('oklch(0.5 0.1 200)');
    expect(c.alpha).toBe(1);
  });

  it('parses #rrggbb hex', () => {
    const c = parseColour('#ff0000');
    expect(c.l).toBeGreaterThan(0);
    expect(c.c).toBeGreaterThan(0);
  });

  it('parses #rrggbbaa hex', () => {
    const c = parseColour('#ff000080');
    expect(c.alpha).toBeCloseTo(0.5, 1);
  });

  it('parses rgb()', () => {
    const c = parseColour('rgb(255, 0, 0)');
    expect(c.alpha).toBe(1);
  });

  it('parses hsl()', () => {
    const c = parseColour('hsl(0, 100%, 50%)');
    expect(c.h).toBeGreaterThanOrEqual(0);
  });

  it('throws on unknown format', () => {
    expect(() => parseColour('chartreuse')).toThrow();
  });
});

describe('formatOklch', () => {
  it('emits CSS-valid oklch() string', () => {
    const s = formatOklch({ l: 0.54, c: 0.16, h: 305, alpha: 1 });
    expect(s).toBe('oklch(0.54 0.16 305 / 1)');
  });

  it('preserves alpha < 1', () => {
    const s = formatOklch({ l: 0.5, c: 0.1, h: 0, alpha: 0.25 });
    expect(s).toContain('/ 0.25');
  });
});
```

- [ ] **Step 3.4: Run, confirm failure**

```bash
npx vitest run src/colour/parse.test.ts
```

Expected: FAIL (`./parse` not found).

- [ ] **Step 3.5: Write `src/colour/parse.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { Colour } from './types';
import { hexToOklch, rgbToOklch, hslToOklch } from './convert';

const OKLCH_RE = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;
const HEX_RE = /^#([0-9a-f]{3,8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i;
const HSL_RE = /^hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%(?:[,\s/]+([\d.]+%?))?\s*\)$/i;

function parsePercent(v: string | undefined, def = 1): number {
  if (v === undefined) return def;
  if (v.endsWith('%')) return parseFloat(v) / 100;
  return parseFloat(v);
}

export function parseColour(input: string): Colour {
  const s = input.trim();

  const ok = OKLCH_RE.exec(s);
  if (ok) {
    return {
      l: parsePercent(ok[1]),
      c: parseFloat(ok[2]),
      h: parseFloat(ok[3]),
      alpha: parsePercent(ok[4]),
    };
  }

  const hex = HEX_RE.exec(s);
  if (hex) return hexToOklch(s);

  const rgb = RGB_RE.exec(s);
  if (rgb) {
    return rgbToOklch({
      r: parseFloat(rgb[1]) / 255,
      g: parseFloat(rgb[2]) / 255,
      b: parseFloat(rgb[3]) / 255,
      alpha: parsePercent(rgb[4]),
    });
  }

  const hsl = HSL_RE.exec(s);
  if (hsl) {
    return hslToOklch({
      h: parseFloat(hsl[1]),
      s: parseFloat(hsl[2]) / 100,
      l: parseFloat(hsl[3]) / 100,
      alpha: parsePercent(hsl[4]),
    });
  }

  throw new Error(`parseColour: unrecognised format "${input}"`);
}

export function formatOklch(c: Colour): string {
  return `oklch(${c.l} ${c.c} ${c.h} / ${c.alpha})`;
}
```

- [ ] **Step 3.6: Write `src/colour/convert.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import {
  oklchToRgb, rgbToOklch, hexToOklch, oklchToHex, hslToOklch, oklchToHsl,
} from './convert';

describe('oklch <-> rgb round-trip', () => {
  it('round-trips a mid-saturation colour within 1 sRGB unit', () => {
    const start = { l: 0.54, c: 0.16, h: 305, alpha: 1 };
    const rgb = oklchToRgb(start);
    const back = rgbToOklch(rgb);
    expect(back.l).toBeCloseTo(start.l, 2);
    expect(back.c).toBeCloseTo(start.c, 2);
    expect(back.h).toBeCloseTo(start.h, 1);
  });

  it('gamut-clips colours outside sRGB', () => {
    const oog = { l: 0.6, c: 0.5, h: 0, alpha: 1 }; // chroma > sRGB-reachable
    const rgb = oklchToRgb(oog);
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(1);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeGreaterThanOrEqual(0);
  });
});

describe('hex <-> oklch', () => {
  it('parses #ff0000 to a red-ish oklch', () => {
    const c = hexToOklch('#ff0000');
    expect(c.l).toBeGreaterThan(0.5);
    expect(c.c).toBeGreaterThan(0.1);
    expect(c.h).toBeGreaterThan(20);
    expect(c.h).toBeLessThan(40);
  });

  it('round-trips #336699 within rounding', () => {
    const c = hexToOklch('#336699');
    const hex = oklchToHex(c);
    expect(hex.toLowerCase()).toBe('#336699');
  });

  it('parses 3-digit hex', () => {
    expect(hexToOklch('#f00').l).toBeGreaterThan(0);
  });
});

describe('hsl <-> oklch', () => {
  it('parses pure red hsl', () => {
    const c = hslToOklch({ h: 0, s: 1, l: 0.5, alpha: 1 });
    expect(c.c).toBeGreaterThan(0.1);
  });

  it('round-trips through hsl with tolerance', () => {
    const oklch = { l: 0.6, c: 0.1, h: 200, alpha: 1 };
    const hsl = oklchToHsl(oklch);
    const back = hslToOklch(hsl);
    expect(back.h).toBeCloseTo(oklch.h, 0);
  });
});
```

- [ ] **Step 3.7: Write `src/colour/convert.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// W3C CSS Color Level 4 — oklab/oklch ↔ linear sRGB ↔ sRGB ↔ hex.
import type { Colour, RGB, HSL } from './types';

/* ── sRGB ↔ linear sRGB (gamma) ── */

function gammaToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToGamma(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/* ── linear sRGB ↔ oklab ── (matrices per CSS Color 4) */

function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const lc = l_ * l_ * l_, mc = m_ * m_ * m_, sc = s_ * s_ * s_;
  return [
    +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc,
  ];
}

/* ── oklch ↔ oklab ── */

function oklchToOklab(c: Colour): [number, number, number] {
  const rad = (c.h * Math.PI) / 180;
  return [c.l, c.c * Math.cos(rad), c.c * Math.sin(rad)];
}

function oklabToOklch(L: number, a: number, b: number): { l: number; c: number; h: number } {
  const chroma = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: chroma, h };
}

/* ── gamut clipping (chroma reduction) ── */

function inGamut(r: number, g: number, b: number): boolean {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;
}

export function oklchToRgb(input: Colour): RGB {
  let { l, c, h, alpha } = input;
  // Binary-chop chroma down until the colour fits sRGB.
  let lo = 0, hi = c;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const [La, aa, ba] = oklchToOklab({ l, c: mid, h, alpha });
    const [lr, lg, lb] = oklabToLinearRgb(La, aa, ba);
    r = linearToGamma(lr); g = linearToGamma(lg); b = linearToGamma(lb);
    if (inGamut(r, g, b)) lo = mid;
    else hi = mid;
  }
  // Final clamp to handle floating noise.
  return {
    r: Math.max(0, Math.min(1, r)),
    g: Math.max(0, Math.min(1, g)),
    b: Math.max(0, Math.min(1, b)),
    alpha,
  };
}

export function rgbToOklch(rgb: RGB): Colour {
  const lr = gammaToLinear(rgb.r);
  const lg = gammaToLinear(rgb.g);
  const lb = gammaToLinear(rgb.b);
  const [L, a, b] = linearRgbToOklab(lr, lg, lb);
  const { l, c, h } = oklabToOklch(L, a, b);
  return { l, c, h, alpha: rgb.alpha };
}

/* ── hex ↔ oklch ── */

export function hexToOklch(hex: string): Colour {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
  if (h.length === 4) {
    const expanded = h.split('').map((ch) => ch + ch).join('');
    h = expanded;
  }
  if (h.length === 6) h += 'ff';
  if (h.length !== 8) throw new Error(`hexToOklch: invalid hex "${hex}"`);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = parseInt(h.slice(6, 8), 16) / 255;
  return rgbToOklch({ r, g, b, alpha: a });
}

export function oklchToHex(c: Colour): string {
  const rgb = oklchToRgb(c);
  const r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
  if (rgb.alpha >= 1) return `#${r}${g}${b}`;
  const a = Math.round(rgb.alpha * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}${a}`;
}

/* ── hsl ↔ oklch (via sRGB) ── */

function hslToRgb({ h, s, l, alpha }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1)      { r1 = c; g1 = x; b1 = 0; }
  else if (hp < 2) { r1 = x; g1 = c; b1 = 0; }
  else if (hp < 3) { r1 = 0; g1 = c; b1 = x; }
  else if (hp < 4) { r1 = 0; g1 = x; b1 = c; }
  else if (hp < 5) { r1 = x; g1 = 0; b1 = c; }
  else             { r1 = c; g1 = 0; b1 = x; }
  const m = l - c / 2;
  return { r: r1 + m, g: g1 + m, b: b1 + m, alpha };
}

function rgbToHsl({ r, g, b, alpha }: RGB): HSL {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l, alpha };
}

export function hslToOklch(hsl: HSL): Colour {
  return rgbToOklch(hslToRgb(hsl));
}

export function oklchToHsl(c: Colour): HSL {
  return rgbToHsl(oklchToRgb(c));
}
```

- [ ] **Step 3.8: Run parse + convert tests, confirm pass**

```bash
npx vitest run src/colour/parse.test.ts src/colour/convert.test.ts
```

Expected: 13 passing tests.

- [ ] **Step 3.9: Write `src/colour/rotate.test.ts` + `src/colour/rotate.ts`**

`src/colour/rotate.test.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { rotateHue, lighten, darken, adjustChroma } from './rotate';

describe('rotateHue', () => {
  it('rotates by degrees, wrapping at 360', () => {
    const c = rotateHue({ l: 0.5, c: 0.1, h: 350, alpha: 1 }, 20);
    expect(c.h).toBeCloseTo(10);
  });
  it('accepts a string input', () => {
    const c = rotateHue('oklch(0.5 0.1 100)', 50);
    expect(c.h).toBeCloseTo(150);
  });
});

describe('lighten / darken', () => {
  it('adds to L', () => {
    const c = lighten({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, 0.2);
    expect(c.l).toBeCloseTo(0.6);
  });
  it('subtracts from L', () => {
    const c = darken({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, 0.2);
    expect(c.l).toBeCloseTo(0.2);
  });
  it('clamps L to 0..1', () => {
    expect(lighten({ l: 0.9, c: 0.1, h: 0, alpha: 1 }, 0.5).l).toBe(1);
    expect(darken({ l: 0.1, c: 0.1, h: 0, alpha: 1 }, 0.5).l).toBe(0);
  });
});

describe('adjustChroma', () => {
  it('clamps at 0', () => {
    const c = adjustChroma({ l: 0.5, c: 0.05, h: 100, alpha: 1 }, -0.2);
    expect(c.c).toBe(0);
  });
});
```

`src/colour/rotate.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { Colour } from './types';
import { parseColour } from './parse';

function asColour(input: Colour | string): Colour {
  return typeof input === 'string' ? parseColour(input) : input;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function rotateHue(input: Colour | string, deg: number): Colour {
  const c = asColour(input);
  const h = (((c.h + deg) % 360) + 360) % 360;
  return { ...c, h };
}

export function lighten(input: Colour | string, amount: number): Colour {
  const c = asColour(input);
  return { ...c, l: clamp01(c.l + amount) };
}

export function darken(input: Colour | string, amount: number): Colour {
  const c = asColour(input);
  return { ...c, l: clamp01(c.l - amount) };
}

export function adjustChroma(input: Colour | string, delta: number): Colour {
  const c = asColour(input);
  return { ...c, c: Math.max(0, c.c + delta) };
}
```

Run:

```bash
npx vitest run src/colour/rotate.test.ts
```

Expected: 5 passing tests.

- [ ] **Step 3.10: Write `src/colour/mix.test.ts` + `src/colour/mix.ts`**

`src/colour/mix.test.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { mix } from './mix';

describe('mix', () => {
  it('t=0 returns a', () => {
    const a = { l: 0.4, c: 0.1, h: 100, alpha: 1 };
    const b = { l: 0.6, c: 0.2, h: 200, alpha: 1 };
    const m = mix(a, b, 0);
    expect(m.l).toBeCloseTo(0.4);
    expect(m.h).toBeCloseTo(100);
  });
  it('t=1 returns b', () => {
    const m = mix({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, { l: 0.6, c: 0.2, h: 200, alpha: 1 }, 1);
    expect(m.h).toBeCloseTo(200);
  });
  it('t=0.5 returns midpoint', () => {
    const m = mix({ l: 0.4, c: 0.1, h: 100, alpha: 1 }, { l: 0.6, c: 0.3, h: 100, alpha: 1 }, 0.5);
    expect(m.l).toBeCloseTo(0.5);
    expect(m.c).toBeCloseTo(0.2);
  });
  it('takes the shorter hue arc', () => {
    const m = mix({ l: 0.5, c: 0.1, h: 350, alpha: 1 }, { l: 0.5, c: 0.1, h: 10, alpha: 1 }, 0.5);
    // shorter arc passes through 0/360, not through 180
    expect(Math.abs(m.h)).toBeLessThan(20);
  });
});
```

`src/colour/mix.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// Perceptual mid-colour in oklch. Note: CSS color-mix(in oklch, ...) is
// native in modern browsers — prefer that in CSS contexts. This helper is
// for non-CSS sinks (canvas, SVG, animation lerp).
import type { Colour } from './types';
import { parseColour } from './parse';

function asColour(input: Colour | string): Colour {
  return typeof input === 'string' ? parseColour(input) : input;
}

export function mix(a: Colour | string, b: Colour | string, t: number): Colour {
  const ca = asColour(a), cb = asColour(b);
  // Hue: take the shorter arc.
  let dh = cb.h - ca.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = (ca.h + dh * t + 360) % 360;
  return {
    l: ca.l + (cb.l - ca.l) * t,
    c: ca.c + (cb.c - ca.c) * t,
    h,
    alpha: ca.alpha + (cb.alpha - ca.alpha) * t,
  };
}
```

Run:

```bash
npx vitest run src/colour/mix.test.ts
```

Expected: 4 passing tests.

- [ ] **Step 3.11: Write `src/colour/contrast.test.ts` + `src/colour/contrast.ts`**

`src/colour/contrast.test.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { contrastRatio, pickReadable, isLight } from './contrast';

describe('contrastRatio', () => {
  it('returns 21 for black vs white', () => {
    const r = contrastRatio('#000000', '#ffffff');
    expect(r).toBeCloseTo(21, 0);
  });
  it('returns 1 for identical colours', () => {
    expect(contrastRatio('#888888', '#888888')).toBeCloseTo(1, 1);
  });
});

describe('pickReadable', () => {
  it('picks the candidate with highest contrast vs bg', () => {
    const picked = pickReadable('#101820', ['#1a1a1a', '#eaeaea', '#808080']);
    expect(picked.l).toBeGreaterThan(0.7);
  });
});

describe('isLight', () => {
  it('returns true for near-white', () => {
    expect(isLight('#fafafa')).toBe(true);
  });
  it('returns false for near-black', () => {
    expect(isLight('#0a0a0a')).toBe(false);
  });
});
```

`src/colour/contrast.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// WCAG 2.x luminance-based contrast. (APCA deferred to a follow-up.)
import type { Colour } from './types';
import { parseColour } from './parse';
import { oklchToRgb } from './convert';

function asColour(input: Colour | string): Colour {
  return typeof input === 'string' ? parseColour(input) : input;
}

function relativeLuminance(c: Colour | string): number {
  const rgb = oklchToRgb(asColour(c));
  const channel = (v: number) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: Colour | string, b: Colour | string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function pickReadable(
  bg: Colour | string,
  candidates: Array<Colour | string>,
): Colour {
  let best: Colour | string = candidates[0];
  let bestRatio = -1;
  for (const cand of candidates) {
    const r = contrastRatio(bg, cand);
    if (r > bestRatio) { bestRatio = r; best = cand; }
  }
  return asColour(best);
}

export function isLight(c: Colour | string): boolean {
  return relativeLuminance(c) > 0.5;
}
```

Run:

```bash
npx vitest run src/colour/contrast.test.ts
```

Expected: 4 passing tests.

- [ ] **Step 3.12: Write `src/colour/resolve.test.ts` + `src/colour/resolve.ts`**

`src/colour/resolve.test.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { resolveCssVar, resolveColour } from './resolve';

describe('resolveCssVar', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--core-test', '#336699');
  });
  it('returns the computed value of a var on documentElement', () => {
    expect(resolveCssVar('--core-test')).toBe('#336699');
  });
  it('scopes to the passed element', () => {
    const el = document.createElement('div');
    el.style.setProperty('--core-test', '#aabbcc');
    document.body.appendChild(el);
    expect(resolveCssVar('--core-test', el)).toBe('#aabbcc');
  });
  it('returns empty string for missing var', () => {
    expect(resolveCssVar('--core-does-not-exist')).toBe('');
  });
});

describe('resolveColour', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--core-brand-500', 'oklch(0.54 0.16 305)');
  });
  it('parses the resolved string into a Colour', () => {
    const c = resolveColour('--core-brand-500');
    expect(c.h).toBeCloseTo(305);
  });
});
```

`src/colour/resolve.ts`:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { Colour } from './types';
import { parseColour } from './parse';

export function resolveCssVar(
  name: `--${string}`,
  scope: Element = document.documentElement,
): string {
  return getComputedStyle(scope).getPropertyValue(name).trim();
}

export function resolveColour(
  name: `--${string}`,
  scope: Element = document.documentElement,
): Colour {
  const raw = resolveCssVar(name, scope);
  if (!raw) throw new Error(`resolveColour: var ${name} is empty/unset`);
  return parseColour(raw);
}
```

Run:

```bash
npx vitest run src/colour/resolve.test.ts
```

Expected: 4 passing tests.

- [ ] **Step 3.13: Write `src/colour/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type { Colour, RGB, HSL } from './types';
export { parseColour, formatOklch } from './parse';
export {
  oklchToRgb, rgbToOklch, hexToOklch, oklchToHex, hslToOklch, oklchToHsl,
} from './convert';
export { rotateHue, lighten, darken, adjustChroma } from './rotate';
export { mix } from './mix';
export { contrastRatio, pickReadable, isLight } from './contrast';
export { resolveCssVar, resolveColour } from './resolve';
```

- [ ] **Step 3.14: Write `src/colour/colour_example_test.ts` (AX rule — runnable usage examples)**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// AX: each test is a copy-pastable usage example.
import { describe, it, expect } from 'vitest';
import {
  parseColour, formatOklch, rotateHue, lighten, mix, contrastRatio,
  pickReadable, oklchToHex,
} from './index';

describe('@dappcore/ui/colour — usage examples', () => {
  it('example: pick a readable foreground for a brand background', () => {
    const bg = parseColour('oklch(0.54 0.16 305)');
    const fg = pickReadable(bg, ['oklch(0.97 0 0)', 'oklch(0.18 0 0)']);
    expect(contrastRatio(bg, fg)).toBeGreaterThan(4.5);
  });

  it('example: derive a hover state by lightening 5%', () => {
    const base = 'oklch(0.54 0.16 305)';
    const hover = lighten(base, 0.05);
    expect(hover.l).toBeCloseTo(0.59);
  });

  it('example: build an analogous accent by rotating hue 30°', () => {
    const accent = rotateHue('oklch(0.54 0.16 305)', 30);
    expect(accent.h).toBeCloseTo(335);
  });

  it('example: lerp a colour for a canvas animation frame', () => {
    const start = 'oklch(0.4 0.1 100)';
    const end = 'oklch(0.6 0.1 200)';
    const half = mix(start, end, 0.5);
    expect(half.h).toBeCloseTo(150);
  });

  it('example: round-trip an oklch colour through hex', () => {
    const c = parseColour('oklch(0.54 0.16 305)');
    expect(oklchToHex(c)).toMatch(/^#[0-9a-f]{6}$/);
    expect(formatOklch(c)).toContain('305');
  });
});
```

Run:

```bash
npx vitest run src/colour/
```

Expected: all colour tests pass.

- [ ] **Step 3.15: Commit**

```bash
git add src/colour/
git commit -m "$(cat <<'EOF'
feat(colour): oklch-first JS helpers (parse, convert, rotate, mix, contrast, resolve)

Six modules — parse (oklch/rgb/hsl/hex string in, Colour out), convert
(oklch <-> linear sRGB <-> sRGB <-> hex with gamut clipping), rotate
(hue/lighten/darken/chroma), mix (perceptual midpoint), contrast (WCAG
2.x ratio + pickReadable + isLight), resolve (CSS var bridge).
Internal representation is oklch throughout. APCA, named colours, and
ΔE deferred.

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 4: Math utilities (port easing + new lerp/mapRange/wrap/snap)

**Files:**
- Create: `src/math/easing.ts` (port from `/Users/snider/Code/core/ide/frontend/lit/src/elements/animation/easing.ts` lines 1–76)
- Create: `src/math/interpolate.ts` (port lines 87–132 of same source)
- Create: `src/math/clamp.ts` (port `clamp` from line 78, add 4 new helpers)
- Create: `src/math/easing.test.ts`
- Create: `src/math/interpolate.test.ts`
- Create: `src/math/clamp.test.ts`
- Create: `src/math/index.ts`

### Steps

- [ ] **Step 4.1: Create the directory**

```bash
mkdir -p src/math
```

- [ ] **Step 4.2: Write `src/math/easing.ts` (direct port)**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// Ported from: core/ide/frontend/lit/src/elements/animation/easing.ts (2026-05-07).
// Easing dict + EasingFn type. Pure functions — no Lit, no DOM.
// All easings take t ∈ [0, 1] and return eased t (may overshoot for back/elastic).

export type EasingFn = (t: number) => number;

export const Easing: Record<string, EasingFn> = {
  linear: (t) => t,

  // Quad
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => { const u = t - 1; return u * u * u + 1; },
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quart
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => { const u = t - 1; return 1 - u * u * u * u; },
  easeInOutQuart: (t) => {
    if (t < 0.5) return 8 * t * t * t * t;
    const u = t - 1;
    return 1 - 8 * u * u * u * u;
  },

  // Expo
  easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};
```

- [ ] **Step 4.3: Write `src/math/easing.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { Easing } from './easing';

describe('Easing — endpoints', () => {
  const names = Object.keys(Easing);
  it.each(names)('%s(0) === 0', (name) => {
    expect(Easing[name](0)).toBeCloseTo(0, 5);
  });
  it.each(names)('%s(1) === 1', (name) => {
    expect(Easing[name](1)).toBeCloseTo(1, 5);
  });
});

describe('Easing — selected golden values', () => {
  it('linear is identity', () => {
    expect(Easing.linear(0.5)).toBe(0.5);
  });
  it('easeInQuad(0.5) = 0.25', () => {
    expect(Easing.easeInQuad(0.5)).toBeCloseTo(0.25);
  });
  it('easeOutQuad(0.5) = 0.75', () => {
    expect(Easing.easeOutQuad(0.5)).toBeCloseTo(0.75);
  });
  it('easeInOutCubic crosses 0.5 at t=0.5', () => {
    expect(Easing.easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });
});
```

Run:

```bash
npx vitest run src/math/easing.test.ts
```

Expected: all easing tests pass.

- [ ] **Step 4.4: Write `src/math/interpolate.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// Ported from: core/ide/frontend/lit/src/elements/animation/easing.ts (2026-05-07).
import { Easing, type EasingFn } from './easing';

/**
 * Popmotion-style keyframe interpolation: linearly map t across input
 * keyframes to output values, optionally easing per segment.
 *
 *   const x = interpolate([0, 0.5, 1], [0, 100, 50], Easing.easeInOutCubic);
 *   x(0.25); // → eased value between 0 and 100
 */
export function interpolate(
  input: number[],
  output: number[],
  ease: EasingFn | EasingFn[] = Easing.linear,
): EasingFn {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

export interface AnimateOpts {
  from?: number;
  to?: number;
  start?: number;
  end?: number;
  ease?: EasingFn;
}

/**
 * Simpler single-segment tween. Returns `from` before `start`, `to` after `end`.
 *
 *   const opacity = animate({ from: 0, to: 1, start: 0, end: 0.5 });
 *   opacity(0.25); // → 0.5 (eased default = easeInOutCubic)
 */
export function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic,
}: AnimateOpts = {}): EasingFn {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}
```

- [ ] **Step 4.5: Write `src/math/interpolate.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { interpolate, animate } from './interpolate';
import { Easing } from './easing';

describe('interpolate', () => {
  it('linearly maps between two keyframes', () => {
    const f = interpolate([0, 1], [0, 100]);
    expect(f(0)).toBe(0);
    expect(f(0.5)).toBe(50);
    expect(f(1)).toBe(100);
  });
  it('clamps below first keyframe', () => {
    const f = interpolate([0, 1], [10, 20]);
    expect(f(-1)).toBe(10);
  });
  it('clamps above last keyframe', () => {
    const f = interpolate([0, 1], [10, 20]);
    expect(f(2)).toBe(20);
  });
  it('supports per-segment easing arrays', () => {
    const f = interpolate([0, 0.5, 1], [0, 100, 50], [Easing.linear, Easing.easeOutQuad]);
    expect(f(0.25)).toBeCloseTo(50);
  });
});

describe('animate', () => {
  it('returns from before start', () => {
    const f = animate({ from: 0, to: 1, start: 0.2, end: 0.8 });
    expect(f(0)).toBe(0);
  });
  it('returns to after end', () => {
    const f = animate({ from: 0, to: 1, start: 0.2, end: 0.8 });
    expect(f(1)).toBe(1);
  });
  it('eases through the active window', () => {
    const f = animate({ from: 0, to: 100, ease: Easing.linear });
    expect(f(0.5)).toBeCloseTo(50);
  });
});
```

Run:

```bash
npx vitest run src/math/interpolate.test.ts
```

Expected: 7 passing tests.

- [ ] **Step 4.6: Write `src/math/clamp.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// clamp ported from: core/ide/frontend/lit/src/elements/animation/easing.ts (2026-05-07).
// lerp/mapRange/wrap/snap new for @dappcore/ui v0.2.

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

/**
 * Unclamped linear interpolation. lerp(0, 100, 0.25) === 25.
 */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/**
 * Linearly map a value from one numeric range to another.
 * mapRange(5, [0, 10], [0, 100]) === 50.
 */
export function mapRange(
  v: number,
  src: [number, number],
  dst: [number, number],
): number {
  const [a, b] = src, [c, d] = dst;
  const span = b - a;
  if (span === 0) return c;
  return c + ((v - a) / span) * (d - c);
}

/**
 * Wrap a value into [min, max) cyclically. Useful for hue rotation, angle math.
 * wrap(370, 0, 360) === 10.
 */
export function wrap(v: number, min: number, max: number): number {
  const span = max - min;
  if (span === 0) return min;
  return ((((v - min) % span) + span) % span) + min;
}

/**
 * Quantise a value to the nearest step starting from `origin` (default 0).
 * snap(7.3, 0.5) === 7.5.
 */
export function snap(v: number, step: number, origin = 0): number {
  if (step === 0) return v;
  return origin + Math.round((v - origin) / step) * step;
}
```

- [ ] **Step 4.7: Write `src/math/clamp.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { clamp, lerp, mapRange, wrap, snap } from './clamp';

describe('clamp', () => {
  it('clamps below min', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it('clamps above max', () => { expect(clamp(20, 0, 10)).toBe(10); });
  it('passes through in-range', () => { expect(clamp(5, 0, 10)).toBe(5); });
});

describe('lerp', () => {
  it('returns a at t=0', () => { expect(lerp(10, 20, 0)).toBe(10); });
  it('returns b at t=1', () => { expect(lerp(10, 20, 1)).toBe(20); });
  it('returns midpoint at t=0.5', () => { expect(lerp(10, 20, 0.5)).toBe(15); });
  it('does not clamp', () => { expect(lerp(0, 10, 2)).toBe(20); });
});

describe('mapRange', () => {
  it('maps 5 in [0,10] to 50 in [0,100]', () => {
    expect(mapRange(5, [0, 10], [0, 100])).toBe(50);
  });
  it('maps in reverse', () => {
    expect(mapRange(0, [-1, 1], [100, 0])).toBe(50);
  });
  it('returns dst[0] for zero-span src', () => {
    expect(mapRange(5, [5, 5], [10, 20])).toBe(10);
  });
});

describe('wrap', () => {
  it('wraps positive overflow', () => { expect(wrap(370, 0, 360)).toBe(10); });
  it('wraps negative underflow', () => { expect(wrap(-10, 0, 360)).toBe(350); });
  it('passes through in-range', () => { expect(wrap(180, 0, 360)).toBe(180); });
});

describe('snap', () => {
  it('snaps to nearest step', () => { expect(snap(7.3, 0.5)).toBe(7.5); });
  it('respects origin', () => { expect(snap(7.3, 0.5, 0.1)).toBe(7.1); });
  it('passes through when step=0', () => { expect(snap(7.3, 0)).toBe(7.3); });
});
```

Run:

```bash
npx vitest run src/math/clamp.test.ts
```

Expected: 14 passing tests.

- [ ] **Step 4.8: Write `src/math/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2

export type { EasingFn } from './easing';
export { Easing } from './easing';
export { interpolate, animate, type AnimateOpts } from './interpolate';
export { clamp, lerp, mapRange, wrap, snap } from './clamp';
```

- [ ] **Step 4.9: Run all math tests, confirm pass**

```bash
npx vitest run src/math/
```

Expected: all math tests pass.

- [ ] **Step 4.10: Commit**

```bash
git add src/math/
git commit -m "$(cat <<'EOF'
feat(math): port easing + add lerp/mapRange/wrap/snap

23-easing dict, interpolate (Popmotion-style keyframes), animate
(single-segment tween) all ported from core/ide. New: lerp (unclamped
2-arg), mapRange (range remap), wrap (cyclic — for hue/angle), snap
(quantise to step grid). Pure functions, no Lit, no DOM.

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 5: Animation context (port `timelineContext` + `spriteContext`)

**Files:**
- Create: `src/animation/context.ts` (port from `/Users/snider/Code/core/ide/frontend/lit/src/elements/animation/context.ts`)
- Create: `src/animation/context.test.ts`
- Create: `src/animation/index.ts`

**Pre-req:** `@lit/context` must already be installed (we add it to `package.json` deps in Task 10 — but for tests to run now, install it locally first).

### Steps

- [ ] **Step 5.1: Install `@lit/context`**

```bash
cd /Users/snider/Code/dappcore/ui
npm install --save @lit/context@^1.1.0
```

- [ ] **Step 5.2: Create the directory**

```bash
mkdir -p src/animation
```

- [ ] **Step 5.3: Write `src/animation/context.ts`**

```ts
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
```

- [ ] **Step 5.4: Write `src/animation/context.test.ts`**

```ts
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
```

- [ ] **Step 5.5: Write `src/animation/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
export {
  timelineContext, spriteContext,
  type TimelineState, type SpriteState,
} from './context';
```

- [ ] **Step 5.6: Run tests, confirm pass**

```bash
npx vitest run src/animation/
```

Expected: 4 passing tests.

- [ ] **Step 5.7: Commit**

```bash
git add src/animation/ package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat(animation): port timelineContext + spriteContext (engine deferred)

Lit @context definitions for timeline (playhead) and sprite
(localTime/progress) state. Direct port from core/ide with the
context keys renamed lethean-* -> core-*. The timeline/stage/sprite
engine itself is component-shaped and lands in the second-track
brainstorm; the published context interfaces are useful protocol
on their own.

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 6: DOM helpers (focus-trap, click-outside, key-match, listener, observers)

**Files:**
- Create: `src/dom/listener.ts` + `src/dom/listener.test.ts`
- Create: `src/dom/key-match.ts` + `src/dom/key-match.test.ts`
- Create: `src/dom/observer.ts` + `src/dom/observer.test.ts`
- Create: `src/dom/click-outside.ts` + `src/dom/click-outside.test.ts`
- Create: `src/dom/focus-trap.ts` + `src/dom/focus-trap.test.ts`
- Create: `src/dom/index.ts`

### Steps

- [ ] **Step 6.1: Create the directory**

```bash
mkdir -p src/dom
```

- [ ] **Step 6.2: Write `src/dom/listener.ts`** (foundation — used by observers and click-outside)

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

/**
 * Add an event listener that auto-removes when the passed AbortSignal aborts.
 * If no signal is passed, returns a fresh AbortController whose abort() removes
 * the listener.
 *
 *   const ctrl = addAbortableListener(window, 'resize', onResize);
 *   ctrl.abort();   // listener removed
 */
export function addAbortableListener<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  handler: (ev: WindowEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): AbortController;
export function addAbortableListener<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  handler: (ev: DocumentEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): AbortController;
export function addAbortableListener<K extends keyof HTMLElementEventMap>(
  target: Element,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): AbortController;
export function addAbortableListener(
  target: EventTarget,
  type: string,
  handler: (ev: Event) => void,
  opts: AddEventListenerOptions = {},
): AbortController {
  const ctrl = opts.signal ? null : new AbortController();
  const signal = opts.signal ?? ctrl!.signal;
  target.addEventListener(type, handler, { ...opts, signal });
  return ctrl ?? new AbortController(); // if caller passed a signal, returned ctrl is independent (unused)
}
```

- [ ] **Step 6.3: Write `src/dom/listener.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { addAbortableListener } from './listener';

describe('addAbortableListener', () => {
  it('fires the handler on event', () => {
    const handler = vi.fn();
    addAbortableListener(window, 'resize', handler);
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it('does not fire after abort()', () => {
    const handler = vi.fn();
    const ctrl = addAbortableListener(window, 'resize', handler);
    ctrl.abort();
    window.dispatchEvent(new Event('resize'));
    expect(handler).not.toHaveBeenCalled();
  });
});
```

Run:

```bash
npx vitest run src/dom/listener.test.ts
```

Expected: 2 passing tests.

- [ ] **Step 6.4: Write `src/dom/key-match.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
// Cross-platform keyboard shortcut matching. "cmd" resolves to Meta on macOS
// and Control elsewhere; key-match deliberately knows about platform/ for this.

import { getPlatform } from '../platform/platform';

export interface Shortcut {
  /** Lowercased key (e.g. "k", "enter", "arrowdown"). */
  key: string;
  /** Modifier set, normalised. */
  cmd: boolean;     // ⌘ on macOS, Ctrl elsewhere
  ctrl: boolean;    // Control specifically (NOT auto-mapped from cmd)
  shift: boolean;
  alt: boolean;
}

/**
 * Parse a shortcut like "cmd+k", "shift+ctrl+a", "alt+arrowleft".
 * Order of modifiers doesn't matter. Key is the last segment.
 */
export function parseShortcut(s: string): Shortcut {
  const parts = s.toLowerCase().split('+').map((p) => p.trim());
  const key = parts.pop() ?? '';
  const mods = new Set(parts);
  return {
    key,
    cmd: mods.has('cmd') || mods.has('mod'),
    ctrl: mods.has('ctrl'),
    shift: mods.has('shift'),
    alt: mods.has('alt') || mods.has('option'),
  };
}

/**
 * Check whether a KeyboardEvent matches a shortcut string.
 * "cmd+k" matches Meta+K on macOS and Ctrl+K elsewhere.
 */
export function matchKey(ev: KeyboardEvent, shortcut: string | Shortcut): boolean {
  const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut;
  const isMac = getPlatform() === 'macos' || getPlatform() === 'ios';
  const cmdHeld = isMac ? ev.metaKey : ev.ctrlKey;
  if (s.cmd && !cmdHeld) return false;
  if (!s.cmd && cmdHeld && !s.ctrl) return false;
  if (s.ctrl && !ev.ctrlKey) return false;
  if (s.shift !== ev.shiftKey) return false;
  if (s.alt !== ev.altKey) return false;
  return ev.key.toLowerCase() === s.key;
}

/**
 * Render a shortcut for display: "cmd+k" → "⌘K" on macOS, "Ctrl+K" elsewhere.
 */
export function formatShortcut(shortcut: string | Shortcut): string {
  const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut;
  const isMac = getPlatform() === 'macos' || getPlatform() === 'ios';
  const parts: string[] = [];
  if (s.cmd)   parts.push(isMac ? '⌘' : 'Ctrl');
  if (s.ctrl)  parts.push(isMac ? '⌃' : 'Ctrl');
  if (s.alt)   parts.push(isMac ? '⌥' : 'Alt');
  if (s.shift) parts.push(isMac ? '⇧' : 'Shift');
  parts.push(s.key.length === 1 ? s.key.toUpperCase() : s.key);
  return isMac ? parts.join('') : parts.join('+');
}
```

- [ ] **Step 6.5: Write `src/dom/key-match.test.ts`**

```ts
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
```

Run (after Task 8 creates `platform/`, this will pass; for now Task 6 is in a feature branch — the mock keeps the test self-contained):

```bash
npx vitest run src/dom/key-match.test.ts
```

Expected: 7 passing tests (mock satisfies the platform/ import even before platform/ exists physically).

**Note for executor:** If `src/platform/platform.ts` doesn't exist yet (Task 8 not done), this test still passes thanks to the `vi.mock` block. The runtime import resolves via the mock.

- [ ] **Step 6.6: Write `src/dom/observer.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Generic observer controller — Resize, Intersection, Mutation share the shape. */
abstract class BaseObserverController<T> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private observer: T | null = null;
  protected entries: unknown[] = [];

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void { this.observer = this.createObserver(); this.start(); }
  hostDisconnected(): void { this.stop(); this.observer = null; }

  protected requestUpdate(): void { this.host.requestUpdate(); }

  protected abstract createObserver(): T;
  protected abstract start(): void;
  protected abstract stop(): void;
}

export class ResizeObserverController extends BaseObserverController<ResizeObserver> {
  size: { width: number; height: number } | null = null;
  constructor(host: ReactiveControllerHost, private target: () => Element | null) {
    super(host);
  }
  protected createObserver(): ResizeObserver {
    return new ResizeObserver((entries) => {
      const e = entries[0];
      this.size = { width: e.contentRect.width, height: e.contentRect.height };
      this.requestUpdate();
    });
  }
  protected start(): void {
    const t = this.target();
    if (t) (this as any).observer?.observe(t);
  }
  protected stop(): void { (this as any).observer?.disconnect(); }
}

export class IntersectionObserverController extends BaseObserverController<IntersectionObserver> {
  intersecting = false;
  ratio = 0;
  constructor(
    host: ReactiveControllerHost,
    private target: () => Element | null,
    private opts: IntersectionObserverInit = {},
  ) { super(host); }
  protected createObserver(): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      const e = entries[0];
      this.intersecting = e.isIntersecting;
      this.ratio = e.intersectionRatio;
      this.requestUpdate();
    }, this.opts);
  }
  protected start(): void {
    const t = this.target();
    if (t) (this as any).observer?.observe(t);
  }
  protected stop(): void { (this as any).observer?.disconnect(); }
}

export class MutationObserverController extends BaseObserverController<MutationObserver> {
  records: MutationRecord[] = [];
  constructor(
    host: ReactiveControllerHost,
    private target: () => Node | null,
    private opts: MutationObserverInit = { attributes: true, childList: false, subtree: false },
  ) { super(host); }
  protected createObserver(): MutationObserver {
    return new MutationObserver((records) => {
      this.records = records;
      this.requestUpdate();
    });
  }
  protected start(): void {
    const t = this.target();
    if (t) (this as any).observer?.observe(t, this.opts);
  }
  protected stop(): void { (this as any).observer?.disconnect(); }
}
```

- [ ] **Step 6.7: Write `src/dom/observer.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { MutationObserverController } from './observer';
import type { ReactiveControllerHost } from 'lit';

function makeHost(): ReactiveControllerHost & { requested: number } {
  const controllers: any[] = [];
  return {
    addController(c: any) { controllers.push(c); },
    removeController(_c: any) {},
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
    requested: 0,
  } as any;
}

describe('MutationObserverController', () => {
  it('observes attribute changes on target and requests host update', async () => {
    const host = makeHost();
    const el = document.createElement('div');
    document.body.appendChild(el);
    const ctrl = new MutationObserverController(host, () => el);
    ctrl.hostConnected();
    el.setAttribute('data-foo', 'bar');
    // Mutation observers fire microtask-async
    await new Promise((r) => setTimeout(r, 0));
    expect(host.requestUpdate).toHaveBeenCalled();
    ctrl.hostDisconnected();
  });
});
```

Run:

```bash
npx vitest run src/dom/observer.test.ts
```

Expected: 1 passing test.

- [ ] **Step 6.8: Write `src/dom/click-outside.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { addAbortableListener } from './listener';

export class ClickOutsideController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private ctrl: AbortController | null = null;
  active = false;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    private onOutside: (ev: Event) => void,
  ) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void { /* call activate() manually when open */ }
  hostDisconnected(): void { this.deactivate(); }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.ctrl = addAbortableListener(document, 'pointerdown', (ev) => {
      const target = ev.composedPath()[0] as Node;
      if (!this.host.contains(target)) this.onOutside(ev);
    });
  }

  deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.ctrl?.abort();
    this.ctrl = null;
  }
}

/** Plain-function variant for non-Lit hosts. Returns an abort controller. */
export function watchClickOutside(
  el: Element,
  onOutside: (ev: Event) => void,
): AbortController {
  return addAbortableListener(document, 'pointerdown', (ev) => {
    const target = ev.composedPath()[0] as Node;
    if (!el.contains(target)) onOutside(ev);
  });
}
```

- [ ] **Step 6.9: Write `src/dom/click-outside.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { watchClickOutside } from './click-outside';

describe('watchClickOutside', () => {
  it('fires when pointerdown is outside the target', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const handler = vi.fn();
    watchClickOutside(el, handler);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(handler).toHaveBeenCalled();
  });
  it('does not fire when pointerdown is inside the target', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const handler = vi.fn();
    watchClickOutside(el, handler);
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });
});
```

Run:

```bash
npx vitest run src/dom/click-outside.test.ts
```

Expected: 2 passing tests.

- [ ] **Step 6.10: Write `src/dom/focus-trap.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { addAbortableListener } from './listener';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

export class FocusTrap implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private ctrl: AbortController | null = null;
  private previouslyFocused: Element | null = null;
  active = false;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void { this.deactivate(); }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.previouslyFocused = document.activeElement;
    const focusables = this.host.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusables.length > 0) focusables[0].focus();
    else this.host.focus({ preventScroll: true });
    this.ctrl = addAbortableListener(this.host, 'keydown', (ev) => {
      if (ev.key !== 'Tab') return;
      const list = Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (list.length === 0) { ev.preventDefault(); return; }
      const first = list[0], last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (ev.shiftKey && (active === first || !this.host.contains(active))) {
        ev.preventDefault(); last.focus();
      } else if (!ev.shiftKey && active === last) {
        ev.preventDefault(); first.focus();
      }
    });
  }

  deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.ctrl?.abort();
    this.ctrl = null;
    if (this.previouslyFocused instanceof HTMLElement) {
      this.previouslyFocused.focus({ preventScroll: true });
    }
    this.previouslyFocused = null;
  }
}
```

- [ ] **Step 6.11: Write `src/dom/focus-trap.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { FocusTrap } from './focus-trap';
import type { ReactiveControllerHost } from 'lit';

function makeContainer(): HTMLElement & ReactiveControllerHost {
  const el = document.createElement('div') as any;
  el.tabIndex = -1;
  el.addController = vi.fn();
  el.removeController = vi.fn();
  el.requestUpdate = vi.fn();
  el.updateComplete = Promise.resolve(true);
  el.innerHTML = `
    <button id="a">A</button>
    <button id="b">B</button>
    <button id="c">C</button>
  `;
  document.body.appendChild(el);
  return el;
}

describe('FocusTrap', () => {
  it('focuses the first focusable on activate()', () => {
    const el = makeContainer();
    const trap = new FocusTrap(el);
    trap.activate();
    expect(document.activeElement?.id).toBe('a');
  });
  it('restores previous focus on deactivate()', () => {
    const before = document.createElement('button');
    document.body.appendChild(before);
    before.focus();
    const el = makeContainer();
    const trap = new FocusTrap(el);
    trap.activate();
    trap.deactivate();
    expect(document.activeElement).toBe(before);
  });
  it('wraps Tab from last back to first', () => {
    const el = makeContainer();
    const trap = new FocusTrap(el);
    trap.activate();
    (el.querySelector('#c') as HTMLElement).focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement?.id).toBe('a');
  });
});
```

Run:

```bash
npx vitest run src/dom/focus-trap.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 6.12: Write `src/dom/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2

export { addAbortableListener } from './listener';
export { parseShortcut, matchKey, formatShortcut, type Shortcut } from './key-match';
export {
  ResizeObserverController, IntersectionObserverController, MutationObserverController,
} from './observer';
export { ClickOutsideController, watchClickOutside } from './click-outside';
export { FocusTrap } from './focus-trap';
```

- [ ] **Step 6.13: Run all DOM tests, confirm pass**

```bash
npx vitest run src/dom/
```

Expected: all passing.

- [ ] **Step 6.14: Commit**

```bash
git add src/dom/
git commit -m "$(cat <<'EOF'
feat(dom): focus-trap, click-outside, key-match, observers, abortable listener

Five modules backed by Lit ReactiveController + AbortController:
- addAbortableListener: signal-driven cleanup
- key-match: matchKey/parseShortcut/formatShortcut, cmd→Meta on macOS
- observer: Resize/Intersection/Mutation observer controllers
- click-outside: ClickOutsideController + plain watchClickOutside helper
- focus-trap: FocusTrap controller — first-focusable on activate, Tab
  wrap, restore previous focus on deactivate

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 7: a11y helpers (announce, focus save/restore, prefers, aria)

**Files:**
- Create: `src/a11y/announce.ts` + `src/a11y/announce.test.ts`
- Create: `src/a11y/focus.ts` + `src/a11y/focus.test.ts`
- Create: `src/a11y/prefers.ts` + `src/a11y/prefers.test.ts`
- Create: `src/a11y/aria.ts` + `src/a11y/aria.test.ts`
- Create: `src/a11y/index.ts`

### Steps

- [ ] **Step 7.1: Create the directory**

```bash
mkdir -p src/a11y
```

- [ ] **Step 7.2: Write `src/a11y/announce.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

const HOST_ID = 'core-a11y-announcer';
let politeEl: HTMLElement | null = null;
let assertiveEl: HTMLElement | null = null;

function ensureHost(): { polite: HTMLElement; assertive: HTMLElement } {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
      'overflow:hidden;clip:rect(0,0,0,0);border:0;';
    document.body.appendChild(host);
  }
  if (!politeEl) {
    politeEl = document.createElement('div');
    politeEl.setAttribute('aria-live', 'polite');
    politeEl.setAttribute('aria-atomic', 'true');
    host.appendChild(politeEl);
  }
  if (!assertiveEl) {
    assertiveEl = document.createElement('div');
    assertiveEl.setAttribute('aria-live', 'assertive');
    assertiveEl.setAttribute('aria-atomic', 'true');
    host.appendChild(assertiveEl);
  }
  return { polite: politeEl, assertive: assertiveEl };
}

/**
 * Send a message to the appropriate aria-live region. Default level is "polite".
 * The singleton host is lazy-created on first call and reused thereafter.
 */
export function announce(
  text: string,
  level: 'polite' | 'assertive' = 'polite',
): void {
  const { polite, assertive } = ensureHost();
  const target = level === 'assertive' ? assertive : polite;
  // Toggle textContent so screen readers re-announce identical messages.
  target.textContent = '';
  // requestAnimationFrame ensures the clear is observed before the new text.
  requestAnimationFrame(() => { target.textContent = text; });
}
```

- [ ] **Step 7.3: Write `src/a11y/announce.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { announce } from './announce';

describe('announce', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  it('creates the singleton live region on first call', async () => {
    announce('Hello');
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const polite = document.querySelector('[aria-live="polite"]');
    expect(polite?.textContent).toBe('Hello');
  });
  it('writes to the assertive region when requested', async () => {
    announce('Critical', 'assertive');
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(assertive?.textContent).toBe('Critical');
  });
});
```

Run:

```bash
npx vitest run src/a11y/announce.test.ts
```

Expected: 2 passing tests.

- [ ] **Step 7.4: Write `src/a11y/focus.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type FocusHandle = Element | null;

/** Capture the currently-focused element so it can be restored later. */
export function saveFocus(): FocusHandle {
  return document.activeElement;
}

/** Restore focus to a handle previously returned by saveFocus(). No-op if null. */
export function restoreFocus(handle: FocusHandle): void {
  if (handle instanceof HTMLElement) {
    handle.focus({ preventScroll: true });
  }
}
```

- [ ] **Step 7.5: Write `src/a11y/focus.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { saveFocus, restoreFocus } from './focus';

describe('saveFocus / restoreFocus', () => {
  it('round-trips focus', () => {
    const a = document.createElement('button');
    const b = document.createElement('button');
    document.body.append(a, b);
    a.focus();
    const handle = saveFocus();
    b.focus();
    restoreFocus(handle);
    expect(document.activeElement).toBe(a);
  });
});
```

Run:

```bash
npx vitest run src/a11y/focus.test.ts
```

Expected: 1 passing test.

- [ ] **Step 7.6: Write `src/a11y/prefers.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersContrast(): 'no-preference' | 'more' | 'less' {
  if (window.matchMedia('(prefers-contrast: more)').matches) return 'more';
  if (window.matchMedia('(prefers-contrast: less)').matches) return 'less';
  return 'no-preference';
}

export function prefersColorScheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

class MediaQueryController implements ReactiveController {
  private mq: MediaQueryList;
  private listener: (ev: MediaQueryListEvent) => void;
  value: boolean;
  constructor(
    private host: ReactiveControllerHost,
    query: string,
  ) {
    this.mq = window.matchMedia(query);
    this.value = this.mq.matches;
    this.listener = (ev) => { this.value = ev.matches; host.requestUpdate(); };
    host.addController(this);
  }
  hostConnected(): void { this.mq.addEventListener('change', this.listener); }
  hostDisconnected(): void { this.mq.removeEventListener('change', this.listener); }
}

export class PrefersReducedMotionController extends MediaQueryController {
  constructor(host: ReactiveControllerHost) { super(host, '(prefers-reduced-motion: reduce)'); }
}

export class PrefersDarkController extends MediaQueryController {
  constructor(host: ReactiveControllerHost) { super(host, '(prefers-color-scheme: dark)'); }
}
```

- [ ] **Step 7.7: Write `src/a11y/prefers.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { prefersReducedMotion, prefersColorScheme, prefersContrast } from './prefers';

describe('prefers-*', () => {
  it('reads prefers-reduced-motion (happy-dom: defaults to false)', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });
  it('reads prefers-color-scheme', () => {
    expect(['light', 'dark']).toContain(prefersColorScheme());
  });
  it('reads prefers-contrast', () => {
    expect(['no-preference', 'more', 'less']).toContain(prefersContrast());
  });
});
```

Run:

```bash
npx vitest run src/a11y/prefers.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 7.8: Write `src/a11y/aria.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

const counters = new Map<string, number>();

/** Generate a stable, monotonically-increasing id for a given prefix. */
export function generateId(prefix: string): string {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}-${n}`;
}

/** Convenience setter that also accepts null to remove the attribute. */
export function setAriaLabel(el: Element, label: string | null): void {
  if (label === null) el.removeAttribute('aria-label');
  else el.setAttribute('aria-label', label);
}

/** Wire `input.aria-labelledby` to `label.id`, generating an id on the label if needed. */
export function linkLabelledBy(input: Element, label: Element): void {
  if (!label.id) label.id = generateId('core-label');
  const existing = input.getAttribute('aria-labelledby');
  const ids = new Set(existing ? existing.split(/\s+/) : []);
  ids.add(label.id);
  input.setAttribute('aria-labelledby', Array.from(ids).join(' '));
}
```

- [ ] **Step 7.9: Write `src/a11y/aria.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { generateId, setAriaLabel, linkLabelledBy } from './aria';

describe('generateId', () => {
  it('produces monotonic ids per prefix', () => {
    const a = generateId('core-test');
    const b = generateId('core-test');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^core-test-\d+$/);
  });
});

describe('setAriaLabel', () => {
  it('sets and removes', () => {
    const el = document.createElement('div');
    setAriaLabel(el, 'foo');
    expect(el.getAttribute('aria-label')).toBe('foo');
    setAriaLabel(el, null);
    expect(el.hasAttribute('aria-label')).toBe(false);
  });
});

describe('linkLabelledBy', () => {
  it('assigns a generated id to the label and references it from input', () => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    linkLabelledBy(input, label);
    expect(label.id).toMatch(/^core-label-\d+$/);
    expect(input.getAttribute('aria-labelledby')).toBe(label.id);
  });
});
```

Run:

```bash
npx vitest run src/a11y/aria.test.ts
```

Expected: 3 passing tests.

- [ ] **Step 7.10: Write `src/a11y/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2

export { announce } from './announce';
export { saveFocus, restoreFocus, type FocusHandle } from './focus';
export {
  prefersReducedMotion, prefersContrast, prefersColorScheme,
  PrefersReducedMotionController, PrefersDarkController,
} from './prefers';
export { generateId, setAriaLabel, linkLabelledBy } from './aria';
```

- [ ] **Step 7.11: Run all a11y tests + commit**

```bash
npx vitest run src/a11y/
git add src/a11y/
git commit -m "$(cat <<'EOF'
feat(a11y): announce, save/restoreFocus, prefers-* controllers, aria helpers

- announce: lazy singleton aria-live region (polite + assertive)
- focus: saveFocus / restoreFocus for overlay open/close cycles
- prefers: prefersReducedMotion/Contrast/ColorScheme + reactive
  controllers (PrefersReducedMotionController, PrefersDarkController)
- aria: generateId (monotonic per prefix), setAriaLabel, linkLabelledBy

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 8: Platform detection

**Files:**
- Create: `src/platform/platform.ts` + `src/platform/platform.test.ts`
- Create: `src/platform/native.ts` + `src/platform/native.test.ts`
- Create: `src/platform/index.ts`

### Steps

- [ ] **Step 8.1: Create the directory**

```bash
mkdir -p src/platform
```

- [ ] **Step 8.2: Write `src/platform/platform.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type Platform = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown';

interface UADataLike {
  platform?: string;
  mobile?: boolean;
}

/** Read the current platform. One-shot — platform does not change at runtime. */
export function getPlatform(): Platform {
  // Modern userAgentData first.
  const ua = (navigator as unknown as { userAgentData?: UADataLike }).userAgentData;
  if (ua?.platform) {
    const p = ua.platform.toLowerCase();
    if (p.includes('mac')) return 'macos';
    if (p.includes('win')) return 'windows';
    if (p.includes('linux')) return 'linux';
    if (p.includes('android')) return 'android';
  }
  // UA-string fallback.
  const s = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(s)) return 'ios';
  if (/android/.test(s)) return 'android';
  if (/mac/.test(s)) return 'macos';
  if (/win/.test(s)) return 'windows';
  if (/linux/.test(s)) return 'linux';
  return 'unknown';
}
```

- [ ] **Step 8.3: Write `src/platform/platform.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPlatform } from './platform';

describe('getPlatform', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  it('detects macOS from UA string', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    );
    expect(getPlatform()).toBe('macos');
  });
  it('detects iOS from UA string', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    );
    expect(getPlatform()).toBe('ios');
  });
  it('detects Windows from UA string', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    );
    expect(getPlatform()).toBe('windows');
  });
  it('returns "unknown" for an empty UA', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('');
    expect(getPlatform()).toBe('unknown');
  });
});
```

- [ ] **Step 8.4: Write `src/platform/native.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

export type NativeShell = 'wails' | 'ios-app' | 'ipados-app' | null;

/** Returns true if we're running inside a known native shell. */
export function isNativeShell(): boolean {
  return getNativeShell() !== null;
}

/**
 * Identify the host native shell, if any.
 * - Wails: `window.go` is injected by the Wails runtime.
 * - iOS/iPadOS app: WKWebView userAgent + presence of `webkit.messageHandlers`.
 */
export function getNativeShell(): NativeShell {
  const w = window as unknown as Record<string, unknown>;
  if (w.go) return 'wails';
  const wk = (w.webkit as { messageHandlers?: unknown } | undefined)?.messageHandlers;
  if (wk) {
    const ua = navigator.userAgent;
    if (/iPad/.test(ua)) return 'ipados-app';
    if (/iPhone|iPod/.test(ua)) return 'ios-app';
  }
  return null;
}
```

- [ ] **Step 8.5: Write `src/platform/native.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, afterEach } from 'vitest';
import { getNativeShell, isNativeShell } from './native';

describe('getNativeShell', () => {
  afterEach(() => {
    delete (window as any).go;
    delete (window as any).webkit;
  });
  it('returns null in a plain browser', () => {
    expect(getNativeShell()).toBeNull();
    expect(isNativeShell()).toBe(false);
  });
  it('detects Wails via window.go', () => {
    (window as any).go = { __wails: true };
    expect(getNativeShell()).toBe('wails');
    expect(isNativeShell()).toBe(true);
  });
});
```

- [ ] **Step 8.6: Write `src/platform/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2

export { getPlatform, type Platform } from './platform';
export { isNativeShell, getNativeShell, type NativeShell } from './native';
```

- [ ] **Step 8.7: Run platform tests + commit**

```bash
npx vitest run src/platform/
git add src/platform/
git commit -m "$(cat <<'EOF'
feat(platform): platform + native-shell detection

getPlatform() → 'macos'|'windows'|'linux'|'ios'|'android'|'unknown'.
Prefers navigator.userAgentData when available; falls back to UA-string
sniffing. getNativeShell()/isNativeShell() detect Wails (window.go)
and iOS/iPadOS native shells (webkit.messageHandlers + UA).

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 9: Brand + Mode reactive controllers

**Files:**
- Create: `src/brand/brand.ts` + `src/brand/brand.test.ts`
- Create: `src/brand/mode.ts` + `src/brand/mode.test.ts`
- Create: `src/brand/index.ts`

### Steps

- [ ] **Step 9.1: Create the directory**

```bash
mkdir -p src/brand
```

- [ ] **Step 9.2: Write `src/brand/brand.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { MutationObserverController } from '../dom/observer';

/**
 * Walk ancestors looking for the nearest [data-brand] attribute.
 * Returns the raw string (lib stays brand-neutral; consumers register new
 * brand CSS files like brand-foo.css without touching library types) or
 * null if no ancestor sets one.
 */
export function getBrand(el: Element = document.documentElement): string | null {
  let cur: Element | null = el;
  while (cur) {
    const b = cur.getAttribute?.('data-brand');
    if (b) return b;
    cur = cur.parentElement;
  }
  return null;
}

export class BrandController implements ReactiveController {
  value: string | null;
  /** Convenience reader for --core-brand-name on the host's scope. */
  get name(): string {
    return getComputedStyle(this.host).getPropertyValue('--core-brand-name').trim().replace(/^"|"$/g, '');
  }

  private observer: MutationObserverController;

  constructor(private host: ReactiveControllerHost & Element) {
    this.value = getBrand(host);
    this.observer = new MutationObserverController(
      host,
      () => document.documentElement,
      { attributes: true, attributeFilter: ['data-brand'], subtree: true },
    );
    host.addController(this);
  }

  hostConnected(): void { this.refresh(); }
  hostUpdated(): void { this.refresh(); }

  private refresh(): void {
    const next = getBrand(this.host);
    if (next !== this.value) {
      this.value = next;
      this.host.requestUpdate();
    }
  }
}
```

- [ ] **Step 9.3: Write `src/brand/brand.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { getBrand } from './brand';

describe('getBrand', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-brand');
    document.body.innerHTML = '';
  });
  it('returns null when no ancestor sets [data-brand]', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getBrand(el)).toBeNull();
  });
  it('returns the nearest ancestor brand', () => {
    const root = document.createElement('section');
    root.setAttribute('data-brand', 'lethean');
    const child = document.createElement('div');
    root.appendChild(child);
    document.body.appendChild(root);
    expect(getBrand(child)).toBe('lethean');
  });
  it('accepts any string — brand-neutral by design', () => {
    document.documentElement.setAttribute('data-brand', 'future-brand');
    expect(getBrand()).toBe('future-brand');
  });
});
```

- [ ] **Step 9.4: Write `src/brand/mode.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { MutationObserverController } from '../dom/observer';

export type Mode = 'light' | 'dark' | null;

export function getMode(el: Element = document.documentElement): Mode {
  let cur: Element | null = el;
  while (cur) {
    const m = cur.getAttribute?.('data-mode');
    if (m === 'light' || m === 'dark') return m;
    cur = cur.parentElement;
  }
  return null;
}

export class ModeController implements ReactiveController {
  value: Mode;
  private observer: MutationObserverController;

  constructor(private host: ReactiveControllerHost & Element) {
    this.value = getMode(host);
    this.observer = new MutationObserverController(
      host,
      () => document.documentElement,
      { attributes: true, attributeFilter: ['data-mode'], subtree: true },
    );
    host.addController(this);
  }

  hostConnected(): void { this.refresh(); }
  hostUpdated(): void { this.refresh(); }

  private refresh(): void {
    const next = getMode(this.host);
    if (next !== this.value) {
      this.value = next;
      this.host.requestUpdate();
    }
  }
}
```

- [ ] **Step 9.5: Write `src/brand/mode.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { getMode } from './mode';

describe('getMode', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-mode');
    document.body.innerHTML = '';
  });
  it('returns null when nothing is set', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getMode(el)).toBeNull();
  });
  it('returns "light" or "dark" only', () => {
    document.documentElement.setAttribute('data-mode', 'light');
    expect(getMode()).toBe('light');
    document.documentElement.setAttribute('data-mode', 'dark');
    expect(getMode()).toBe('dark');
  });
  it('ignores unknown mode values', () => {
    document.documentElement.setAttribute('data-mode', 'high-contrast');
    expect(getMode()).toBeNull();
  });
});
```

- [ ] **Step 9.6: Write `src/brand/index.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2

export { getBrand, BrandController } from './brand';
export { getMode, ModeController, type Mode } from './mode';
```

- [ ] **Step 9.7: Run brand tests + commit**

```bash
npx vitest run src/brand/
git add src/brand/
git commit -m "$(cat <<'EOF'
feat(brand): BrandController + ModeController over [data-brand]/[data-mode]

getBrand(el?) walks ancestors for the nearest [data-brand]; returns
the raw string (any value — lib stays brand-neutral, new brands need
no library type update). BrandController uses MutationObserver to
notify the host on attribute change.

getMode(el?) returns 'light'|'dark'|null with strict validation.
ModeController same shape.

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 10: Wire up package.json + root index.ts + smoke test every sub-path

**Files:**
- Modify: `package.json` (exports map, dependencies, version)
- Modify: `index.ts` (root re-exports)
- Create: `tests/integration/exports.test.ts` (smoke test that every sub-path imports)

### Steps

- [ ] **Step 10.1: Update `package.json`** — replace its contents with:

```json
{
  "name": "@dappcore/ui",
  "version": "0.2.0",
  "description": "CoreUI — brand-neutral Web Component library and design utilities. Lit-based, light DOM, brandable via [data-brand].",
  "type": "module",
  "license": "EUPL-1.2",
  "author": "Snider <snider@lthn.ai>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/dAppCore/ui.git"
  },
  "bugs": {
    "url": "https://github.com/dAppCore/ui/issues"
  },
  "homepage": "https://core.help",
  "main": "./index.js",
  "module": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": "./index.js",
    "./formatters": "./src/formatters/index.js",
    "./formatters/registry": "./src/formatters/registry.js",
    "./structural": "./src/structural/index.js",
    "./primitives": "./src/primitives/index.js",
    "./table": "./src/table/index.js",
    "./crypto": "./src/crypto/index.js",
    "./forms": "./src/forms/index.js",
    "./tokens": "./src/tokens/tokens.css",
    "./tokens/index.css": "./src/tokens/index.css",
    "./tokens/tailwind": "./src/tokens/tailwind.css",
    "./tokens/brand-hostuk": "./src/tokens/brand-hostuk.css",
    "./tokens/brand-lethean": "./src/tokens/brand-lethean.css",
    "./tokens/brand-ofm": "./src/tokens/brand-ofm.css",
    "./tokens/platform-darwin": "./src/tokens/platform-darwin.css",
    "./tokens/platform-ios": "./src/tokens/platform-ios.css",
    "./colour": "./src/colour/index.js",
    "./math": "./src/math/index.js",
    "./animation": "./src/animation/index.js",
    "./dom": "./src/dom/index.js",
    "./a11y": "./src/a11y/index.js",
    "./platform": "./src/platform/index.js",
    "./brand": "./src/brand/index.js"
  },
  "files": [
    "index.js",
    "index.d.ts",
    "src/**/*.js",
    "src/**/*.d.ts",
    "src/**/*.css",
    "RFC.md",
    "CLAUDE.md",
    "README.md",
    "LICENCE"
  ],
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lit/context": "^1.1.0",
    "lit": "^3.2.0"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^2.1.0",
    "happy-dom": "^15.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  },
  "keywords": [
    "web-components",
    "lit",
    "coreui",
    "dappcore",
    "ui",
    "design-tokens",
    "tailwind",
    "oklch",
    "formatters",
    "data-table",
    "flexy"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

- [ ] **Step 10.2: Update `index.ts`** — replace its contents with:

```ts
// SPDX-Licence-Identifier: EUPL-1.2

/**
 * @dappcore/ui — CoreUI root entry.
 *
 * Importing the root re-exports every JS module (formatters, crypto, forms,
 * colour, math, animation, dom, a11y, platform, brand). CSS tokens are NOT
 * re-exported from JS — import them separately:
 *
 *   import '@dappcore/ui/tokens';            // bare tokens
 *   import '@dappcore/ui/tokens/tailwind';   // Tailwind v4 @theme bridge
 *   import '@dappcore/ui/tokens/brand-lethean';
 *
 * For tree-shaking, prefer sub-imports:
 *
 *   import { parseColour } from '@dappcore/ui/colour';
 *   import { Easing }      from '@dappcore/ui/math';
 *   import { FocusTrap }   from '@dappcore/ui/dom';
 */

export * from './src/formatters/index.js';
export * from './src/crypto/index.js';
export * from './src/forms/index.js';
export * from './src/colour/index.js';
export * from './src/math/index.js';
export * from './src/animation/index.js';
export * from './src/dom/index.js';
export * from './src/a11y/index.js';
export * from './src/platform/index.js';
export * from './src/brand/index.js';
```

- [ ] **Step 10.3: Create the integration test directory**

```bash
mkdir -p tests/integration
```

- [ ] **Step 10.4: Write `tests/integration/exports.test.ts`**

```ts
// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';

describe('exports smoke test — every package.json subpath imports cleanly', () => {
  it('@dappcore/ui (root)', async () => {
    const m = await import('../../index');
    expect(typeof m).toBe('object');
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
```

- [ ] **Step 10.5: Run full test suite**

```bash
npm test
```

Expected: all tests pass — existing formatters/crypto/forms + new tokens/colour/math/animation/dom/a11y/platform/brand + integration smoke tests.

- [ ] **Step 10.6: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 10.7: Run build**

```bash
npm run build
```

Expected: `.js` + `.d.ts` files emitted alongside every `.ts` source.

- [ ] **Step 10.8: Commit**

```bash
git add package.json index.ts tests/
git commit -m "$(cat <<'EOF'
chore(pkg): exports map + @lit/context dep + bump to 0.2.0

- exports map gains: tokens (+ index/tailwind/brand-*/platform-*),
  colour, math, animation, dom, a11y, platform, brand
- @lit/context ^1.1.0 added to dependencies
- root index.ts re-exports every new JS module (CSS stays import-only)
- tests/integration/exports.test.ts smoke-tests every subpath
- description reframed brand-neutral; homepage core.help
- version 0.0.1 -> 0.2.0 (0.1 is formatter foundation; this is utils)

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

---

## Task 11: Identity reframe — README + CLAUDE.md

**Files:**
- Rewrite: `README.md`
- Rewrite: `CLAUDE.md`
- **Do NOT touch:** `RFC.md` (flagged as a separate follow-up rev)

### Steps

- [ ] **Step 11.1: Rewrite `README.md`** — replace its contents with:

```markdown
<!-- SPDX-Licence-Identifier: EUPL-1.2 -->

# CoreUI · `@dappcore/ui`

> **CoreUI** is a brand-neutral Web Component library and design utility kit for the dappco.re polyglot stack. Lit-based, light DOM, oklch-first, Tailwind v4 friendly. Brandable with one attribute.

```html
<body data-brand="lethean" data-mode="dark">
  <button class="bg-brand-500 text-fg-0 rounded-md font-sans shadow-2">
    Save
  </button>
</body>
```

- **Brand-neutral by default.** Three opt-in brands ship in the box (hostuk, lethean, ofm). New brands are one CSS file each — no central registry.
- **Tailwind v4 ready.** `import '@dappcore/ui/tokens/tailwind'` and `bg-brand-500`, `rounded-md`, `font-sans`, `shadow-2` work natively, with `[data-brand]` switching flowing through.
- **Oklch-first colour helpers.** Parse, convert, rotate, mix, contrast — agents building canvas/SVG/charts don't reach to npm for one util.
- **ReactiveController patterns.** Focus-trap, click-outside, resize/intersection/mutation observers, brand/mode controllers — Lit-aware, lifecycle-correct.
- **a11y baked in.** aria-live announcer, focus save/restore, prefers-reduced-motion / contrast / color-scheme reactive controllers.
- **Pipe registry** — shared by reference with [`dappco.re/go/html`](https://forge.lthn.sh/core/go-html); byte-identical output across browser + Go server + PHP server.

## Install

```bash
# npm
npm install @dappcore/ui

# git submodule (dappco.re-native pattern)
git submodule add https://github.com/dAppCore/ui.git external/ui
```

## Identity

- **Source:** `dappco.re/ui` (canonical), `github.com/dAppCore/ui` (mirror)
- **Docs:** https://core.help (end-user facing, un-branded help + technical guides)
- **Package:** `@dappcore/ui`
- **Tag prefix:** `<core-*>`

## Sub-imports

```js
import '@dappcore/ui';                        // everything (JS)
import '@dappcore/ui/tokens';                 // CSS tokens — brand-neutral
import '@dappcore/ui/tokens/tailwind';        // Tailwind v4 @theme bridge
import '@dappcore/ui/tokens/brand-lethean';   // one brand on demand

import { parseColour, mix, contrastRatio } from '@dappcore/ui/colour';
import { Easing, interpolate, clamp }      from '@dappcore/ui/math';
import { FocusTrap, matchKey }              from '@dappcore/ui/dom';
import { announce, generateId }             from '@dappcore/ui/a11y';
import { getPlatform, isNativeShell }       from '@dappcore/ui/platform';
import { BrandController, ModeController }  from '@dappcore/ui/brand';
```

## Design canon

[RFC.md](RFC.md) — full spec including the pipe registry, component contracts, polyglot story. Read this for the why.

[docs/superpowers/specs/](docs/superpowers/specs/) — incremental specs (v0.2 utils, future tracks).

## Roadmap

See [RFC.md §16](RFC.md#16-roadmap). Currently at **v0.2 — utils foundation** (tokens, colour, math, animation context, dom, a11y, platform, brand). v0.3 ships the seed `<core-data-table>`.

## Licence

[EUPL-1.2](LICENCE).
```

- [ ] **Step 11.2: Rewrite `CLAUDE.md`** — replace its contents with:

```markdown
<!-- SPDX-Licence-Identifier: EUPL-1.2 -->

# CLAUDE.md — CoreUI · `@dappcore/ui`

> Agent context summary for `dAppCore/ui`. Read [RFC.md](RFC.md) for the full design. This file is the fast-load context.

## What this is

**CoreUI** — brand-neutral Web Component library and design utility kit for the dappco.re polyglot stack. Companion to CorePHP `<core:*>` tags and `dappco.re/go/html` Flexy-revival rendering. Three-layer architecture: this library (behaviour + tokens) → consumer skin (visual override) → consumer apps.

Templates are **valid HTML** (Flexy property preserved). A `<core-data-table>` opens in a browser, opens in a visual editor, renders example state without a build tool.

## Identity

- **Name:** CoreUI (brand-neutral)
- **Package:** `@dappcore/ui`
- **Source:** `dappco.re/ui` (canonical), `github.com/dAppCore/ui` (mirror)
- **Docs:** https://core.help
- **Tag prefix:** `<core-*>`
- **Licence:** EUPL-1.2

Mojo: no brand, but brandable with ease. Every brand selection is additive over `[data-brand="…"]`. New brands are one CSS file each.

## Layer map (v0.2 — current)

| Layer | Purpose |
|---|---|
| `src/tokens/` | CSS — brand-neutral `--core-*` palette, prefers-color-scheme dark, three opt-in brands, two platform profiles, Tailwind v4 `@theme` bridge |
| `src/colour/` | JS — oklch-first parse/convert/rotate/mix/contrast/resolve |
| `src/math/` | JS — easing, interpolate, animate, clamp/lerp/mapRange/wrap/snap |
| `src/animation/` | Lit `@context` — `timelineContext`, `spriteContext` types (engine deferred) |
| `src/dom/` | Lit `ReactiveController` + `AbortController` — focus-trap, click-outside, key-match, observers, abortable listener |
| `src/a11y/` | aria-live announcer, focus save/restore, prefers-* controllers, aria helpers |
| `src/platform/` | `getPlatform()`, `isNativeShell()` |
| `src/brand/` | `BrandController`, `ModeController` over `[data-brand]` / `[data-mode]` |
| `src/formatters/` | Existing — pipe registry + 12 built-in formatters |
| `src/crypto/` | Existing — HMAC, lthnHash, UUIDv7, quasi-salt |
| `src/forms/` | Existing — `<core-form>`, `<core-field>` secure-by-default |

## Critical contracts

| Contract | Detail |
|---|---|
| Light DOM by default | No Shadow DOM unless backdrop isolation requires it (`<core-dialog>`, `<core-drawer>`, `<core-popover>`, `<core-tooltip>`). Tokens.css inherits through. |
| `::part()` skinning | Every visually significant internal element has a `part` attribute. Skin layer targets via `::part()`. |
| CSS custom properties | Tunables exposed as `--core-<component>-<property>`. Tokens are `--core-*`. Library never hard-codes visual values. |
| Slot-driven extension | Default slot for content. Named slots for predictable extension points. |
| Form participation | Inputs use `ElementInternals` for native `<form>` integration. |
| ARIA + keyboard | Correct ARIA emitted from the start. Keyboard handlers wired via `dom/key-match` and `a11y/aria`. |
| `core-*` event names | All custom events use the `core-` prefix. Bubbles; composes where needed to cross shadow boundaries. |
| Property/attribute reflection | `value`, `disabled`, `open` reflect both ways. |
| Brand-neutral | `:root` has no brand. All brand selection is additive via `[data-brand="…"]`. |
| Tailwind v4 bridge | `tokens/tailwind.css` wraps `--core-*` in `@theme` so utility classes work natively with brand switching. |

## Banned in source

- React, Vue, Angular, Svelte — Web Components only.
- Tailwind class hard-coding inside components — components consume `--core-*` via `var()`, not Tailwind utilities.
- Build-time template compilation as a hard requirement — browsers and standards do enough.
- JSX — couples to a runtime.
- Direct `<form>` `formdata` event listening — use `ElementInternals` instead.
- Shadow DOM "because reasons" — light DOM unless backdrop isolation is actually needed.
- `Intl.*` workarounds — if a formatter needs locale-aware output, use `Intl`.
- Brand hard-coding in `:root` — brand-neutral by design.

## Test convention

`<component>.test.ts` for behaviour. `<component>_example_test.ts` for the "comments are usage examples" AX rule applied to JS — these files double as live documentation. Run with `vitest run` (CI) or `vitest` (watch).

## Distribution

- **ESM only.** No build step required for consumption.
- **NPM:** `@dappcore/ui`. Sub-paths for tree-shaking — see README.
- **Submodule:** `external/ui/` in consumer repos (dappco.re-native pattern).
- **TypeScript:** `target: ES2022`, `lib: ES2022, DOM`. Lit decorators (stage-3 syntax).
- **Tests:** Vitest + happy-dom. Each module carries `<name>.test.ts` + `<name>_example_test.ts`.

## Cross-references

- [RFC.md](RFC.md) — full design canon
- [docs/superpowers/specs/](docs/superpowers/specs/) — incremental specs (v0.2 utils)
- `dappco.re/go/html` — Go server-side renderer with shared pipe grammar
- `core-template` (CorePHP `<core:*>`) — PHP server-side renderer
- `RFC-CORE-006-GO-HTML.md` — GrammarImprint primitive (mount-point for `grammar-imprint` pipe)
- `RFC-CORE-008-AGENT-EXPERIENCE.md` — AX rules (comments-as-usage-examples applied to JS)
```

- [ ] **Step 11.3: Run all tests + typecheck one final time**

```bash
npm test && npm run typecheck
```

Expected: green.

- [ ] **Step 11.4: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: reframe README + CLAUDE.md to CoreUI brand-neutral identity

- README: CoreUI framing, dappco.re/ui source URL, core.help docs URL,
  Tailwind v4 quickstart, sub-import examples
- CLAUDE.md: agent fast-load context updated with v0.2 layer map,
  brand-neutral contract, Tailwind v4 bridge contract
- RFC.md intentionally untouched (flagged as separate follow-up rev)

Co-Authored-By: Virgil <virgil@lethean.io>
EOF
)"
```

- [ ] **Step 11.5: Final review**

Confirm the full commit history is exactly 11 task-shaped commits on top of `3b2edc9` (the spec commit):

```bash
git log --oneline 3b2edc9..HEAD
```

Expected 11 lines:

```
xxxxxxx docs: reframe README + CLAUDE.md to CoreUI brand-neutral identity
xxxxxxx chore(pkg): exports map + @lit/context dep + bump to 0.2.0
xxxxxxx feat(brand): BrandController + ModeController over [data-brand]/[data-mode]
xxxxxxx feat(platform): platform + native-shell detection
xxxxxxx feat(a11y): announce, save/restoreFocus, prefers-* controllers, aria helpers
xxxxxxx feat(dom): focus-trap, click-outside, key-match, observers, abortable listener
xxxxxxx feat(animation): port timelineContext + spriteContext (engine deferred)
xxxxxxx feat(math): port easing + add lerp/mapRange/wrap/snap
xxxxxxx feat(colour): oklch-first JS helpers (parse, convert, rotate, mix, contrast, resolve)
xxxxxxx feat(tokens): tailwind v4 @theme bridge
xxxxxxx feat(tokens): extract core-* design tokens from core/ide
```

---

## Plan-level self-review (already done during plan authoring)

**Spec coverage matrix:**

| Spec section | Plan task |
|---|---|
| §3.1 In scope — tokens | Task 1, 2 |
| §3.1 In scope — colour | Task 3 |
| §3.1 In scope — math | Task 4 |
| §3.1 In scope — animation context | Task 5 |
| §3.1 In scope — DOM | Task 6 |
| §3.1 In scope — a11y | Task 7 |
| §3.1 In scope — Platform | Task 8 |
| §3.1 In scope — Brand | Task 9 |
| §3.1 In scope — Identity reframe | Task 11 |
| §4 Package shape (exports map) | Task 10 |
| §5 Tokens (brand-neutral, prefers-color-scheme dark, brands, platforms) | Task 1 |
| §5.5 Tailwind v4 @theme bridge | Task 2 |
| §6 Colour JS helpers (six modules) | Task 3 |
| §7.1 Math (easing port + clamp/lerp/mapRange/wrap/snap) | Task 4 |
| §7.2 Animation context (engine deferred) | Task 5 |
| §8.1 DOM (focus-trap, click-outside, key-match, listener, observer) | Task 6 |
| §8.2 a11y (announce, focus, prefers, aria) | Task 7 |
| §8.3 Platform (getPlatform, isNativeShell) | Task 8 |
| §8.4 Brand (BrandController, ModeController) | Task 9 |
| §9 Source-of-truth ledger (provenance headers) | Every file's header comment |
| §10 Testing (Vitest + happy-dom, behaviour + AX example tests) | Every task's test step |
| §11 Acceptance (typecheck, test, build, integration smoke) | Task 10 + Task 11 final |
| §12 Commit pacing (11 commits) | Tasks 1–11 each commit |

**No-placeholder check:** every code block in this plan contains actual runnable code; tests have concrete assertions; commit messages are spelled out.

**Type consistency check:**
- `Colour` interface defined in Task 3 (`src/colour/types.ts`), referenced consistently across `parse.ts`, `convert.ts`, `rotate.ts`, `mix.ts`, `contrast.ts`, `resolve.ts`.
- `EasingFn` defined in Task 4 (`src/math/easing.ts`), referenced by `interpolate.ts`.
- `TimelineState` / `SpriteState` defined in Task 5 (`src/animation/context.ts`), context keys `core-timeline` / `core-sprite` match.
- `Shortcut` interface defined in Task 6 (`src/dom/key-match.ts`), used by `matchKey` and `formatShortcut`.
- `FocusHandle` defined in Task 7 (`src/a11y/focus.ts`).
- `Platform` type defined in Task 8 (`src/platform/platform.ts`), referenced by `dom/key-match.ts` via `getPlatform()` for macOS/iOS cmd resolution.
- `NativeShell` type defined in Task 8.
- `Mode` type defined in Task 9 (`src/brand/mode.ts`).
- `BrandController` typed with `value: string | null` (brand-neutral) — consistent with spec §8.4.
- `MutationObserverController` (Task 6) used by both `BrandController` and `ModeController` (Task 9).

All consistent.


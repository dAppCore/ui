<!-- SPDX-Licence-Identifier: EUPL-1.2 -->

# CoreUI v0.2 — Utils Extraction (Design)

> *Status:* Approved (brainstorm 2026-05-16). *Authors:* Snider, Cladius. *Track:* utils-first, two-track.
> *Source:* `core/ide/frontend/lit/` (Lethean Desktop) + `core/ide/frontend/src/tokens.css`. The Lit UI in core/ide is being retired; this PR rescues the framework-clean pieces into `@dappcore/ui` before the source disappears.

## 1. Mission

Extract the framework-clean, agent-reusable utilities from `core/ide/frontend/lit/` into `@dappcore/ui` so multiple agents producing UI converge on the same primitives, the same colour system, and the same accessibility patterns. Brand-neutral by default; brandable with one attribute.

This is the **utils track** of a two-track plan. Component porting (`<core-button>` etc.) is its own brainstorm and lands afterwards — utils first so components have stable tokens, colour helpers, math, DOM, a11y, platform, and brand controllers to build on.

## 2. Identity

- **Name:** CoreUI (brand-neutral).
- **Package:** `@dappcore/ui`.
- **Source:** `dappco.re/ui` (canonical), `github.com/dAppCore/ui` (mirror).
- **Docs:** `https://core.help` (end-user facing, un-branded help + technical guides).
- **Licence:** EUPL-1.2.

Mojo: no brand, but brandable with ease. Every brand selection is additive over `[data-brand="…"]`. New brands are one CSS file each — no central registry.

## 3. Scope and non-goals

### In scope (this PR)

| Layer | What lands |
|---|---|
| Tokens | `src/tokens/` — brand-neutral `--core-*` palette, three opt-in brand files, two platform profiles, prefers-color-scheme dark, Tailwind v4 `@theme` bridge |
| Colour | `src/colour/` — oklch-first JS helpers (parse, convert, rotate, mix, contrast, resolve) |
| Math | `src/math/` — easing, interpolate, animate, clamp, lerp, mapRange, wrap, snap |
| Animation | `src/animation/` — `timelineContext`, `spriteContext` types only |
| DOM | `src/dom/` — focus-trap, click-outside, key-match, abortable listener, observer wrappers |
| a11y | `src/a11y/` — announce, save/restoreFocus, prefers-* controllers, aria helpers |
| Platform | `src/platform/` — getPlatform, isNativeShell |
| Brand | `src/brand/` — BrandController, ModeController over `[data-brand]`/`[data-mode]` |
| Identity | README + CLAUDE.md reframed to CoreUI; `package.json` homepage → `core.help`; brand-neutral description |

### Out of scope (deferred)

| Deferred | Why | Lands when |
|---|---|---|
| Component porting (`<core-button>`, `<core-pill>`, etc.) | Two-track decision. | Second-track brainstorm |
| Animation `engine.ts` (timeline/stage/sprite implementations) | Component-shaped, not utility-shaped. The `context.ts` types are useful as a published protocol on their own. | Second-track |
| WAAPI `tween.ts` declarative animator | No current caller. | When one appears |
| APCA contrast, ΔE, named colour parsing | Heavier; no caller. | When a caller asks |
| Decorator sugar (`@withBrand`, `@announceErrors`) | Controllers cover the use case. | If friction shows |
| RFC.md rewrite to acknowledge v0.2 layers | Out of scope; the RFC's `core-*`/pipe decisions stand. | Separate rev |

## 4. Package shape

Eight new subdirs under `src/`, all additive. Existing `crypto/`, `formatters/`, `forms/` untouched.

```
src/
├── crypto/          (existing)
├── formatters/      (existing)
├── forms/           (existing)
│
├── tokens/          NEW. CSS-only.
├── colour/          NEW. Oklch-first JS helpers.
├── math/            NEW. Pure functions.
├── animation/       NEW. Lit-aware; uses @lit/context.
├── dom/             NEW. ReactiveController-driven.
├── a11y/            NEW.
├── platform/        NEW.
└── brand/           NEW.
```

**Each new dir colocates** `<name>.test.ts` (behaviour) and `<name>_example_test.ts` (AX rule: comments are usage examples).

**`index.ts`** is extended to re-export the new JS modules. CSS is **never** re-exported through JS — tokens are imported by consumers via `import '@dappcore/ui/tokens'` (CSS sub-path).

**`package.json` `exports`** gains:

```jsonc
{
  "./tokens":                 "./src/tokens/tokens.css",
  "./tokens/index.css":       "./src/tokens/index.css",
  "./tokens/tailwind":        "./src/tokens/tailwind.css",
  "./tokens/brand-hostuk":    "./src/tokens/brand-hostuk.css",
  "./tokens/brand-lethean":   "./src/tokens/brand-lethean.css",
  "./tokens/brand-ofm":       "./src/tokens/brand-ofm.css",
  "./tokens/platform-darwin": "./src/tokens/platform-darwin.css",
  "./tokens/platform-ios":    "./src/tokens/platform-ios.css",
  "./colour":                 "./src/colour/index.js",
  "./math":                   "./src/math/index.js",
  "./animation":              "./src/animation/index.js",
  "./dom":                    "./src/dom/index.js",
  "./a11y":                   "./src/a11y/index.js",
  "./platform":               "./src/platform/index.js",
  "./brand":                  "./src/brand/index.js"
}
```

**`dependencies`** adds `@lit/context: ^1.1.0`.

## 5. Tokens (`src/tokens/`)

### 5.1 Brand-neutral `:root`

The library ships **no brand at `:root`.** A neutral, hue-anchored grey scale is the `--core-brand-*` default — low chroma, hue 285 (the same near-neutral hue as the ink scale). An un-branded CoreUI app looks intentionally undecided rather than broken; the system works without a brand selected, and any brand is purely additive.

`:root` defines:

| Group | Vars |
|---|---|
| Surface (ink-on-paper metaphor) | `--core-ink-0..6` (7 steps) |
| Foreground | `--core-fg-0..4` (5 steps) |
| Hairlines (color-mix derived from fg) | `--core-line-1..3` |
| Brand scale (neutral grey default) | `--core-brand-50..900` (10 steps) |
| Brand metadata | `--core-brand-name` ("Core"), `--core-brand-hue` (285), `--core-brand-secondary` |
| Accent tints (always available) | `--core-gold-300..600`, `--core-ember-400..600` |
| State | `--core-success-400/500`, `--core-warning-400/500`, `--core-danger-400/500`, `--core-info-400/500` |
| Radii | `--core-radius-xs/sm/md/lg/xl/2xl/pill` |
| Shadow | `--core-shadow-1..3` |
| Type | `--core-font-sans/mono/serif/display` |

### 5.2 Default mode — system preference

Brand-neutral libs shouldn't pick a mood for the consumer. So:

- `:root` ships **light** surface values as the static default (safer for first paint on most devices).
- `@media (prefers-color-scheme: dark)` inside `tokens.css` flips ink / fg / line / shadow to the dark scale automatically.
- Manual override via `[data-mode="light"]` or `[data-mode="dark"]` wins over the media query.

This is a deliberate pivot from `core/ide/frontend/src/tokens.css`, which is dark-first. The source serves a dark-calm *product* (Host UK + Lethean Desktop); the lib serves *everyone*.

### 5.3 Brand opt-ins

Three opt-in brand files, each a single ruleset over `[data-brand="…"]`. None is default in `tokens.css`.

```
brand-hostuk.css    [data-brand="hostuk"]    hue 305, royal purple (Vi)
brand-lethean.css   [data-brand="lethean"]   hue 270, indigo
brand-ofm.css       [data-brand="ofm"]       hue 28, warm rose-amber
```

Adding more brands later is just another `brand-<name>.css` — no central registry to update.

### 5.4 Platform profiles

Two opt-in platform files, each tweaks `--core-font-*` and `--core-radius-*` for native feel:

```
platform-darwin.css   [data-platform="darwin"]                 SF Pro + tighter radii
platform-ios.css      [data-platform="ios"], [data-platform="ipad"]   SF Pro Text + 17pt + curvier radii
```

Web is the implicit default (`:root`).

### 5.5 Tailwind v4 bridge (`tokens/tailwind.css`)

The user's primary consumer is Tailwind v4. Ship a separate `tokens/tailwind.css` that wraps `--core-*` in Tailwind's `@theme` namespaces so utility classes like `bg-brand-500`, `text-fg-0`, `rounded-md`, `font-sans`, `shadow-2` work natively.

```css
/* tokens/tailwind.css */
@import "./index.css";   /* loads tokens + brands + platforms + mode-light */

@theme {
  /* Colours — Tailwind generates bg-*, text-*, border-*, ring-* utilities */
  --color-brand-50:  var(--core-brand-50);
  --color-brand-100: var(--core-brand-100);
  /* … full brand scale … */
  --color-fg-0: var(--core-fg-0);
  --color-fg-1: var(--core-fg-1);
  /* … fg scale … */
  --color-ink-0: var(--core-ink-0);
  /* … ink scale … */
  --color-success-400: var(--core-success-400);
  --color-success-500: var(--core-success-500);
  --color-warning-400: var(--core-warning-400);
  --color-warning-500: var(--core-warning-500);
  --color-danger-400:  var(--core-danger-400);
  --color-danger-500:  var(--core-danger-500);
  --color-info-400:    var(--core-info-400);
  --color-info-500:    var(--core-info-500);

  /* Hairlines — bridged as colours so `border-line-2`, `bg-line-1` etc. work */
  --color-line-1: var(--core-line-1);
  --color-line-2: var(--core-line-2);
  --color-line-3: var(--core-line-3);

  /* Accent tints — generates bg-gold-*, bg-ember-* */
  --color-gold-300:  var(--core-gold-300);
  --color-gold-400:  var(--core-gold-400);
  --color-gold-500:  var(--core-gold-500);
  --color-gold-600:  var(--core-gold-600);
  --color-ember-400: var(--core-ember-400);
  --color-ember-500: var(--core-ember-500);
  --color-ember-600: var(--core-ember-600);

  /* Radii — generates rounded-* */
  --radius-xs:   var(--core-radius-xs);
  --radius-sm:   var(--core-radius-sm);
  --radius-md:   var(--core-radius-md);
  --radius-lg:   var(--core-radius-lg);
  --radius-xl:   var(--core-radius-xl);
  --radius-2xl:  var(--core-radius-2xl);
  --radius-full: var(--core-radius-pill);   /* `rounded-full` maps to our pill radius */

  /* Fonts — generates font-* */
  --font-sans:    var(--core-font-sans);
  --font-mono:    var(--core-font-mono);
  --font-serif:   var(--core-font-serif);
  --font-display: var(--core-font-display);

  /* Shadows — generates shadow-* */
  --shadow-1: var(--core-shadow-1);
  --shadow-2: var(--core-shadow-2);
  --shadow-3: var(--core-shadow-3);
}
```

**Consumer flow (Tailwind v4):**

```css
/* app.css */
@import "tailwindcss";
@import "@dappcore/ui/tokens/tailwind";
```

```html
<body data-brand="lethean">
  <button class="bg-brand-500 text-fg-0 rounded-md font-sans shadow-2">Save</button>
</body>
```

Brand switching just works: `data-brand="lethean"` redefines `--core-brand-500`, which Tailwind's `bg-brand-500` references through the `@theme` indirection, which CSS resolves at paint time. No rebuild needed.

**Spacing is intentionally left to Tailwind's defaults** (4px step). The lib's tokens are about brand + surface + type + state, not layout primitives.

### 5.6 File layout

```
src/tokens/
├── tokens.css            :root neutral + prefers-color-scheme dark + [data-mode] overrides
├── brand-hostuk.css      hue 305
├── brand-lethean.css     hue 270
├── brand-ofm.css         hue 28
├── platform-darwin.css   SF Pro + tighter radii
├── platform-ios.css      SF Pro Text + 17pt + curvier radii
├── index.css             @import tokens + all brands + all platforms
└── tailwind.css          imports index.css + @theme bridge
```

### 5.7 Out of `src/tokens/` (deliberate)

- No skin-layer presentational classes (`.surface .btn`, `.card`, `.pill`). Those live in Lethean-5/Host UK skins.
- No Google Fonts `@import`. Consumers load fonts themselves; we document the recommended set in a comment block.
- No spacing scale (Tailwind defaults cover this for our primary consumer; non-Tailwind users use raw px).

## 6. Colour helpers (`src/colour/`)

Tokens are oklch-authored, so the JS module is **oklch-first.** Agents writing canvas / SVG / charts get a small toolkit without bailing to npm.

### 6.1 Internal representation

```ts
export type Colour = { l: number; c: number; h: number; alpha: number };
// l: 0..1, c: 0..0.4-ish, h: 0..360, alpha: 0..1
```

### 6.2 API surface (six modules)

```ts
// parse.ts
parseColour(input: string): Colour;            // accepts oklch(), rgb(), hsl(), #hex
formatOklch(c: Colour): string;                // "oklch(0.54 0.16 305 / 1)"

// convert.ts                                  // W3C CSS Color Level 4 formulas
oklchToRgb(c: Colour): { r, g, b, alpha };     // sRGB 0..1, with gamut-clip
rgbToOklch(rgb): Colour;
hexToOklch(hex: string): Colour;
oklchToHex(c: Colour): string;
hslToOklch(hsl): Colour;
oklchToHsl(c: Colour): { h, s, l, alpha };

// rotate.ts
rotateHue(c: Colour | string, deg: number): Colour;
lighten(c: Colour | string, amount: number): Colour;
darken(c: Colour | string, amount: number): Colour;
adjustChroma(c: Colour | string, delta: number): Colour;

// mix.ts
mix(a: Colour | string, b: Colour | string, t: number): Colour;

// contrast.ts                                 // WCAG 2.x luminance-based
contrastRatio(a, b): number;
pickReadable(bg, candidates): Colour;
isLight(c): boolean;

// resolve.ts                                  // bridge to CSS custom properties
resolveCssVar(name: `--${string}`, scope?: Element): string;
resolveColour(name: `--${string}`, scope?: Element): Colour;
```

### 6.3 Key design notes

- **Oklch-internal everywhere** — every helper accepts `Colour | string` and normalises via `parseColour` at the entry. Saves callers from converting up front.
- **Gamut clipping built in** — `oklchToRgb` chroma-reduces out-of-gamut oklch colours to in-gamut sRGB instead of returning negative components.
- **`color-mix(in oklch, …)` is native CSS already** — `mix()` is for non-CSS contexts (canvas, SVG, computed colour for an animation lerp). Module header documents this so agents don't reach for `mix()` when they should write CSS.
- **`resolveCssVar` is the bridge** — chart/canvas code calls `resolveColour('--core-brand-500')` and gets a `Colour` ready for any sink.
- **No HSL workflows** — supported (`hslToOklch`/`oklchToHsl`) so callers receiving HSL can normalise. Recommendations stay oklch-first.

### 6.4 Out of scope

- APCA contrast (WCAG 2.x suffices until a caller asks).
- Named colour parsing (`"red"`, `"slategrey"`) — 150+ entries, agents pass tokens or oklch.
- ΔE / colour-distance metrics. Until a caller asks.

## 7. Math (`src/math/`) and animation context (`src/animation/`)

### 7.1 `src/math/`

```
src/math/
├── easing.ts        Easing dict + EasingFn type        (port from core/ide easing.ts)
├── interpolate.ts   interpolate(), animate()           (port — keyframes + single-segment tween)
├── clamp.ts         clamp, lerp, mapRange, wrap, snap  (clamp ported, rest new ~5 lines each)
└── index.ts
```

```ts
export type EasingFn = (t: number) => number;
export const Easing: Record<string, EasingFn>;          // 23 easings

export function interpolate(input: number[], output: number[], ease?: EasingFn | EasingFn[]): EasingFn;
export function animate(opts: { from?, to?, start?, end?, ease? }): EasingFn;

export function clamp(v: number, min: number, max: number): number;
export function lerp(a: number, b: number, t: number): number;
export function mapRange(v: number, src: [number, number], dst: [number, number]): number;
export function wrap(v: number, min: number, max: number): number;   // cyclic
export function snap(v: number, step: number, origin?: number): number;
```

### 7.2 `src/animation/`

Direct port of `core/ide/frontend/lit/src/elements/animation/context.ts`, with context keys renamed from `lethean-*` to `core-*`.

```ts
import { createContext } from '@lit/context';

export interface TimelineState {
  time: number; duration: number; playing: boolean;
  setTime?: (t: number) => void;
  setPlaying?: (p: boolean) => void;
}

export interface SpriteState {
  localTime: number; progress: number; duration: number; visible: boolean;
}

export const timelineContext = createContext<TimelineState>('core-timeline');
export const spriteContext  = createContext<SpriteState>('core-sprite');
```

**Engine deferred.** The timeline/stage/sprite implementations (`lethean-stage.ts`, `lethean-sprite.ts`, `lethean-image-sprite.ts`, `lethean-text-sprite.ts`, `lethean-rect-sprite.ts`, `lethean-playback-bar.ts`) are component-shaped — they belong in the second-track brainstorm. The published `timelineContext` and `spriteContext` interfaces are useful protocol on their own: anyone who needs a stage today can implement a minimal one against them.

## 8. DOM, a11y, platform, brand

These four share infrastructure (`ReactiveController`, `AbortController`-based listeners, `[data-*]` attribute observation) and ship together.

### 8.1 `src/dom/`

```
src/dom/
├── focus-trap.ts        FocusTrap (ReactiveController). Captures Tab/Shift+Tab; restores on disconnect.
├── click-outside.ts     ClickOutsideController + watchClickOutside helper.
├── key-match.ts         matchKey, parseShortcut, formatShortcut
├── listener.ts          addAbortableListener — removed on AbortSignal abort
├── observer.ts          ResizeObserverController, IntersectionObserverController, MutationObserverController
└── index.ts
```

**API style rule:** pure reads are functions; stateful + lifecycle-bound things are `ReactiveController`s. Lit's `ReactiveController` ships in `lit` core — no extra dep.

```ts
class MyDialog extends LitElement {
  private trap = new FocusTrap(this);
  open()  { this.trap.activate(); }
  close() { this.trap.deactivate(); }
}

if (matchKey(ev, 'cmd+k')) openPalette();   // 'cmd' resolves to ⌘ on macOS, ctrl elsewhere
formatShortcut('cmd+k');                     // → "⌘K" on macOS, "Ctrl+K" elsewhere
```

`key-match` deliberately knows about `platform/` for the cmd/ctrl resolution — small, intentional cross-module coupling.

### 8.2 `src/a11y/`

```
src/a11y/
├── announce.ts     announce(text, level: 'polite' | 'assertive')
├── focus.ts        saveFocus() / restoreFocus(handle)
├── prefers.ts      prefersReducedMotion(), PrefersReducedMotionController + same for contrast, color-scheme
├── aria.ts         generateId(prefix), setAriaLabel, linkLabelledBy
└── index.ts
```

`announce` lazy-mounts a singleton `<div aria-live>` at body level; first call instantiates it. Subsequent calls re-use the same element.

```ts
announce("Saved.");                          // polite by default
announce("Connection lost", 'assertive');

const reduced = prefersReducedMotion();      // one-shot read

class MyAnim extends LitElement {
  private rm = new PrefersReducedMotionController(this);   // re-renders on change
  render() { return this.rm.value ? html`<static/>` : html`<animated/>`; }
}

const id = generateId('core-input');         // "core-input-3"
linkLabelledBy(inputEl, labelEl);            // wires aria-labelledby + id both ways
```

### 8.3 `src/platform/`

```
src/platform/
├── platform.ts     getPlatform() → 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown'
├── native.ts       isNativeShell(), getNativeShell() → 'wails' | 'ios-app' | 'ipados-app' | null
└── index.ts
```

Uses `navigator.userAgentData` when available; falls back to UA-string sniffing. `getNativeShell()` reads UA markers + `window.go` (Wails marker) + iOS WKWebView marker. One-shot reads, no controller — platform doesn't change at runtime.

### 8.4 `src/brand/`

```
src/brand/
├── brand.ts        getBrand(el?), BrandController
├── mode.ts         getMode(el?),  ModeController
└── index.ts
```

`getBrand(el?)` walks ancestors looking for the nearest `[data-brand]`. `BrandController` uses `dom/observer.ts`'s `MutationObserverController` to watch and notify on attribute change.

```ts
class MyBadge extends LitElement {
  private brand = new BrandController(this);
  render() {
    return html`<span class=${`badge brand-${this.brand.value}`}>${this.brand.name}</span>`;
  }
}
```

`brand.value` returns the raw `[data-brand]` string (or `null` when no ancestor sets one) — deliberately typed as `string | null` rather than a narrowed union, so the lib stays brand-neutral and consumers can register new brand CSS files (`brand-foo.css`) without touching the library types. `brand.name` reads `--core-brand-name` from the resolved CSS scope.

### 8.5 Module dependencies

```
dom/observer  ─┬→ brand/brand,mode
               └→ a11y/prefers
platform        → dom/key-match
```

Nothing else cross-imports. All other modules are self-contained.

## 9. Source-of-truth ledger

Every ported file gets a one-line header naming the original path so future archaeology is one grep away.

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// Ported from: core/ide/frontend/lit/src/elements/animation/easing.ts (2026-05-07).
```

Files that are net-new (no upstream port) get an explicit provenance line:

```ts
// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
```

## 10. Testing

Vitest + happy-dom, already configured in the lib. Each new file gets two test files (matches existing convention in `src/formatters/` and `src/crypto/`):

- `<name>.test.ts` — behaviour. One `describe` block per public export.
- `<name>_example_test.ts` — AX rule: each test is a runnable, copy-pastable usage example. Doubles as living docs.

**Coverage bar:** every public function has at least one behaviour test; every `ReactiveController` has an attach/notify/detach happy-dom test. Target ≥ 80% lines across new files (matches the RFC §10 target).

## 11. Acceptance

The PR is done when:

1. `npm run typecheck` is clean.
2. `npm run test` passes; coverage ≥ 80% across new files.
3. `npm run build` (`tsc`) emits `.js` + `.d.ts` for every new module.
4. `package.json` `exports` map contains every sub-path; each sub-path imports clean from a fresh project (smoke script: temp `tsc --module nodenext` config that `import`s each path).
5. Tokens CSS validates against W3C CSS Color Level 4 (no malformed oklch, no missing fallbacks for `color-mix`).
6. `src/tokens/index.css` imported in happy-dom produces working `[data-brand="lethean"]` switching (paint div, read computed style, flip attr, assert var changed).
7. `src/tokens/tailwind.css` imported in a Tailwind v4 fixture generates `bg-brand-500` referencing `--core-brand-500` (smoke test: Vite + Tailwind v4 fixture under `tests/integration/tailwind/`).
8. README + CLAUDE.md reframed to CoreUI identity; `package.json` `homepage` → `https://core.help`; `description` brand-neutral.
9. RFC.md untouched — flagged separately as a follow-up rev.

## 12. Commit pacing

One bundled PR; commits land in dependency order so the diff is reviewable in passes. Conventional Commits (matches the lib's existing style):

```
1.  feat(tokens): extract core-* design tokens from core/ide
2.  feat(tokens): tailwind v4 @theme bridge
3.  feat(colour): add oklch-first colour helpers
4.  feat(math): port easing + add lerp/mapRange/wrap/snap
5.  feat(animation): port timelineContext + spriteContext (engine deferred)
6.  feat(dom): focus-trap, click-outside, key-match, observers, abortable listener
7.  feat(a11y): announce, save/restoreFocus, prefers-* controllers, aria helpers
8.  feat(platform): platform + native-shell detection
9.  feat(brand): BrandController + ModeController over [data-brand]/[data-mode]
10. chore(pkg): exports map, add @lit/context dep, bump 0.0.1 → 0.2.0
11. docs: reframe README + CLAUDE.md to CoreUI identity, homepage core.help
```

Version bump: **0.2.0**, not 0.1.0. The roadmap reserves 0.1 for the formatter foundation (already shipped in commit `64d1f69`); this PR is the v0.2 utils layer that slots in before v0.3 (the seed `<core-data-table>`).

## 13. Risk register

| Risk | Mitigation |
|---|---|
| `@lit/context` version skew with `lit` | Lock to `^1.1.x`; verify against `lit@^3.2.x` in CI |
| happy-dom gaps in `MutationObserver` / `ResizeObserver` | Tests use minimal shims; document fallbacks for jsdom users |
| oklch in WebKit < 15.4 | `oklchToHex()` precomputes gamut-clipped sRGB fallbacks consumers can drop in at build time |
| Tailwind v4 `@theme` semantic changes during their beta | Pin Tailwind v4 to the version we test against in the integration fixture; document the matrix |
| Brand-neutral default surprises Lethean Desktop consumers | Lethean Desktop already sets `data-brand="lethean"` on `lethean-shell` — no behaviour change for it |

## 14. Estimates

| Layer | Source lines | Test lines |
|---|---:|---:|
| Tokens (incl. Tailwind bridge) | ~400 | ~80 |
| Colour | ~280 | ~250 |
| Math | ~200 (mostly ported) | ~250 |
| Animation context | ~30 | ~30 |
| DOM | ~300 | ~250 |
| a11y | ~200 | ~180 |
| Platform | ~80 | ~80 |
| Brand | ~100 | ~100 |
| Identity docs | ~50 | — |
| **Total** | **~1,640** | **~1,220** |

## 15. Follow-ups (out of this PR)

1. **Components track brainstorm** — per-component path for porting `<core-button>`, `<core-pill>`, `<core-status-dot>`, `<core-icon>`, etc., with light DOM + `::part()` + ARIA + ElementInternals per RFC §4.
2. **Animation engine port** — how to expose the timeline/sprite engine without bringing the showcase pages along. Anchors on the `animation/context.ts` interfaces shipped in this PR.
3. **RFC.md rev** — acknowledge `tokens/`, `colour/`, `math/`, `animation/`, `dom/`, `a11y/`, `platform/`, `brand/` as v0.2 layers; clarify the brand-neutral identity story; document the Tailwind v4 bridge.
4. **core.help docs site** — bootstrap the brand-neutral docs site at `https://core.help`. Out of scope for the lib repo; lands in its own project.

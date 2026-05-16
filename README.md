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

## Primitives (v0.5)

Eleven brand-neutral Web Components ready for any UI agent:

```html
<core-button variant="primary" type="submit">Save</core-button>
<core-toggle name="notify" value="yes" checked>Notify me</core-toggle>
<core-status-dot state="good" pulse aria-label="Online"></core-status-dot>
<core-pill state="brand">
  <core-icon slot="leading" name="check" decorative></core-icon>
  Active
</core-pill>
<core-icon name="search" size="lg"></core-icon>
<core-label for="email" required>Email</core-label>
<core-card elevation="raised" interactive>Body content</core-card>
<core-glass dark radius="20px"><p>Floating panel</p></core-glass>
<core-window-controls></core-window-controls>          <!-- auto-detects -->
<core-rail href="/dashboard" active>Dashboard</core-rail>
<core-sparkline kind="area" points="1,3,2,5,4,7,6"></core-sparkline>
```

Light DOM, `::part()`-style hooks via attribute selectors, brandable via
`[data-brand]` (all primitives consume `--core-*` tokens). Default styles
ship as sibling `.css` files; import the aggregator for one-shot setup:

```css
@import "@dappcore/ui/primitives/index.css";
```

The `<core-icon>` registry ships 12 default icons (check, x, chevrons,
plus/minus, info/warning/danger, search). Register your own with
`registerIcon(name, svg)` or drop SVG inline via the default slot.

## Design canon

[RFC.md](RFC.md) — full spec including the pipe registry, component contracts, polyglot story. Read this for the why.

[docs/superpowers/specs/](docs/superpowers/specs/) — incremental specs (v0.2 utils, future tracks).

## Roadmap

See [RFC.md §16](RFC.md#16-roadmap). Currently at **v0.5 — primitives layer** (eleven brand-neutral Web Components on top of the v0.2 utils foundation). Next ships the seed `<core-data-table>` per [RFC.md §16](RFC.md#16-roadmap).

## Licence

[EUPL-1.2](LICENCE).

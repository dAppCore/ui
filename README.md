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

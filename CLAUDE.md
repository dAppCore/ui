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

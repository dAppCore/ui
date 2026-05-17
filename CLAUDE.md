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

## Layer map (v0.4 — current)

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
| `src/primitives/` | 11 brand-neutral Web Components: button, toggle, status-dot, pill, icon, label, card, glass, window-controls, rail, sparkline. Light DOM via shared `CoreElement` base. Icon registry + 12 default icons. ElementInternals on button + toggle for form participation. |
| `src/formatters/` | Existing — pipe registry + 12 built-in formatters |
| `src/crypto/` | Existing — HMAC, lthnHash, UUIDv7, quasi-salt |
| `src/forms/` | Form-input Web Components. Tier 1 (v0.2): `<core-form>` (CSRF + HMAC + honeypot + idempotency), `<core-field>` (RSA-OAEP encryption). Tier 2 (v0.7): `<core-input>`, `<core-textarea>`, `<core-select>` (native inner + slotted options), `<core-checkbox>`, `<core-radio>`, `<core-radio-group>`. All v0.7 primitives extend `CoreFormElement` (Shadow DOM, full Constraint Validation surface, ElementInternals form-association). |
| `src/surfaces/` | Overlay + anchored Web Components (v0.8). `<core-dialog>` (modal/non-modal, 5 sizes), `<core-drawer>` (4 logical sides), `<core-popover>` (12-placement anchored panel), `<core-tooltip>` (hover/focus descriptor, auto aria-describedby). Base classes: `CoreOverlayElement` (dialog+drawer), `CoreAnchoredElement` (popover+tooltip). Pure utilities: `focus-trap.ts`, `anchor-position.ts` (CSS detection probe + JS fallback geometry). |
| `src/data-table/` | Data-presentation Web Components (v0.3). `<core-data-table>` (Shadow DOM host — sort, pagination, selection, density, sticky-header, loading/empty) + `<core-column>` (light-DOM metadata-only). Pure utilities: `_shared/sort.ts` (type-aware comparators + sortRows), `_shared/pagination.ts` (pageCount, pageSlice, pageWindow). Independent tier — no dependency on v0.5 primitives, v0.7 forms, or v0.8 surfaces. |
| `src/tabs/` | Tabbed-interface Web Components (v0.4). `<core-tabs>` (Shadow DOM container with state, indicator, keyboard nav) + `<core-tab>` (light DOM trigger) + `<core-tabpanel>` (light DOM panel). W3C ARIA APG tablist pattern: auto-wired ARIA, roving tabindex, sliding indicator, horizontal + vertical orientation, auto + manual activation, disabled tab skipping. Independent tier — no dependency on v0.5/v0.6/v0.7/v0.8/v0.3. |

## Critical contracts

| Contract | Detail |
|---|---|
| Light DOM by default | No Shadow DOM unless backdrop isolation requires it (`<core-dialog>`, `<core-drawer>`, `<core-popover>`, `<core-tooltip>`). Tokens.css inherits through. |
| Part-based skinning | Every visually significant internal element has a `part="..."` attribute. Skin layers target via standard attribute selectors (`core-button [part="base"]`) — the Shadow-DOM `::part()` pseudo-element is NOT used (primitives are light DOM). |
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
- Shadow DOM in primitives — v0.5 primitives are light DOM. Shadow DOM is reserved for v0.8 surface components needing backdrop isolation.
- `::part()` pseudo-element syntax in skin layers — Shadow-DOM-only. Use attribute selectors (`core-button [part="base"]`) for light-DOM primitives.
- Vi-character primitives in CoreUI — `<core-vi>` / `<core-raven>` belong in a Lethean-branded skin or `@dappcore/vi`. CoreUI stays brand-neutral.
- Light DOM in v0.7 form primitives — Shadow DOM is the v0.7 contract (RFC §4 exception for slot distribution). Use `CoreFormElement` base which uses Lit's default Shadow DOM render root.
- `private nonce` field on classes extending `LitElement` — conflicts with `HTMLElement.nonce` (CSP). Use `submissionNonce` or similar.
- Node `Buffer` references in browser-only code — `@dappcore/ui` is browser-only; use `btoa`/`atob` directly without fallback guards.
- `@floating-ui/*`, `popper.js`, `tippy.js`, `tether` — external positioning libraries. v0.8 uses CSS Anchor Positioning (native) + `anchor-position.ts` JS fallback. Adding an external positioning dep reintroduces the zero-dep contract violation.
- `CSS.supports('anchor-name', ...)` for anchor positioning detection — returns true in happy-dom incorrectly. Use `supportsAnchorPositioning()` from `src/surfaces/_shared/anchor-position.ts` (probe via computed style).
- `ag-grid-*`, `@tanstack/react-table`, `react-table`, `material-react-table` — external table libraries. v0.3 data-table is self-contained with zero deps beyond Lit. Adding an external table dep reintroduces the zero-dep contract violation.
- `el.rows.sort()` / in-place mutation of the `rows` array inside data-table — always work on a copy via `sortRows()`. The `_originalRows` snapshot is the restoration source for the tri-state unsorted path.
- `CSS.supports('position', 'sticky')` feature detection for sticky-header — sticky is baseline across all target browsers. Use the `[sticky-header]` attribute path and document the `max-height` requirement on the host instead.
- `@reach/tabs`, `react-tabs`, jQuery tabs plugins, or any external tabs library — v0.4 tabs is self-contained with zero deps beyond Lit. Adding an external tabs dep reintroduces the zero-dep contract violation.
- `_onKeydown` key check using ONLY `'Space'` string literal — real browsers send `' '` (single space character). Check for both `' '` and `'Space'` and `'Enter'` to cover browsers + happy-dom.
- `position: sticky` on `[part="tablist"]` — sticky tablist is deferred to v0.4.1; do not add without an explicit follow-up.

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

<!-- SPDX-Licence-Identifier: EUPL-1.2 -->

# CLAUDE.md — @dappcore/ui

> Agent context summary for `dAppCore/ui`. Read [RFC.md](RFC.md) for the full design. This file is the fast-load context.

## What this is

Web Component library — unstyled but opinionated — for the dappco.re polyglot stack. Companion to CorePHP `<core:*>` tags and `dappco.re/go/html` Flexy-revival rendering. Three-layer architecture: this library (behaviour) → Lethean-N / Host UK / OFM skin (visual) → consumer apps.

Templates are **valid HTML** (Flexy property preserved). A `<core-data-table>` opens in a browser, opens in a visual editor, renders example state without a build tool.

## Identity

- **Package:** `@dappcore/ui`
- **Tag prefix:** `<core-*>` (mirrors CorePHP's `<core:*>`)
- **Repo:** `github.com/dAppCore/ui`
- **Licence:** EUPL-1.2

## Critical contracts

| Contract | Detail |
|---|---|
| Light DOM by default | No Shadow DOM unless backdrop isolation requires it (`<core-dialog>`, `<core-drawer>`, `<core-popover>`, `<core-tooltip>`). Tokens.css inherits through. |
| `::part()` skinning | Every visually significant internal element has a `part` attribute. Skin layer targets via `::part()`. |
| CSS custom properties | Tunables exposed as `--core-<component>-<property>`. Documented per component. Library never hard-codes visual values. |
| Slot-driven extension | Default slot for content. Named slots for predictable extension points. |
| Form participation | Inputs use `ElementInternals` for native `<form>` integration. |
| ARIA + keyboard | Correct ARIA emitted from the start. Keyboard handlers wired. |
| `core-*` event names | All custom events use the `core-` prefix. Bubbles; composes where needed to cross shadow boundaries. |
| Property/attribute reflection | `value`, `disabled`, `open` reflect both ways. |

## The pipe registry — the single most important design choice

A unified grammar for formatting values, shared by reference with `dappco.re/go/html` (server side) and PHP `core-template` (CorePHP).

Grammar: `{ expression | formatter[:arg]... | other-formatter[:arg]... }`

Three surfaces, one engine:
- Attribute shorthand on columns / format elements: `pipe="bytes"`
- Inline in templates: `{value | bytes}`
- Standalone element: `<core-format-bytes value=${row.size}></core-format-bytes>`

All three resolve to the same `core.registerFormatter("name", fn)` registration. Built-ins: `bytes`, `number`, `currency`, `percent`, `date`, `relative-time`, `duration`, `boolean`, `truncate`, `mask`, `nbsp`, `sanitize`. No dependency on `dappco.re/go/i18n` — `Intl.NumberFormat` / `Intl.DateTimeFormat` underneath, locale via `navigator.language` unless overridden.

## Component categories

| Category | Purpose | Example tags |
|---|---|---|
| Formatters | Built-in + custom pipe functions | `<core-format>`, `<core-format-bytes>`, etc. |
| Structural | Flexy-modernised primitives | `<core-foreach>`, `<core-if>`, `<core-each-section>`, `<core-await>` |
| Primitives | Migrated from Lethean-5 | `<core-button>`, `<core-toggle>`, `<core-status-dot>`, `<core-pill>`, `<core-sparkline>`, `<core-label>`, `<core-icon>`, `<core-window-controls>`, `<core-rail>` |
| Table | The seed component | `<core-data-table>`, `<core-column>` |
| Forms (v0.7) | Native form participation | `<core-input>`, `<core-select>`, `<core-checkbox>`, `<core-textarea>`, `<core-radio-group>` |
| Surfaces (v0.8) | Backdrop-isolated overlays | `<core-dialog>`, `<core-drawer>`, `<core-popover>`, `<core-tooltip>` |

## The seed: `<core-data-table>`

Drove this repo's creation. Attributes: `src` (data endpoint), `live` (SSE stream for updates), `page-size`, `selection`. Column slots accept `<template>` children for custom cell rendering; without one, the cell renders `value | column.pipe`. Live-update wire format documented in [RFC.md §8.3](RFC.md#83-live-update-wire-format).

SSR via `dappco.re/go/html` — server walks the template, evaluates `<core-foreach>` + pipes, emits HTML shell with first-page data inlined as a sibling `<script type="application/json">`. Browser upgrades the component, picks up the payload, takes over for interactivity.

## Polyglot story

Three implementations of one component contract:

| Surface | Implementation | Notes |
|---|---|---|
| Browser (Lit) | `@dappcore/ui` ← this repo | Web Components, client hydration |
| Go server | `dappco.re/go/html` | Flexy-revival, WASM, GrammarImprint |
| PHP server | `core-template` | CorePHP `<core:*>` rendering |

Same component tags, same pipe grammar, same registered formatter names. A template is renderable by any of the three; output is byte-identical.

## Distribution

- **ESM only.** No build step required for consumption.
- **NPM:** `@dappcore/ui`. Sub-paths for tree-shaking: `@dappcore/ui/table`, `@dappcore/ui/formatters`, `@dappcore/ui/structural`.
- **Submodule:** `external/ui/` in consumer repos (dappco.re-native pattern).
- **TypeScript:** `target: ES2022`, `lib: ES2022, DOM`. Lit decorators (stage-3 syntax).
- **Tests:** Vitest + happy-dom. Each component carries `<component>.test.ts` + `<component>_example_test.ts`.

## Banned in source

- React, Vue, Angular, Svelte — Web Components only.
- Tailwind class hard-coding — skins do that, library stays unstyled.
- Build-time template compilation as a hard requirement — browsers and standards do enough.
- JSX — couples to a runtime.
- Direct `<form>` `formdata` event listening — use `ElementInternals` instead.
- Shadow DOM "because reasons" — light DOM unless backdrop isolation is actually needed.
- `Intl.*` workarounds — if a formatter needs locale-aware output, use `Intl`.

## Test convention

`<component>.test.ts` for behaviour. `<component>_example_test.ts` for the "comments are usage examples" AX rule applied to JS — these files double as live documentation. Run with `vitest run` (CI) or `vitest` (watch).

## Cross-references

- [RFC.md](RFC.md) — full design canon
- `dappco.re/go/html` — Go server-side renderer with shared pipe grammar
- `lthn-desktop/docs/design/lit/` — Lethean-5 primitives (migration source for v0.5)
- `core-template` (CorePHP `<core:*>`) — PHP server-side renderer
- `RFC-CORE-006-GO-HTML.md` — GrammarImprint primitive (mount-point for `grammar-imprint` pipe)
- `RFC-CORE-008-AGENT-EXPERIENCE.md` — AX rules (comments-as-usage-examples applied to JS)

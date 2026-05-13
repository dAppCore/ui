<!-- SPDX-Licence-Identifier: EUPL-1.2 -->

# dappcore/ui — Web Component library for the dappco.re stack

> *Status:* Proposed (Draft 0). *Authors:* Snider, Cladius. *Reviewers:* tbd.
> *Companions:* `dappco.re/go/html` (server-side renderer with the same pipe grammar), `Lethean-5` (styled skin built on this).

## 1. Mission

A Web Component library for the polyglot dappco.re stack. **Unstyled but opinionated:** behaviour, accessibility, keyboard handling and form participation are baked in; visual presentation is left to consumers via CSS custom properties and `::part()` hooks.

The library exists because every consumer of the stack currently re-rolls the same primitives — `lthn-desktop` has 9 in `Lethean-5`, `core/ide` has its own copy, the Host UK and OFM sites each carry a third. CorePHP took this burden off the server side with `<core:button>` / Livewire-Flux tags. The JavaScript / Lit world has had no equivalent. `dappcore/ui` is that equivalent.

It deliberately follows the canonical Flexy property: **templates are valid HTML**. A `<core-data-table>` opens in a browser as-is (with empty rows visible), opens in a visual editor as-is, and is editable without a build tool. The "magic" lives in attributes the browser silently ignores until a Web Component upgrade or a server-side compile pass interprets them.

## 2. Three-layer architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Consumer apps                                                   │
│  lthn-desktop · core/ide · host.uk.com · lthn.ai · OFM · ...     │
└──────────────────────────────────────────────────────────────────┘
                              │ composes
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Skin layer                                                      │
│  Lethean-N · Host UK · OFM · BugSETI · dApp.fm                   │
│  (themes via tokens.css, ::part(), CSS custom props)             │
└──────────────────────────────────────────────────────────────────┘
                              │ wraps
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  dappcore/ui  ← this repo                                        │
│  Unstyled Web Components, formatters, structural tags, table.    │
│  Slots + ARIA + keyboard nav + form participation + light DOM.   │
└──────────────────────────────────────────────────────────────────┘
                              │ shares pipe registry with
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  dappco.re/go/html                                               │
│  Server-side renderer. Same pipe grammar, same component tags.   │
└──────────────────────────────────────────────────────────────────┘
```

Same shape as `Radix → shadcn → consumer` in the React ecosystem, but built on standards-native Web Components with light DOM so tokens.css inherits cleanly through the boundary.

## 3. Naming and import paths

- **Tag prefix:** `<core-*>`. Mirrors CorePHP's `<core:*>` one-for-one; a developer reading the polyglot stack sees the same primitive name on both sides.
- **NPM package:** `@dappcore/ui`. ESM-only, no bundle step required for consumption.
- **Git path:** `github.com/dAppCore/ui`, vendored as a submodule at `external/ui/` in consumer repos that prefer the dappco.re submodule pattern over npm.
- **Module entry:** `@dappcore/ui` re-exports every component; sub-paths exist for tree-shaking (`@dappcore/ui/formatters`, `@dappcore/ui/table`, `@dappcore/ui/structural`).

## 4. Component conventions

All components in this library follow the same rules:

| Rule | Detail |
|---|---|
| Light DOM by default | No Shadow DOM unless a component needs strict CSS encapsulation (e.g. `<core-dialog>` for backdrop isolation). Tokens.css inherits through. |
| `::part()` for skinnable internals | Every visually significant internal element has a `part="…"` so the skin layer can target it without piercing Shadow DOM. |
| CSS custom properties for tunables | `--core-table-row-height`, `--core-button-radius`, etc. Documented per component. Skins set these; the library never hard-codes values. |
| Slot-driven content | Children → default slot. Named slots for predictable extension points (`slot="header"`, `slot="actions"`). |
| Form participation | Inputs use `ElementInternals` to participate in `<form>` natively. `name`, `value`, `disabled`, `required` work like native HTML. |
| ARIA baked in | Components emit correct ARIA from the start. Keyboard handlers wired (Enter/Space on buttons, arrow keys on lists, Esc on dialogs). |
| Event names use `core-*` prefix | `core-select`, `core-change`, `core-row-click`. Bubbles by default. Composed where the event needs to cross shadow boundaries. |
| Reflect properties to attributes | `value`, `disabled`, `open` reflect both ways. Inspector-friendly. |

## 5. The pipe registry

The single largest design choice in `dappcore/ui` is the formatter mechanism, and it is shared by reference with `dappco.re/go/html`.

### 5.1 Grammar

```
{ expression | formatter[:arg[:arg]...] [| formatter[:arg]...] ... }
```

- Expressions are dotted paths against the current scope: `user.name`, `row.balance`, `event.created_at`.
- Pipes are left-to-right. The output of one pipe is the input of the next.
- Arguments after `:` are positional. `currency:GBP`, `truncate:40:…`, `date:relative`.
- Whitespace around `|` and `:` is optional and stripped.
- No quoting needed for v0. If an argument needs a literal `|` or `:`, register a single-purpose formatter instead.

Examples:

```
{user.email                                    } → "snider@lthn.ai"
{user.email | mask                             } → "s****@l****.ai"
{user.email | mask | truncate:20               } → "s****@l****.ai"
{user.size  | bytes                            } → "1.4 MB"
{user.size  | bytes:binary                     } → "1.34 MiB"
{user.price | currency:GBP                     } → "£12.50"
{user.created_at | date:relative               } → "3 hours ago"
{user.bio   | sanitize | truncate:120 | nbsp   } → safe redacted snippet
```

### 5.2 Two facades, one engine

| Surface | Where it lives | Example |
|---|---|---|
| Attribute shorthand | `<core-column pipe="…">`, `<core-format pipe="…">` | `<core-column field="size" pipe="bytes">` |
| Inline template syntax | `{… | …}` inside slotted templates | `<template>{value | bytes}</template>` |
| Standalone element | `<core-format-{name}>` for non-table use | `<core-format-bytes value=${row.size}></core-format-bytes>` |

All three resolve to the same registered function. `core.registerFormatter("name", fn)` lands a formatter once and all three surfaces pick it up.

### 5.3 Built-in formatters (v0)

| Name | Purpose | Example | Args |
|---|---|---|---|
| `bytes` | Human-readable file size | `1024 → "1.0 KB"` | optional: `binary` (1024 base) |
| `number` | Locale-formatted number | `1234567 → "1,234,567"` | optional: precision |
| `currency` | Money | `12.5 → "£12.50"` | currency code, default `GBP` |
| `percent` | Percentage | `0.42 → "42%"` | optional: precision |
| `date` | Date/time | `2026-05-13 → "13 May 2026"` | mode: `iso`/`short`/`long`/`relative` |
| `relative-time` | "3 hours ago" / "in 2 days" | `Date → "3 hours ago"` | – |
| `duration` | Time span | `90000 → "1m 30s"` | unit: `ms`/`s`, output: `short`/`long` |
| `boolean` | Yes/no rendering | `true → "Yes"` | optional: `yes:no` overrides |
| `truncate` | Cap string length | `"hello world" → "hello…"` | length, optional ellipsis |
| `mask` | Redact PII | `"snider@lthn.ai" → "s****@l****.ai"` | – |
| `nbsp` | Replace spaces with `&nbsp;` | `"OFM agency" → "OFM agency"` | – |
| `sanitize` | Strip HTML | `"<b>x</b>" → "x"` | optional allowlist |

All built-ins use `Intl.NumberFormat` / `Intl.DateTimeFormat` where applicable. **No dependency on `dappco.re/go/i18n`** — the locale defaults to `navigator.language` (browser-decided) unless overridden via `<core-locale lang="en-GB">` on a parent element.

### 5.4 Custom formatters

```js
import { registerFormatter } from '@dappcore/ui/formatters';

registerFormatter('eth-address', (v) =>
  typeof v === 'string' && v.length > 10
    ? `${v.slice(0, 6)}…${v.slice(-4)}`
    : v
);
```

Once registered, immediately usable as `pipe="eth-address"`, `{addr | eth-address}`, and `<core-format-eth-address>` (auto-generated element wrapper).

### 5.5 Server / client symmetry

The same registry exists on the Go side (`dappco.re/go/html`). A pipe registered there is available on both surfaces. When a template is server-rendered by `go-html` and then hydrated by `dappcore/ui` in the browser, formatters produce byte-identical output (both use `Intl.*` underneath, both default to `navigator.language` / the matching Go locale tag). No hydration mismatches.

## 6. Structural components

These are the Flexy-modernised primitives — valid HTML that the browser tolerates, that a designer can edit, that go-html and dappcore/ui both interpret.

### 6.1 `<core-foreach>`

```html
<core-foreach in="users" as="user">
  <li>{user.name} — {user.email | mask}</li>
</core-foreach>
```

Attributes: `in` (scope path), `as` (binding name), optional `index-as`, `empty` slot for zero-results.

### 6.2 `<core-if>`

```html
<core-if test="user.is_admin">
  <span class="badge">Admin</span>
</core-if>
<core-if test="!user.verified">
  <slot name="else">Pending verification</slot>
</core-if>
```

Boolean expression in `test`. Supports `!`, `&&`, `||`, equality on dotted paths against literals. No full JS — deliberate. If you need expressions, register a computed formatter.

### 6.3 `<core-each-section>`

```html
<core-each-section in="items" group-by="category">
  <h3 slot="heading">{group.key}</h3>
  <li>{item.name}</li>
</core-each-section>
```

Group iteration with a named slot for the group heading.

### 6.4 `<core-await>`

```html
<core-await src="/v1/users/me">
  <p slot="loading">Loading…</p>
  <p slot="error">{error.message}</p>
  <p slot="ready">Hi {data.name}</p>
</core-await>
```

Promise/fetch wrapper with named slots for each state.

## 7. Presentational components (v0)

The 9 primitives currently living in `lthn/desktop/docs/design/lit/` migrate here under the `core-*` prefix:

| Lethean-5 | dappcore/ui | Notes |
|---|---|---|
| `<lthn-btn>` | `<core-button>` | + form participation via ElementInternals |
| `<lthn-toggle>` | `<core-toggle>` | aria-switch role, keyboard nav |
| `<lthn-status-dot>` | `<core-status-dot>` | colour via `--core-status-dot-fill` |
| `<lthn-state-pill>` | `<core-pill>` | variants via `state="…"` reflected attr |
| `<lthn-sparkline>` | `<core-sparkline>` | data via slotted `<data>` children or `points="…"` |
| `<lthn-label>` | `<core-label>` | for + ariaLabelledBy plumbed |
| `<lthn-glyph>` | `<core-icon>` | name attribute, SVG sprite registry |
| `<lthn-traffic-lights>` | `<core-window-controls>` | platform-aware (macOS/Windows/Linux) |
| `<lthn-rail-row>` | `<core-rail>` | sidebar item with active/badge slots |

Lethean-5 stays as the styled skin — it imports from `@dappcore/ui` and adds CSS, no behaviour duplication. The migration is mechanical: drop `lthn-*` shadow-DOM-only customisations, route style hooks through `::part()` and CSS custom properties.

## 8. The seed component: `<core-data-table>`

The component that drove this RFC. It is the v0 deliverable and the design vehicle for every other component that follows.

### 8.1 Shape

```html
<core-data-table src="/v1/users" live page-size="50">
  <core-column field="id"         label="ID"      sortable></core-column>
  <core-column field="name"       label="Name"    sortable filter></core-column>
  <core-column field="size"       label="Size"    pipe="bytes" sortable></core-column>
  <core-column field="created_at" label="Joined"  pipe="date:relative"></core-column>
  <core-column field="email"      label="Contact" pipe="mask | truncate:24"></core-column>
  <core-column field="actions">
    <template>
      <core-button variant="ghost" @click=${(_, row) => edit(row.id)}>Edit</core-button>
    </template>
  </core-column>
  <p slot="empty">No users yet — invite one above.</p>
</core-data-table>
```

### 8.2 Attributes

| Attribute | Purpose |
|---|---|
| `src` | Endpoint to fetch rows from (GET, expects `{rows: [...], total: N}` or a plain array) |
| `live` | Open a server-sent-event stream alongside `src` for row upserts/deletes |
| `live-channel` | Override default SSE path (`<src>/stream`) |
| `page-size` | Default page size for client-mode pagination (server-driven mode passes `?page=N&size=N`) |
| `selection` | `none` (default) / `single` / `multi` |
| `client-only` | Disable any server-render hint payload; ignore SSR shell |
| `server-only` | Server-render shell only; no hydration / no `live` updates |

### 8.3 Live-update wire format

When `live` is set, the table opens an EventSource at `<src>/stream` (or `live-channel`). The server sends JSON-encoded events:

```json
{ "type": "row.upsert", "id": "abc", "data": { "name": "...", "size": 1024 } }
{ "type": "row.delete", "id": "abc" }
{ "type": "rows.replace", "rows": [ ... ] }
{ "type": "rows.append", "rows": [ ... ] }
```

The table reconciles by `id`. Animations are wired (newly-inserted rows fade in; deleted rows fade out) and controlled via `--core-table-row-anim-duration`.

### 8.4 Column slots

`<core-column>` accepts a `<template>` child for custom cell rendering. The template receives `(value, row, column)` as a function:

```html
<core-column field="status">
  <template>${(value, row) => html`
    <core-status-dot state=${value === 'active' ? 'good' : 'bad'}></core-status-dot>
    ${value}
  `}</template>
</core-column>
```

Without a `<template>`, the cell renders `value | column.pipe` (or just `value` if no pipe).

### 8.5 SSR via go-html

`dappco.re/go/html` walks the template, evaluates `<core-foreach>` and pipes server-side, and emits a fully-rendered HTML shell with the first page of data inlined. The browser loads, `<core-data-table>` upgrades, picks up the data from a sibling `<script type="application/json">` element, and takes over for sorting/filtering/live updates. No re-fetch on first paint.

## 9. GrammarImprint mount-point

The pipe registry is the natural place to mount `dappco.re/go/html`'s GrammarImprint classifier. A consumer can register:

```js
registerFormatter('grammar-imprint', (v, mode = 'tag') => {
  // mode: 'tag' (classify only), 'redact' (replace classified content),
  // 'mark' (wrap classified content in <mark data-class="…">)
});
```

Templates then read:

```html
<p>{message.body | sanitize | grammar-imprint:redact}</p>
```

GrammarImprint classifies the content without exposing the underlying string to the rest of the pipeline — privacy primitive preserved per `RFC-CORE-006`.

## 10. Distribution and build

- **No build step required for consumers.** ESM modules import directly: `import '@dappcore/ui/button'`.
- **Optional bundling** for size-sensitive deployments via Vite, Rollup, esbuild — every component is independently importable.
- **Submodule pattern** for the dappco.re-native consumers: clone `github.com/dAppCore/ui` into `external/ui/`, reference relative paths in your bundler config or import maps.
- **No transpilation in source.** TypeScript with `target: ES2022`, `lib: ES2022, DOM`. Decorators via Lit's stage-3 syntax (the same as `lthn-desktop`).
- **Tests** via Vitest + happy-dom. Coverage target 80%. Each component carries `<component>.test.ts` + `<component>_example_test.ts` (the AX-2 "comments are usage examples" rule applied to JS).

## 11. Package shape

```
@dappcore/ui/
├── package.json
├── tsconfig.json
├── README.md
├── RFC.md                    ← this file (the spec)
├── CLAUDE.md                 ← agent context summary
├── LICENCE                   ← EUPL-1.2
├── index.ts                  ← re-exports every component
├── src/
│   ├── formatters/
│   │   ├── registry.ts       ← registerFormatter, applyPipe, parsePipe
│   │   ├── bytes.ts
│   │   ├── number.ts
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   ├── relative-time.ts
│   │   ├── duration.ts
│   │   ├── boolean.ts
│   │   ├── truncate.ts
│   │   ├── mask.ts
│   │   ├── sanitize.ts
│   │   └── index.ts
│   ├── structural/
│   │   ├── foreach.ts
│   │   ├── if.ts
│   │   ├── each-section.ts
│   │   └── await.ts
│   ├── primitives/           ← migrated Lethean-5
│   │   ├── button.ts
│   │   ├── toggle.ts
│   │   ├── status-dot.ts
│   │   ├── pill.ts
│   │   ├── sparkline.ts
│   │   ├── label.ts
│   │   ├── icon.ts
│   │   ├── window-controls.ts
│   │   └── rail.ts
│   └── table/
│       ├── data-table.ts
│       ├── column.ts
│       └── format.ts         ← <core-format pipe="…">{value}</core-format>
└── tests/
    └── ...                   ← *.test.ts colocated with sources
```

## 12. Versioning

- SemVer.
- v0 is the design draft. APIs may shift before v1.
- v1 = stable component surface, frozen attribute names, frozen pipe grammar.
- Major version bumps for breaking attribute renames; minor for added components / formatters; patch for fixes.

## 13. Polyglot story

`dappcore/ui` is one of three implementations of the same component contract:

| Language | Package | Purpose |
|---|---|---|
| JavaScript (Lit) | `@dappcore/ui` ← this repo | Browser-side, Web Components, client hydration |
| Go | `dappco.re/go/html` | Server-side rendering, WASM, GrammarImprint |
| PHP | `core-template` (or wherever the `<core:*>` tags land) | CorePHP server-side rendering |

A `<core-data-table>` written in HTML is renderable by any of the three. The pipe registry is duplicated by name and contract across the three; built-in formatters produce identical output. Snider's CorePHP `<core:*>` work, `dappco.re/go/html`'s Flexy revival, and this repo are three faces of the same component grammar.

## 14. Inspirations and rejections

- **Adopt:** Flexy's "templates are valid HTML" property. Web Components' standards-native upgrade contract. Liquid/Twig's pipe grammar (modernised).
- **Reject:** Shadow DOM by default (breaks tokens.css inheritance; light DOM with `::part()` is the right axis). Build-time template compilation as a hard requirement (browsers and the standards do enough). React-style JSX-in-component (couples to a runtime). Tailwind-style atomic CSS as the library's own concern (skins do that; library stays unstyled).
- **Look at, learn from:** WebAwesome's component breadth and pro pricing (we want the breadth without the price). shadcn/ui's composability (we want it via slots, not by ejecting source). Radix's behaviour focus (correct ARIA, keyboard nav, focus management — we do the same but standards-native).

## 15. Open questions

1. **Locale default.** `navigator.language` (browser-decided) vs `en-GB` (Lethean default). The current draft says browser-decided; opt-in to a specific locale via `<core-locale lang="…">` on a parent. Confirm?
2. **Wire format for `live` SSE events.** The shape in §8.3 is a sketch — needs a sister spec in `dappco.re/go/html` so server emits exactly what client consumes. Land the spec here, server implements to it.
3. **Pipe parser depth.** v0 is "split on `|`, args after `:`". Sufficient for the v0 formatter list. Move to a proper PEG only if a real case demands it (e.g. literal `|` in a string argument).
4. **Test runner.** Vitest + happy-dom is the lthn-desktop pattern. Stick with that, or use the WebDriver-based Playwright for components that need real layout (charts, tables on tall datasets)?
5. **TypeScript strictness.** `"strict": true` from day one, no escape hatch. Confirm.

## 16. Roadmap

- **v0.1 — Foundation.** Formatter registry + 12 built-ins. `<core-format>`, `<core-format-*>` auto-elements.
- **v0.2 — Structural.** `<core-foreach>`, `<core-if>`, `<core-await>`. Browser-side only (go-html parity in a sister release).
- **v0.3 — Seed component.** `<core-data-table>` + `<core-column>` with `src` fetch, client-side sort/filter/paginate.
- **v0.4 — Live.** `live` SSE support, row upsert/delete reconciliation, animations.
- **v0.5 — Lethean-5 migration.** Port the 9 primitives. Lethean-5 becomes a thin CSS-only layer on top.
- **v0.6 — SSR symmetry.** `dappco.re/go/html` releases its Flexy-revival, the polyglot contract is closed. Templates compile to bytes from either side.
- **v0.7 — Form components.** `<core-input>`, `<core-select>`, `<core-checkbox>`, `<core-textarea>`, `<core-radio-group>` with ElementInternals form participation.
- **v0.8 — Surface components.** `<core-dialog>`, `<core-drawer>`, `<core-popover>`, `<core-tooltip>` (these need Shadow DOM for backdrop isolation — only place we use it).
- **v1.0 — Stable surface.** Attribute names, event names, pipe grammar frozen. The component contract is the version-1 ABI for the polyglot stack.

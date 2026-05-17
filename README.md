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

## Forms (v0.7)

Six form-input Web Components with native `<form>` participation:

```html
<form action="/v1/sign-up" method="POST">
  <core-label for="email" required>Email</core-label>
  <core-input id="email" type="email" name="email" required>
    <span slot="hint">Your work email</span>
  </core-input>

  <core-label for="password">Password</core-label>
  <core-input id="password" type="password" name="password" required minlength="8">
    <span slot="error">At least 8 characters.</span>
  </core-input>

  <core-radio-group name="plan" value="free" required>
    <core-radio value="free">Free</core-radio>
    <core-radio value="pro">Pro</core-radio>
    <core-radio value="enterprise">Enterprise</core-radio>
  </core-radio-group>

  <core-checkbox name="terms" required>
    I accept the terms of service
  </core-checkbox>

  <button type="submit">Sign up</button>
</form>
```

Shadow DOM (RFC §4 exception for slot distribution); full Constraint Validation
API surface — `setValidity`, `validity`, `validationMessage`, `willValidate`,
`checkValidity`, `reportValidity`, `setCustomValidity`. Inner native inputs
carry real browser validity; the host mirrors to ElementInternals so
`<form>.checkValidity()` walks every custom element correctly.

Skin via real `::part()` pseudo-element (Shadow DOM, unlike the v0.5 primitives'
attribute-selector workaround). Tokens still cascade — CSS custom properties
pierce shadow boundaries.

Icons via attribute lookup: `<core-input leading-icon="search">` resolves
through the v0.5 icon registry. Hint and error content via `<slot name="hint">`
and `<slot name="error">`.

## Surfaces (v0.8)

Four overlay Web Components — dialog, drawer, popover, tooltip:

```html
<!-- Modal dialog with header/footer slots -->
<core-button id="delete-trigger">Delete item</core-button>
<core-dialog modal size="md" closedby="closerequest">
  <h2 slot="header">Confirm deletion</h2>
  <p>This action cannot be undone.</p>
  <div slot="footer">
    <core-button data-core-close>Cancel</core-button>
    <core-button onclick="this.closest('core-dialog').close('confirm')">Delete</core-button>
  </div>
</core-dialog>

<!-- Edge drawer, end side -->
<core-drawer modal side="end" closedby="any">
  <h2 slot="header">Cart (3 items)</h2>
  <!-- body content -->
  <div slot="footer"><core-button>Checkout</core-button></div>
</core-drawer>

<!-- Anchored popover (menu) -->
<core-button id="more-btn">More</core-button>
<core-popover anchor="#more-btn" placement="bottom-start" offset="8">
  <ul>
    <li><button>Edit</button></li>
    <li><button>Delete</button></li>
  </ul>
</core-popover>

<!-- Hover/focus tooltip with auto aria-describedby -->
<core-button id="save-btn" aria-label="Save">💾</core-button>
<core-tooltip anchor="#save-btn" placement="top" delay-in="700">
  Save (⌘S)
</core-tooltip>
```

Shadow DOM. Platform-API-first (`<dialog>`, Popover API, CSS Anchor Positioning with
JS fallback for Safari/Firefox). Zero deps beyond Lit.

State machine (`data-state="closed|opening|open|closing"`) on all four components —
CSS targets `:host([data-state="opening"])` for transition choreography.
`prefers-reduced-motion` guard resets transitions to none.

`closedby="any|closerequest|none"` polyfill on all surfaces. `[data-core-close]`
close-button convention — any descendant with that attribute closes the surface on
click. Focus restored to pre-open `activeElement` on close.

Two abstract base classes for extension: `CoreOverlayElement` (dialog+drawer),
`CoreAnchoredElement` (popover+tooltip).

## Data table (v0.3)

`<core-data-table>` + `<core-column>` — the data-presentation tier. Shadow DOM host, declarative light-DOM columns, zero deps beyond Lit.

### Bare table (no sort, no pagination)

```html
<core-data-table>
  <core-column key="name"  label="Name"></core-column>
  <core-column key="email" label="Email"></core-column>
</core-data-table>

<script>
  document.querySelector('core-data-table').rows = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob',   email: 'bob@example.com' },
  ];
</script>
```

### Sortable columns

```html
<core-data-table>
  <core-column key="name"   label="Name"   sortable></core-column>
  <core-column key="score"  label="Score"  sortable type="number" align="end"></core-column>
  <core-column key="joined" label="Joined" sortable type="date"></core-column>
</core-data-table>
```

Click any sortable header: tri-state cycle asc → desc → unsorted. Cancel the built-in sort by calling `event.preventDefault()` on `core-sort-change` and assigning `el.rows` from server data.

### Paginated

```html
<core-data-table page-size="10">
  <core-column key="name" label="Name" sortable></core-column>
</core-data-table>
```

Default pagination footer: range display + prev/next + windowed page buttons. Replace entirely with `<slot name="pagination">` for custom widgets.

### Multi-select + density

```html
<core-data-table
  selection="multi"
  page-size="25"
  density="compact"
  key-field="id"
>
  <core-column key="name"   label="Name"   sortable></core-column>
  <core-column key="active" label="Active" type="boolean"></core-column>

  <div slot="empty">No results match your filter.</div>
</core-data-table>

<script>
  const el = document.querySelector('core-data-table');
  el.addEventListener('core-selection-change', (e) => {
    console.log('selected:', e.detail.selected);
  });
</script>
```

Density: `comfortable | cozy (default) | compact`. Select-all header checkbox with tri-state (none/some/all). `clearSelection()`, `selectAll()`, `selectNone()` methods. Direct `el.selected = new Set([...])` assignment.

### Custom render per column

```html
<core-data-table key-field="id">
  <core-column key="name"    label="Name"></core-column>
  <core-column key="actions" label=""></core-column>
</core-data-table>

<script>
  import { html } from 'lit';
  document.querySelector('core-column[key="actions"]').cellRender = (row) =>
    html`<button @click=${() => editUser(row.id)}>Edit</button>`;
</script>
```

`column.cellRender` receives `(row, { rowIndex, columnIndex, isSelected })`. Return a Lit `TemplateResult`, a string, or `undefined` (falls back to type-aware default). Custom sort comparator: `column.sortFn = (a, b, dir) => ...`.

> **Note:** The property is `cellRender` (not `render`) to avoid colliding with LitElement's render method. Spec uses `render` for ergonomics but the implementation uses `cellRender`.

Sticky header is on by default. Loading state: `<core-data-table loading>`. ARIA: `role="table"`, `aria-rowcount`, `aria-rowindex`, `aria-sort`, `aria-selected`. Keyboard nav: ArrowUp/Down/Home/End on rows, Space toggles selection, Enter fires `core-row-click`, Enter/Space on sortable headers triggers sort.

## Design canon

[RFC.md](RFC.md) — full spec including the pipe registry, component contracts, polyglot story. Read this for the why.

[docs/superpowers/specs/](docs/superpowers/specs/) — incremental specs (v0.2 utils, future tracks).

## Roadmap

See [RFC.md §16](RFC.md#16-roadmap). Currently at **v0.7 — forms layer** (six form-input Web Components with native `<form>` participation, on top of the v0.5 primitives + v0.2 utils foundations). Next ships the seed `<core-data-table>` per [RFC.md §16](RFC.md#16-roadmap).

## Licence

[EUPL-1.2](LICENCE).

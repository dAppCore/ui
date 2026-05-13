<!-- SPDX-Licence-Identifier: EUPL-1.2 -->

# @dappcore/ui

Web Component library for the dappco.re stack. **Unstyled but opinionated.**

```html
<core-data-table src="/v1/users" live>
  <core-column field="name"       label="Name"   sortable></core-column>
  <core-column field="size"       label="Size"   pipe="bytes"></core-column>
  <core-column field="created_at" label="Joined" pipe="date:relative"></core-column>
  <core-column field="balance"    label="Credit" pipe="currency:GBP"></core-column>
</core-data-table>
```

- Browser-native Web Components — no framework dependency
- Light DOM + `::part()` + CSS custom properties — tokens.css inherits cleanly
- Server-side renderable by [`dappco.re/go/html`](https://forge.lthn.sh/core/go-html) — shared pipe registry, byte-identical output
- Companion to CorePHP's `<core:*>` tags — same primitive names across the polyglot stack

## Design canon

[RFC.md](RFC.md) — the spec. Read this first.

## Install

```bash
# As an npm package
npm install @dappcore/ui

# Or as a git submodule (dappco.re-native pattern)
git submodule add https://github.com/dAppCore/ui.git external/ui
```

## Roadmap

See [RFC.md §16](RFC.md#16-roadmap). Currently at **v0.1 — foundation** (formatter registry + 12 built-ins). v0.3 ships the seed `<core-data-table>` component.

## Licence

[EUPL-1.2](LICENCE).

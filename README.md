<p align="right"><a href="README.fr.md">Lire en français</a></p>

# Shopify Shop the Look — metaobject-driven shoppable image

A full-width lifestyle photo with clickable "+" hotspots. Clicking one opens
a small product card (photo, title, price, native quick-add) right on the
image — no page reload, no separate popup. Hotspots come from a **Look**
metaobject, so a merchant builds one reusable Look (a photo + its hotspots)
once and reuses it across any number of sections or pages, with zero code
changes.

Built for the **Shopify Horizon** theme. Deliberately reuses Horizon's own
native "Product Hotspots" mechanism — interaction, accessibility, and
mobile fallback — rather than reimplementing it, and extends it with a
metaobject layer for reusability.

![Shop the Look — hotspots on a lifestyle photo, one popover open showing a product card](reference/Capture%20d%E2%80%99%C3%A9cran%2C%20le%202026-08-21%20%C3%A0%2001.49.33.png)

## Features

- **Reusable "Look" metaobject**: one photo + its hotspots, defined once,
  referenced from any number of sections via a simple picker in the theme
  editor — no code changes to add a new shoppable image
- Desktop hover opens a small product card in place; a short grace period
  keeps it open while the pointer moves between the "+" and the card
- Multi-variant products get the native "Choose" flow (opens the full
  variant-selection modal); single-variant products add straight to cart
- **Mobile gets no popover at all** — tapping a hotspot opens the theme's
  native quick-add modal directly instead, exactly like every other
  quick-add trigger on the site
- Circle diameter, "+" icon thickness (independent desktop/mobile values),
  clickable tap-target size (with a built-in accessibility floor), trigger
  and popover colors are all editable from the theme editor
- Shares 100% of its interaction code with Horizon's native "Product
  Hotspots" section through common snippets — zero duplicated logic, and
  any future fix to one applies to both

## Repository contents

This repo contains **only the custom code for this feature** — not the
full Horizon theme, which belongs to Shopify. Several files here replace
existing native Horizon files rather than sitting alongside them (see
`docs/integration-guide.md` for exactly which ones and why).

| Path | What it is |
|---|---|
| `sections/section-shop-the-look.liquid` | The new metaobject-driven section |
| `sections/product-hotspots.liquid` | Horizon's native section — CSS extracted to a shared snippet, new size/color settings |
| `blocks/_hotspot-product.liquid` | Horizon's native block — now a thin wrapper around the shared snippet below |
| `snippets/hotspot-styles.liquid` | Shared CSS for both sections' hotspots and popover cards |
| `snippets/hotspot-product-content.liquid` | Shared markup for one hotspot ("+" trigger + product popover) |
| `assets/product-hotspot.js` | Horizon's native `<product-hotspot-component>` — reworked hover open/close logic |
| `locales/*.json`, `locales/*.schema.json` | English + French translations (storefront text and editor labels) — additive only |
| `docs/integration-guide.md` | Metaobject setup, installation, and how everything fits together |
| `docs/gotchas.md` | Technical pitfalls found while building this — metaobject admin quirks, a Liquid syntax trap, and a couple of native Horizon bugs |
| `reference/` | Screenshots |

## Quick start

1. Create the **Look** and **Look Hotspot** metaobject definitions (exact
   fields in `docs/integration-guide.md`).
2. Copy `sections/`, `blocks/`, `snippets/` and `assets/` into your theme
   (some replace native Horizon files — see the guide), and merge the
   locale keys from `locales/` into your own.
3. Create a Look entry in the admin (photo + hotspots), then add the
   **Shop the Look** section to a template and pick it from the theme
   editor.

See `docs/integration-guide.md` for the full walkthrough.

## Why this one was harder than it looks

This was the first feature in this project built around Shopify
metaobjects, and the first that deliberately extends an existing native
theme mechanism instead of building standalone. Most of the real time went
into metaobject admin quirks (a field's List/single-reference choice can't
be changed after creation), a Liquid syntax trap specific to multi-line
tags inside `{% liquid %}` blocks, and two unrelated native Horizon bugs
surfaced along the way (a badge overflowing the mobile quick-add modal, and
a hover-timer race condition). Full list, with the reasoning and the fix
for each, in `docs/gotchas.md`.

## License

MIT — see `LICENSE`.

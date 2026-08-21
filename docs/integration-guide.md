# Integration guide

## 1. Create the two metaobject definitions

This feature is built entirely on two linked Shopify **metaobjects**, so a
"Look" can be created once and reused across any number of sections/pages —
no theme code needs to be touched to add a new shoppable image.

In the Shopify admin, go to **Settings → Custom data**, then scroll down to
the **Metaobjects** section (it's separate from the metafield list further
up the same page) and create:

### "Look Hotspot"

| Field | Key | Type |
|---|---|---|
| Position X | `position_x` | Number → Integer |
| Position Y | `position_y` | Number → Integer |
| Product | `product` | Product reference |

### "Look"

| Field | Key | Type |
|---|---|---|
| Name | `name` | Single line text |
| Image | `image` | File → Image |
| Hotspots | `hotspots` | Metaobject reference → **List** → Look Hotspot |

**The "Hotspots" field must be created as a List from the start** — the
List/single-reference choice can't be changed after the field exists (see
`docs/gotchas.md` #1). If you get this wrong, delete the field and recreate
it rather than trying to edit it.

## 2. Install the theme files

Copy into your theme, replacing the native files of the same name (all of
them start from Horizon's own "Product Hotspots" section and extend it —
see `docs/gotchas.md` for why they need to be replaced together, not
individually):

- `sections/section-shop-the-look.liquid` (new)
- `sections/product-hotspots.liquid` (replaces native — CSS extracted to a
  shared snippet, new size/color settings)
- `blocks/_hotspot-product.liquid` (replaces native — now a thin wrapper
  around the shared snippet below)
- `snippets/hotspot-styles.liquid` (new, shared by both sections)
- `snippets/hotspot-product-content.liquid` (new, shared by both sections)
- `assets/product-hotspot.js` (replaces native — reworked hover open/close,
  see `docs/gotchas.md` #7)

Merge the locale keys from `locales/*.json` and `locales/*.schema.json`
into your own theme's locale files — they're additive, nothing here
overwrites native Horizon keys.

### Optional: mobile quick-add badge fix

If any of your products use the theme's "Product sale badge" block on the
product page, you'll also want the small patch described in
`docs/gotchas.md` #5 — add it to your own `snippets/quick-add-modal-styles.liquid`.
It's independent of the rest of this feature (fixes a pre-existing native
bug, not something this feature introduces), so it isn't required for Shop
the Look itself to work.

## 3. Create a Look, then add the section

1. Go to **Content → Metaobjects → Look** and create a new entry: give it a
   name, upload the lifestyle photo, and add **Hotspot** entries under it
   (each one is a "Look Hotspot" — position X/Y as a percentage of the
   image, and the product it should link to).
2. In the theme editor, add the **Shop the Look** section to any template.
   In the section's settings, pick the **Look** you just created from the
   metaobject picker.

Repeat step 1 to build more Looks, and reuse any of them on any number of
sections/pages just by selecting them in the picker — no code changes.

## How it works

- On desktop, hovering a "+" opens a small popover with the product's
  photo, title, price and a native quick-add button (or a "Choose" button
  that opens the full variant-selection modal, for multi-variant products)
  — all native Horizon `quick-add` behavior, untouched.
- On mobile, tapping a "+" opens the native quick-add **modal** directly
  (the popover never renders below 750px) — same mechanism used by every
  other quick-add trigger in the theme.
- Both this section and Horizon's native "Product Hotspots" section render
  every hotspot through the same shared snippet
  (`hotspot-product-content.liquid`), so they're pixel-for-pixel identical
  and any future fix to one applies to both automatically.
- The only structural difference: this section reads its hotspots from a
  "Look" metaobject's `hotspots` list instead of from manually-added theme
  blocks — see `sections/section-shop-the-look.liquid`'s `{% for hotspot in
  look.hotspots.value %}` loop.

## Customizing the look

Circle diameter, "+" icon thickness (both with independent mobile values),
clickable tap-target size, trigger/icon colors, and popover background
color are all editable from the theme editor — see the **Appearance**,
**Colors**, and **Popover** setting groups on either section. Everything
visual beyond that lives in `snippets/hotspot-styles.liquid`, prefixed
`.hotspot` / `.hotspot-dialog` / `.hotspots-container` — no theme-wide
selectors are touched.

# Technical gotchas

Things that cost real debugging time while building this — recorded so you
don't have to rediscover them. This was the first feature in this project
built around Shopify **metaobjects**, and the first to deliberately reuse and
lightly extend an existing native theme mechanism (Horizon's own "Product
Hotspots") instead of building from scratch — most of these are specific to
that combination.

1. **A metaobject field's "List" vs "single reference" setting can only be
   chosen at field creation time — it cannot be changed afterward.** The
   "Look" metaobject's `hotspots` field (a list of references to "Look
   Hotspot" entries) was first created as a single reference by mistake.
   The list/single toggle appears greyed out / non-interactive once a field
   already exists. The only fix is deleting the field and recreating it,
   choosing "List" during the type-selection step this time.

2. **Metafields and metaobjects live in genuinely different places in the
   Shopify admin, and it's easy to end up in the wrong one.** Metafields
   extend an *existing* resource type (e.g. add a custom field to
   Product); metaobjects are standalone new content types with their own
   admin entries. Both are configured under "Custom data" /
   "Champs méta et métaobjets", but Metaobjects is a separate section
   further down the same page, easy to miss on first visit.

3. **Inside a `{% liquid %}...{% endliquid %}` block, every line is parsed
   as an independent statement — a tag's parameters cannot be spread
   across multiple lines the way they can in a normal `{% render %}` tag.**
   ```liquid
   {% liquid
     if condition
       render 'x',
         param: value,
         param2: value2
     endif
   %}
   ```
   fails to upload with `Liquid syntax error: Unknown tag 'param'` — the
   parser reads `param: value,` as the start of a new line/tag. Multi-line
   parameter lists must be written as a standalone `{% render %}` tag
   outside the `{% liquid %}` block, not inside one.

4. **This theme has two visually similar but functionally unrelated
   "badge" components — easy to fix the wrong one.** `.product-badges`
   (rendered from a product's real sale/sold-out status, used in grid
   product cards) and `.product-sale-badge` (a merchant-editable marketing
   label, always shown when enabled, independent of actual sale status,
   shown on the main product page). A bug that visually looks like "the
   sale badge is broken" can be either one — check which markup is
   actually present before touching CSS.

5. **The native quick-add modal reuses the full product-page media markup
   wholesale, at a much narrower width on mobile — anything positioned
   for the full-size context can overflow with no container to clip it.**
   The "product-sale-badge" mentioned above is fixed-position from the
   image's top-right corner, sized correctly for the full product page's
   wide hero image. The mobile quick-add modal squeezes that same media
   markup into roughly a quarter of the modal's width, and nothing there
   clips overflow — the badge spills outside the tiny thumbnail into
   surrounding content. Fixed by hiding it specifically inside
   `.quick-add-modal__content .product-information__media` below 750px,
   rather than touching the badge itself (which is correct everywhere
   else it's used).

6. **A CSS custom property set inline via `style="..."` on an element
   cannot be overridden by any external stylesheet rule targeting that
   same element — not even a more specific selector.** Once a value like
   `--hotspot-size: 36px` is set directly in an element's own `style`
   attribute, that declaration wins for that element regardless of what
   any `.class`, `#id`, or even `!important`-free stylesheet rule says
   elsewhere. To make a value overridable later (e.g. by a
   `@media (max-width: 749px)` mobile variant), it has to live in an
   external `{% style %}` block from the start, scoped by
   `#shopify-section-{{ section.id }}` — not in the element's inline
   `style` attribute.

7. **Hover-driven open/close needs guards against overlapping timers, and
   is simpler with one listener pair on the outer element than two on
   separate inner ones.** An early version tracked `pointerenter`/
   `pointerleave` separately on the trigger button and on the popover
   dialog, each with their own open/close timers — a jittery pointer
   could retrigger the open timer while one was already pending (worse
   during the ~100ms async dialog-placement measurement, which itself
   toggles the dialog's `display`), causing a rapid open/close flicker
   loop. Consolidating to a single `pointerenter`/`pointerleave` pair on
   the *host* custom element (which contains both the trigger and the
   dialog) collapses this to one continuous hover region and one
   grace-period close timer — no more two timers to keep in sync, and no
   more "did the pointer really leave, or is it just in the gap between
   two elements" ambiguity.

8. **The native quick-add "Add" vs "Choose" button toggle is driven by a
   `[data-quick-add-button='choose'] add-to-cart-component { display: none; }`
   rule in the theme's base stylesheet** — both buttons are always
   rendered in the DOM, and only one is shown via this attribute
   selector. Worth knowing this exists (rather than assuming it's a
   Liquid conditional) if a multi-variant product ever shows the wrong
   button somewhere quick-add is reused in an unusual context.

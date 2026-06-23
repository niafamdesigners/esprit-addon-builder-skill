# HTML Analysis

## First Pass

Read the raw HTML directly and analyze it using:

- semantics of tags (`h1`, `h2`, `p`, `a`, `img`, `time`, `small`)
- class/id names
- `data-field`
- text roles and labels
- href/src attributes
- repeated DOM shapes

There is no helper script. Perform the structural analysis manually as described below; all of it is reasoning the model does while reading the HTML.

## Manual Structural Analysis

Apply this procedure by hand instead of running any analyzer. It is the same algorithm the removed `structure-analyzer.js` / `analyze_html.py` used, expressed as review steps.

1. **Skip noise.** Ignore `script`, `style`, `noscript`, `svg`, and `path` content. Treat `img`, `br`, `hr`, `meta`, `link`, `input` as void (no children).
2. **Build a structural signature** for each meaningful element from its tag plus up to its first two cleaned class names plus the shape of its children, e.g. `div.card[img[]|h3[]|p[]]`. Cap nesting at ~4 levels and ~8 children per node; deeper/empty nodes collapse to `tag[]`.
3. **Group identical signatures.** Any signature shared by **two or more** elements is a repeating-pattern candidate.
4. **Extract fields per item** in this order, de-duplicating by field name (first occurrence wins):
   - `img[src]` → `image` field; capture `width`/`height` when both are present.
   - `a[href]` → `link` field; add `link_text` only when the anchor's display text is separate from another title.
   - text tags (`h1`–`h5`, `p`, `span`, `strong`, `em`, `time`, `small`) with non-empty text → a field named from `data-field`, else class/id, else the tag default (see Field Guessing).
5. **Rank candidates** by repeat count, then by number of extracted fields.
6. **Separate static from repeated.** Fields outside the repeated block belong in a parent/settings table; only fields inside the repeated item belong in the list table.
7. **Category hint** from the combined text (case-insensitive, Persian + English keywords):
   - Commerce: `product|shop|price|cart|buy|محصول|قیمت|خرید`
   - Events: `event|conference|workshop|رویداد|همایش`
   - Media: `gallery|video|photo|گالری|ویدیو|تصویر`
   - otherwise Content.
8. **Survey top-level tags** to understand the section's overall layout before deciding tables.

## Repeating Patterns

A DOM signature looks like:

```text
div.card[img[]|h3[]|p[]]
```

The decision pattern:

- If two or more elements have the same meaningful structural signature, evaluate them as repeating items.
- If the repeated structure contains meaningful fields, model it as a list table or as data read from an existing source such as `contents`.
- Static fields outside the repeated item belong in a parent/settings table.
- Do not duplicate the same semantic field under different names.

## Language Switcher Blocks

Any block using a `lang`-related class (`.lang`, `.langs`, `.lang__item`, or similar) to render language links (En/Ar/...) is always a repeating pattern, even if it currently has only 2 items. Always model it as a separate list table + query (e.g. `id`, `title`, `link`, `target`, `ordlist`, `active`) instead of flat fixed fields (`lang_en_link`, `lang_ar_link`, ...) in a settings table. Item count must not override this rule for language lists — the set of languages must stay CMS-editable.

## Parent/Child

Create parent/child tables only when the HTML clearly has:

- one parent section with repeated child items
- nested repeated blocks inside each parent item
- meaningful child records that need independent ordering or editing

Avoid parent/child when a single repeating list table is enough.

## Field Guessing

Default tag mapping:

- `h1`, `h2`, `h3`: `title`
- `h4`, `h5`: `subtitle`
- `p`: `description`
- `a[href]`: `link`
- anchor text: `link_text` only when display text is separate from another title
- `img[src]`: `image`
- `time`: `date`
- `small`: `caption`

Prefer semantic class/id names over generic tag names when they are meaningful.

## Limits of the Old Analyzer

The old analyzer depended on browser `DOMParser`, and a later Python port (`analyze_html.py`) was a heuristic stopgap. Neither is kept as a runtime dependency — the model now performs the Manual Structural Analysis above directly. The original browser source is preserved at `references/original-js/structure-analyzer.js` for audit only.

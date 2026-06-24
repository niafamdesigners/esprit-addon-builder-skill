# Esprit Portal Notes

This reference preserves the useful parts extracted from the old `Esprit_Portal/` documentation.

## Static Codes

The real database storage for static blocks uses the `statics` table. Important columns:

- `unicid`
- `staticname`
- `global`
- `staticcontent`
- `siteid`
- `createtime`
- `lastupdate`
- `creatorid`
- `updaterid`
- `deleted`
- `useinsite`

Use the inserted record ID in templates:

```text
[esprit:static:ID]
```

Do not invent columns such as `alias`, `type`, `code`, `name`, or `description` for the real `statics` table unless a newer schema explicitly proves they exist.

## Template Layout

Common convention in the legacy docs:

- `[esprit:static:1]` for head
- `[esprit:static:2]` for header
- `[esprit:static:3]` for footer
- `[esprit:static:7]` for scripts

Treat these as local conventions from the source project, not universal IDs.

## Menu Shortcodes

- `[esprit:menu:X]`: menu by ID, useful locally.
- `[esprit:menu:AliasName]`: menu by alias.
- For general templates, use the alias form rather than the numeric ID form.

## Query Shortcodes

- `[esprit:query:ID]`: render another addon query by its DB id.
- `[esprit:query:ID:value]` (and `:value2:…`): render it and pass parameters,
  read on the other side with `[parameters:i:default]` / `[intparameters:i:default]`.
  Full mechanics are in `addon-rules.md`, "Passing Parameters Between Queries".

## Page Shortcodes

- `[esprit:breadcrumb]`: renders page breadcrumb/navigation.
- `[esprit:page-content]`: renders the dynamic page body.
- `breadcrumb` can have preview/sample output.
- `page-content` usually cannot preview the real content; show an explanatory placeholder if needed.

## General Shortcodes

Useful portal shortcodes from the remaining docs:

- `[esprit:site-last-update]`
- `[esprit:loginstatus]`
- `[esprit:translate:KEYWORD]`
- `[esprit:online-visitors]`
- `[esprit:current-page-visits]`
- `[esprit:today-visits]`
- `[esprit:total-visits]`
- `[esprit:date:X]`

Use these as fixed Portal syntax, not addon query placeholders.

## Translations

`[esprit:translate:KEYWORD]` renders a translatable phrase, where `KEYWORD` is an
English slug (e.g. `address`, `phone`, `fax`, `email`, `postal-code`, `today`).
It is resolved at render time in static/template HTML (including a query's
`starthtml`/`repeathtml`/`endhtml`/`withoutresult`) — never inside the SQL
`SELECT`.

Use it for very public, universal micro-labels that should follow the site
language rather than be edited per install:

- the contact-item labels in a footer — آدرس → `[esprit:translate:address]`,
  تلفن → `[esprit:translate:phone]`, نمابر → `[esprit:translate:fax]`,
  پست الکترونیک → `[esprit:translate:email]`, کد پستی → `[esprit:translate:postal-code]`.
- stray universal words elsewhere (e.g. a header «امروز» → `[esprit:translate:today]`).

Do **not** use translations for section/box headings that an editor would
rename ("اطلاعات تماس با ما", "آمار بازدیدکنندگان", "خدمات و سامانه‌ها", a news
box title) — those stay editable fields in a settings table. When it is unclear
whether a phrase is a universal label or an editable heading, ask the user.

After generating output that uses `[esprit:translate:…]`, report the list of
keywords to the user so they can add them under Settings → Language Management;
otherwise they render blank.

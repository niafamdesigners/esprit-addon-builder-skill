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

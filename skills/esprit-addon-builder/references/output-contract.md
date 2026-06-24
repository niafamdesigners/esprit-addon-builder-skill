# Output Contract

## Addon JSON Shape

Use this shape for final addon generation:

```json
{
  "addonname": "string",
  "description": "string",
  "tables": [
    {
      "userfriendlyname": "فارسی",
      "tablename": "lowercase_underscore",
      "users_confirm": 0,
      "insert_acc": "",
      "edit_acc": "",
      "delete_acc": "",
      "usersgroup_confirm": 0,
      "insert_acc_groups": "",
      "edit_acc_groups": "",
      "delete_acc_groups": "",
      "add_attributes": 0,
      "add_shop_fields": 0,
      "deleted": 0,
      "fields": [
        {
          "friendlyname": "فارسی",
          "friendlyname_en": "English",
          "fieldname": "lowercase_underscore",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        }
      ]
    }
  ],
  "queries": [
    {
      "queryname": "lowercase_underscore",
      "query": "SELECT ...",
      "starthtml": "",
      "repeathtml": "",
      "endhtml": "",
      "withoutresult": "",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

## Validation Checklist

- JSON parses without repair.
- No markdown, comments, or code fences.
- Every table has `tablename`, `userfriendlyname`, and `fields`.
- Every field has valid `fieldtype`.
- Link fields are `textinput` with `length = 1024`.
- Link fields have a `target` field unless target is fixed by design.
- Image fields are `file` and include dimensions when source HTML provides them.
- `friendlyname` and `userfriendlyname` are Persian.
- Query aliases match all placeholders in `repeathtml`.
- Every query has a `withoutresult` holding the original, complete static HTML
  for that block (the same DOM that `starthtml` + items + `endhtml` produce). It
  renders when the query returns no rows, so the section degrades to the original
  design instead of disappearing. It is plain static HTML — no
  `[query-result:...]` placeholders. In a real project use the **verbatim**
  source HTML, including every original item; abbreviating it (e.g. to two sample
  items) is only acceptable inside documentation examples.
- Placeholder syntax is Esprit syntax only.
- Queries use site/deleted filters where appropriate.
- `ordlist` is present only where list ordering is user-controlled.

## SQL Export Rules

Generate SQL only when requested. Export SQL should:

- use `SET XACT_ABORT ON`
- wrap metadata inserts in `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`
- set `@creatorid = 1`
- insert `addons_queries.connectionid = 0`
- use `length = 0` for textarea max metadata
- be reviewed before execution

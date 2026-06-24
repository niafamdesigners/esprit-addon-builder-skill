# Addon Rules

## Naming

- `addonname`: readable product/module name.
- `description`: short and useful.
- `tablename`: English `lowercase_underscore`, no physical prefix such as `zes_`.
- `fieldname`: English `lowercase_underscore`.
- `queryname`: English `lowercase_underscore`.
- `friendlyname`: Persian field label.
- `friendlyname_en`: short English field label.
- `userfriendlyname`: Persian table label.
- Avoid vague names such as `data`, `item`, `value`, and `info` unless no better semantic signal exists.

## Field Types

- `textinput`: title, name, short metadata, links, email, phone, contact values.
- `textarea`: description, summary, body, content, long text.
- `file`: images, logos, avatars, thumbnails, uploaded files.
- `number`: prices, quantities, counters, ratings, numeric year.
- `date`: dates and times.
- `selectbox`: single choice, target, `ordlist`.
- `checkbox`: multi-select or boolean values.

Use only the field types listed above. Values like `url`, `text`, `email`, `phone`, or `image` are not valid Esprit `fieldtype`s — the form builder won't recognize them, so map to the closest real type instead (links/email/phone → `textinput`, images → `file`, long text → `textarea`).

## Metadata

- `direction = 0`: Persian/Arabic/RTL text.
- `direction = 1`: English, URLs, emails, phone numbers, codes, numbers.
- `textarea` long storage: JSON can use `length = "max"` during generation; SQL metadata must store `length = 0`.
- `showonlist = 1` only for the main identifying field and for `ordlist` in list tables.
- `search = 1` for important title/name-like fields.
- Put image fields after text, link, select, and configuration fields in the same table.

## Links

Editable link/href fields:

- `fieldtype = textinput`
- `length = 1024`
- `direction = 1`
- companion `target` field:
  - `friendlyname = "نحوه باز شدن لینک"` (always this exact Persian label, in every table)
  - `fieldtype = selectbox`
  - `defaultvalue = _self`
  - `staticitems = [{"text":" تب جاری","value":"_self"},{"text":" تب جدید","value":"_blank"}]`

## Sliders And Repeating Item Lists

Any slider/list table whose items must be toggled visible/hidden by an editor needs an `active` status field:

- `friendlyname = "وضعیت نمایش"`, `fieldname = active`
- `fieldtype = checkbox`
- `defaultvalue = "1"` (active by default)
- Stored and compared as a string, not a number: `'1'` / `'0'`.
- Query must filter on it, e.g. `WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id]`.

A sortable list also needs an `ordlist` field. Like `target`, it is a
`selectbox` with explicit `staticitems` — but the options are numbers, where
`text` and `value` are both the same number:

- `friendlyname = "ترتیب"`, `fieldname = ordlist`, `fieldtype = selectbox`
- `staticitems = [{"text":"1","value":"1"},{"text":"2","value":"2"}, … ,{"text":"10","value":"10"}]`
- The range must cover the expected number of items. When that count isn't clear
  from the source, ask the user for the exact number rather than guessing
  (`SKILL.md`, "When To Ask Instead Of Guessing"); `1..10` is only a fallback.
- Order with `ORDER BY CAST(ordlist AS INT) ASC`.

Do not create separate `phone_link`, `tel_link`, `email_link`, or `mailto_link` fields for normal phone/email values. Use `tel:[query-result:phone]` or `mailto:[query-result:email]` in HTML unless the source explicitly separates display and href values.

## Images

- Use `fieldtype = file`.
- Use `[query-result-fileurl:image_field]` for freely uploaded images — but only
  inside `repeathtml`. The `fileurl` resolver does **not** work in `starthtml`
  (or `endhtml`). When an image must render in `starthtml`, resolve the file path
  in the query instead and bind a plain `[query-result:...]`, e.g. select
  `(SELECT filename FROM files WHERE files.id = c.picid) AS pic` and use
  `[query-result:pic]`. The same applies to any image whose alias is produced
  once for a header/once-rendered block.
- If repeated icons/images share a constant base path, keep the base path in HTML and store only the variable filename, e.g. `/uploads/epc/dist/assets/svg/[query-result:icon]`.
- Capture `filewidth` and `fileheight` from source `img` attributes when present.
- Persian `friendlyname` for known-size images should include dimensions, e.g. `تصویر [256*256]`.
- Do not create `alt` or `alt_text` fields when the table has `title` or `name`; bind `alt="[query-result:title]"`.
- In seed/initial rows, leave image/file fields `NULL`.

## Query Rules

- Prefer `SELECT` queries.
- Use `deleted = 0` and `siteid = [system:site-id]` where appropriate.
- Every addon table automatically has `id`, `siteid`, and `deleted` columns — select and filter on them directly; never define them as fields. Passing a row's `id` to a child query and resolving the rest from it is often cleaner than passing many values.
- If `ordlist` exists, prefer `ORDER BY CAST(ordlist AS INT) ASC`.
- For target fields, select `ISNULL(target,'_self') AS target` and bind `target="[query-result:target]"`.
- In custom list-table queries, wrap every selected column in `ISNULL(...)` with a safe default so a missing value never renders as `NULL`: text → `''`, link → `'/'`, target → `'_self'`. For example `ISNULL(title,'') AS title, ISNULL(icon,'') AS icon, ISNULL(link,'/') AS link, ISNULL(target,'_self') AS target`.
- Start link hrefs with a leading `/` so they are absolute from the site root, e.g. `href="/[query-result:link]"`.
- `addons_queries.connectionid` must be `0` in export SQL.
- `SELECT TOP 1` settings queries should guard the rendered field, e.g. `AND ISNULL(slogan_text,N'') != N''`.
- Keep aliases simple and exactly aligned with placeholders.

## Passing Parameters Between Queries

A query is addressable in templates by its DB id: `[esprit:query:23]` renders
query 23. One query can call another and pass it values — useful when a first
(parent) query produces ids/codes that a second query must filter on (master →
detail, or rendering one list per value).

Sending — from the calling query's `starthtml`, `repeathtml`, or `endhtml` (and
even `withoutresult`, though rarely), append `:value` segments after the query
id:

- one parameter: `[esprit:query:23:[query-result:id]]`
- several: `[esprit:query:23:[query-result:id]:[query-result:code]]`

Receiving — inside the called query's SQL, read each parameter by index with a
default:

- string: `[parameters:INDEX:DEFAULT]` — e.g. `[parameters:0:]` (index 0, empty
  default). Quote it in SQL like a string: `code = '[parameters:1:0]'`.
- integer: `[intparameters:INDEX:DEFAULT]` — e.g. `[intparameters:0:0]`, for a
  column you trust is numeric on both ends.

The two numbers are INDEX then DEFAULT. INDEX is 0-based (parameters arrive in
the order sent, so the first is `0`, the second `1`, …). DEFAULT is the fallback
used when nothing is passed (`0`, or left empty). Example called query:

```sql
SELECT TOP 5 ISNULL(title, '0') AS title
FROM zes_three_add_link
WHERE siteid = [system:site-id] AND deleted = 0
  AND id = '[parameters:0:0]' AND code = '[parameters:1:0]'
ORDER BY ordlist ASC
```

Use `intparameters` only when both the sent value and the receiving column are
integers; otherwise use `parameters` and quote it.

Prefer passing a single row `id` (always available, see "Query Rules") and
resolving the rest in the child query from that id, rather than passing many
values — the `id` is numeric, so receive it with `[intparameters:0:0]`.

The caller needs the called query's DB id, which is only assigned once the query
is created. So `[esprit:query:NN:…]` carries a placeholder id (`NN`) in generated
output that must be wired to the real id after import — call this out, or ask the
user for the id if it already exists.

## Tabbed Widgets

A tabbed widget (dynamic tab headers + one content pane per tab) is a dynamic
list combined with the compose + parameter patterns. Build it like this:

- The tabs are editor-managed, so they go in a custom list table (e.g.
  `news_tabs`) carrying the tab `title`, `icon`, and the per-tab settings the
  pane needs (`on_category`, `on_page`, `active`, `ordlist`).
- Headers and panes are two synchronized loops over that one table → write **two
  queries** over it (a headers query → the `<ul>`, a panes query → the pane
  divs), and give both the same `ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) AS row`
  so the header `href="#tab[row]"` matches the pane `id="tab[row]"`.
- Set the initial active/show state from the row number, since only the first
  tab/pane starts open:
  `CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'active' ELSE '' END AS active_class`
  (and `'show'` for the first pane), bound into the element's `class`. JS still
  toggles on click; this only seeds the initial state.
- Each pane fills its content by embedding a child query and passing the tab's
  `id` (the default column on every table — no field needed):
  `[esprit:query:NN:[query-result:id]]`. The child query receives it with
  `[intparameters:0:0]` (numeric) and resolves the tab's settings from it at the
  top — `SET @contentCategory = (SELECT on_category FROM <tabs> WHERE id = [intparameters:0:0] …)`,
  same for the archive page — then filters `contents` by the group. Passing one
  `id` keeps the call short and robust (see "Passing Parameters Between Queries").
- The section skeleton just embeds the headers query, then the panes query.
- When the widget is multimedia (a gallery of video/photo/audio tabs), drop the
  per-tab `on_category` and store a `contenttype` selectbox on the tab instead
  (`1` news, `2` image, `3` video, `4` audio — see `news-contents.md`, "Content
  types"); the child query filters `c.contenttype = <resolved value>`. If a tab
  also needs a subject filter, keep `on_category` too and ask the user.
- A pane can hold more than one synchronized loop (e.g. a main slider plus a
  thumbnail strip over the same content). Each loop is its own child query; the
  pane embeds both, passing the same tab `id` to each.
- A visible section/box heading above the tabs is always editable — give it a
  one-row settings table field and render it from a `SELECT TOP 1` query; never
  hardcode it static.
- Tabs are one of the trickiest, most sensitive patterns, so **always ask the
  user before building** rather than guessing. Tabs are often heterogeneous —
  each tab may be a different kind of content, and the right model depends on the
  answer. Ask at least:
  - What is each tab's content type? Editorial news? Multimedia
    (`contenttype`)? Or something that is **not** news at all and needs its own
    custom table (then build that table for it)?
  - How is each pane filtered — by category, by `contenttype`, by both, or by a
    custom source?
  - How many items per pane, is the tab icon an uploaded file or a fixed theme
    svg filename, and should the section heading be editable?

  Asking per-tab lets you model each tab so the editor both enters the right
  data and gets a correctly-built addon for that tab.

### Heterogeneous tabs

When the tabs hold *different kinds* of content (e.g. one news, one tenders, one
gallery, one achievements), the homogeneous single-table/single-child pattern
does not apply. Instead:

- Treat the tab set as fixed. Each pane is its own independent block — its own
  source, query, and layout — built per the type the user confirmed (a `contents`
  news query, a `contenttype` gallery, a custom `achievements` table, …).
- Keep the editable tab labels + per-tab archive in one `*_tabs` settings table
  rendered by a headers query (active via the `ROW_NUMBER()` CASE). The pane
  wrappers (`data-content="…"`) live in the static skeleton, each embedding its
  own pane query; the panes are not one shared loop.
- A pane query reads its own filter settings from the matching tab row (by a
  fixed `tab_key`), e.g. `SET @contenttype = (SELECT contenttype FROM <tabs> WHERE tab_key = 'featured-media' …)`.
- A per-tab over-title/number (e.g. a tender number) can reuse an existing
  `contents` column such as `kicker` instead of a new table, when the user
  confirms it.

Make it extensible so an editor can add a tab of an existing type by just adding
a row — no query rewrite:

- Identify each tab by its row `id` in the DOM (`data-tab="tab_[id]"` ↔
  `id="tab_[id]"`), never a hardcoded string key, so ids stay unique as tabs are
  added.
- Store the tab type in a **selectbox** (`tab_key`/`tab_type` with fixed values
  like `news`/`tenders`/`media`/`achievements`) — better UX and no typos.
- Render panes with one **per-type panes-loop query** (each loops only its type's
  tabs, `WHERE tab_key = 'news'` …) that emits each pane wrapper and embeds the
  type's content child passing the tab `id`: `[esprit:query:NN:[query-result:id]]`.
  The content child resolves its own settings (category/contenttype/archive) from
  that id. Adding another tab of an existing type then needs no query/table
  change; only a brand-new type needs new development.
- Panes may be grouped by type in the DOM (only the active one shows), so seed
  the initial active pane with JS; the headers query still marks the first button
  active via the `ROW_NUMBER()` CASE.

## Header/Footer

- Split independent DOM blocks into independent queries: logo, flag, language link, slogan, copyright, year slogan, icon links.
- Shared settings tables are allowed, but each query `repeathtml` should render only its own DOM block.
- In header outside `nav.es-navbar`, keep fixed logo root link `/` and `_self` target as constants when always fixed.
- If English language action always opens in new tab, keep `_blank` constant instead of adding an editable field.

## Footer Link Lists (footer-only rule)

- If the footer has multiple distinct link lists (e.g. several columns of links), do not create a separate grouping/parent table. Put all links in one shared list table (e.g. `footer_link_items`) and distinguish lists with a static `selectbox` field (e.g. `group_id`) whose values are generic column identifiers: `col_1`, `col_2`, `col_3`, ... — not semantic names like `main`/`related`.
- Render each column by calling the shared list query once per column, passing the column id as a parameter (see "Passing Parameters Between Queries"): `[esprit:query:<id>:col_1]`, `[esprit:query:<id>:col_2]`, … and filter the query with `group_id = '[parameters:0:]'`.
- The heading/title of each footer column belongs in a shared footer settings table (e.g. `footer_settings`), not in a grouping table and not duplicated per link.
- Contact info (address, phone, fax, email, postcode) is its own concern — put the *values* in a separate `contact_info` table, not mixed into `footer_settings`. Their *labels* (آدرس، تلفن، …) are universal micro-labels: render them with `[esprit:translate:address]`, `[esprit:translate:phone]`, etc. — do not store label fields (see `esprit-portal.md`, "Translations"). Section/box headings (column titles, "آمار بازدیدکنندگان") stay as editable settings fields.
- Model the footer as separate per-block tables and queries: `contact_info` + its query, `footer_settings` (column titles) + its query, and `footer_link_items` + one shared parameterized query. The link-list query is embedded once per column with its `group_id` parameter.
- This rule is specific to the footer; it does not apply to similar multi-list patterns elsewhere in the page.

## Composing A Section From Multiple Queries

A complex section does not have to be one query. Write one query per independent
block (each rendering only its own DOM), then assemble them by embedding their
shortcodes in a static HTML skeleton: `[esprit:query:ID]` for a plain block and
`[esprit:query:ID:param]` for a parameterized one (see "Passing Parameters
Between Queries"). The skeleton — the wrapper markup plus fixed chrome and
`[esprit:...]` shortcodes — lives in the template/static block, not inside any
single query. This keeps each query small and reusable, and the same pattern
applies anywhere a section is built from several independent data blocks, not
just the footer.

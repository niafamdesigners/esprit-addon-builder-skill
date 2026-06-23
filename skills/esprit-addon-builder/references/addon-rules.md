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

Do not use `url`, `text`, `email`, `phone`, or `image` as `fieldtype`.

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

Do not create separate `phone_link`, `tel_link`, `email_link`, or `mailto_link` fields for normal phone/email values. Use `tel:[query-result:phone]` or `mailto:[query-result:email]` in HTML unless the source explicitly separates display and href values.

## Images

- Use `fieldtype = file`.
- Use `[query-result-fileurl:image_field]` for freely uploaded images.
- If repeated icons/images share a constant base path, keep the base path in HTML and store only the variable filename, e.g. `/uploads/epc/dist/assets/svg/[query-result:icon]`.
- Capture `filewidth` and `fileheight` from source `img` attributes when present.
- Persian `friendlyname` for known-size images should include dimensions, e.g. `تصویر [256*256]`.
- Do not create `alt` or `alt_text` fields when the table has `title` or `name`; bind `alt="[query-result:title]"`.
- In seed/initial rows, leave image/file fields `NULL`.

## Query Rules

- Prefer `SELECT` queries.
- Use `deleted = 0` and `siteid = [system:site-id]` where appropriate.
- If `ordlist` exists, prefer `ORDER BY CAST(ordlist AS INT) ASC`.
- For target fields, select `ISNULL(target,'_self') AS target` and bind `target="[query-result:target]"`.
- `addons_queries.connectionid` must be `0` in export SQL.
- `SELECT TOP 1` settings queries should guard the rendered field, e.g. `AND ISNULL(slogan_text,N'') != N''`.
- Keep aliases simple and exactly aligned with placeholders.

## Header/Footer

- Split independent DOM blocks into independent queries: logo, flag, language link, slogan, copyright, year slogan, icon links.
- Shared settings tables are allowed, but each query `repeathtml` should render only its own DOM block.
- In header outside `nav.es-navbar`, keep fixed logo root link `/` and `_self` target as constants when always fixed.
- If English language action always opens in new tab, keep `_blank` constant instead of adding an editable field.

## Footer Link Lists (footer-only rule)

- If the footer has multiple distinct link lists (e.g. several columns of links), do not create a separate grouping/parent table. Put all links in one shared list table (e.g. `footer_link_items`) and distinguish lists with a static `selectbox` field (e.g. `group_id`) whose values are generic column identifiers: `col_1`, `col_2`, `col_3`, ... — not semantic names like `main`/`related`.
- Render each column by calling the shared list query once per column with a fixed `group_id` param (`[query:footer_link_items|group_id=col_1]`, etc.).
- The heading/title of each footer column belongs in a shared footer settings table (e.g. `footer_settings`), not in a grouping table and not duplicated per link.
- This rule is specific to the footer; it does not apply to similar multi-list patterns elsewhere in the page.

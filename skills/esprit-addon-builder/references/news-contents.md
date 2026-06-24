# News And Contents Widgets

Use this reference when HTML resembles news, articles, announcements, blog lists, photo reports, video reports, editorial widgets, archives, or achievement/highlight boxes.

## Core Decision

Do not rush to create a custom table for repeated news cards. In this Esprit environment, repeated editorial items are often read from central tables:

- `contents`
- `contentgroups`
- `files`
- `contents_vote`
- `setting`
- `pages`

The addon usually stores widget settings only.

But "editorial-looking" is not the same as "editorial". Catalog-style blocks
(products, services, projects) often have their own managed records and fields
with no `contents` equivalent — those belong in a **custom table**, not
`contents` (see Example 6 in `examples.md`). When a repeating block could
plausibly be either, do not guess: weigh the cues in `SKILL.md` ("When To Ask
Instead Of Guessing") and, if it stays ambiguous, ask the user before modelling
it.

## Typical Settings Fields

- `title`: box/section title
- `on_category`: selected content group/category
- `on_page`: archive/detail page
- `arch_title`: archive link label
- `on_position`: content position filter

(There is intentionally no `item_count` here — see "Which settings a news
section actually needs"; news widgets use a fixed `SELECT TOP N`.)

Use DB-bound metadata for selector fields when known:

- `on_category`: usually `contentgroups`, `db_text = groupname`, `db_value = id`
- `on_page`: usually `pages`, `db_text = pagetitle`, `db_value = id`
- `on_category` can be `selectbox` for single select or `checkbox` for multi-select.

### Which settings a news section actually needs

Add a setting only when an editor would realistically change it; otherwise it
is noise on the form.

- `item_count`: do **not** add it for contents-based news widgets. The layout
  already fixes how many cards/rows fit, so hardcode that number in
  `SELECT TOP N` (a 4-card grid is `SELECT TOP 4`, a 5-row list is
  `SELECT TOP 5`). An editable count would just let someone break the design and
  buys nothing for a news feed.
- `on_page` (archive page): a news section almost always needs one. The content
  link is built relative to this archive page (see "Item links and archive
  page"), so without it the items can't link correctly. Make it required for
  news widgets.
- `title` + `arch_title` + `on_page`: when the section renders its own heading
  **and** an archive link (a "section-header" with a title and an آرشیو link),
  put all three in settings so the editor can rename the section, relabel the
  archive link (it might say آرشیو or something else), and pick where it points.
  Do not hardcode a visible section title or archive label that an editor can
  see — if it shows on the page and belongs to this section, it is editable.

## Common Content Columns

Important `contents` fields:

- `id`, `siteid`, `kicker`, `mainheadline`, `lead`, `deck`
- `contenttype`, `customdatetime`, `expiretime`, `maincontent`
- `groups`, `positions`, `picid`
- `published`, `deleted`, `presentinsite`
- `shamsi_year`, `shamsi_month`, `shamsi_day`, `shamsi_hour`, `shamsi_minute`

Important `contentgroups` fields:

- `id`, `parentid`, `siteid`, `groupname`, `deleted`

### Content types

`contents.contenttype` classifies the medium of a content item:

- `1` — default textual news (خبری)
- `2` — image/photo news (تصویری)
- `3` — video news (ویدئویی)
- `4` — audio/podcast news (صوتی)

A multimedia widget filters by `contenttype` instead of (or as well as) a
category — e.g. a "video" tab is `c.contenttype = 3`. The `content_type_icon`
mapping (see "Query Patterns") follows the same numbers.

## Common Filters

Use these filters for published live content when appropriate:

```sql
c.siteid = [system:site-id]
c.published = 1
c.deleted = 0
c.presentinsite = 0
ISNULL(c.expiretime, GETDATE()) >= GETDATE()
ISNULL(c.customdatetime, GETDATE()) <= GETDATE()
```

## Common Aliases

Expose only aliases needed by the HTML. Common aliases:

- `title`
- `lead`
- `summary`
- `link`
- `pic`
- `boxTitle`
- `archiveTitle`
- `archivePage`
- `groupTitle`
- `content_type_icon`
- `display_day`
- `display_month`
- `display_year`
- `newsDate`

## Query Patterns

Image fallback:

```sql
CASE
  WHEN ISNULL(c.picid,'') = ''
    THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id])
  ELSE (SELECT filename FROM files WHERE files.id = c.picid)
END AS pic
```

Common link:

```sql
dbo.rew(c.mainheadline) AS link
```

Archive label fallback:

```sql
ISNULL(NULLIF(arch_title,N''),N'آرشیو') AS archiveTitle
```

Content type icon mapping:

```sql
CASE c.contenttype
  WHEN 2 THEN 'gallery.svg'
  WHEN 3 THEN 'video-square.svg'
  ELSE 'article.svg'
END AS content_type_icon
```

### Date rendering (bilingual)

Esprit sites can be Persian or another language, so don't hardcode Shamsi. Emit
the date as three aliases driven by `[system:site-lang]`: Shamsi parts on a `FA`
site, Gregorian (`DATENAME`) otherwise. This keeps one query working on both a
Persian and a translated version of the same page.

```sql
-- روز
CASE WHEN '[system:site-lang]' = 'FA'
     THEN CAST(c.shamsi_day AS NVARCHAR(2))
     ELSE DATENAME(day, c.customdatetime) END AS display_day,
-- ماه
CASE WHEN '[system:site-lang]' = 'FA'
     THEN CASE c.shamsi_month
        WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد'
        WHEN '4' THEN N'تیر'     WHEN '5' THEN N'مرداد'    WHEN '6' THEN N'شهریور'
        WHEN '7' THEN N'مهر'     WHEN '8' THEN N'آبان'     WHEN '9' THEN N'آذر'
        WHEN '10' THEN N'دی'     WHEN '11' THEN N'بهمن'    WHEN '12' THEN N'اسفند'
        ELSE '' END
     ELSE DATENAME(month, c.customdatetime) END AS display_month,
-- سال
CASE WHEN '[system:site-lang]' = 'FA'
     THEN CAST(c.shamsi_year AS NVARCHAR(4))
     ELSE DATENAME(year, c.customdatetime) END AS display_year
```

Bind in HTML as `[query-result:display_day] [query-result:display_month] [query-result:display_year]`.
Prefer these over a single `newsDate` alias; keep `newsDate` only for a layout
that genuinely shows one pre-joined string.

### Item links and archive page

A content item's link is built **relative to the section's archive page**: the
archive page comes first, then the rewritten content link. Resolve the archive
page once from settings, expose it as `archivePage`, and join it in HTML:

```sql
SET @archivePage = (
  SELECT TOP 1 (
    SELECT dbo.rew(ISNULL(urlrewritetitle, pagetitle))
    FROM pages
    WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]
  )
  FROM <settings_table>
  WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != ''
  ORDER BY id DESC
);
```

Then `href="/[query-result:archivePage]/[query-result:link]"` — start the href
with a leading `/` so it is an absolute path from the site root. This is why
`on_page` is effectively required for news sections.

### Canonical news query template

Use this as the starting shape for a contents-based news widget. Resolve the
chosen category/position/archive page from the settings table into local
variables, then select a **fixed** `TOP N` — never an `item_count` field (see
"Which settings a news section actually needs").

```sql
DECLARE @contentCategory NVARCHAR(100), @archivePage NVARCHAR(256), @contentPosition NVARCHAR(100);
SET @contentCategory = (SELECT TOP 1 ISNULL(on_category,'') FROM <settings_table> WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_category,'') != '' ORDER BY id DESC);
SET @contentPosition = (SELECT TOP 1 ISNULL(on_position,'') FROM <settings_table> WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_position,'') != '' ORDER BY id DESC);
SET @archivePage = (SELECT TOP 1 (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]) FROM <settings_table> WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != '' ORDER BY id DESC);

SELECT TOP 5
  ROW_NUMBER() OVER (ORDER BY customdatetime DESC) AS row,
  '[system:subfolder-domain]' AS subfolder,
  c.kicker AS kicker,
  c.mainheadline AS title,
  c.lead AS lead,
  dbo.rew(c.mainheadline) AS link,
  @archivePage AS archivePage,
  cg.groupname AS groupTitle,
  CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic,
  -- + display_day / display_month / display_year from "Date rendering (bilingual)"
FROM contents c
OUTER APPLY (
  SELECT TOP 1 cg.groupname
  FROM contentgroups cg
  WHERE ',' + c.groups + ',' LIKE '%,' + CAST(cg.id AS VARCHAR(20)) + ',%'
  ORDER BY LEN(cg.id) DESC, cg.id DESC
) cg
WHERE c.siteid = [system:site-id]
  AND c.published = 1
  AND c.deleted = 0
  AND c.presentinsite = 0
  AND ISNULL(c.expiretime, GETDATE()) >= GETDATE()
  AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE()
  AND (',' + CAST(positions AS NVARCHAR) + ',' LIKE '%,' + @contentPosition + ',%'
       OR ',' + CAST(groups AS NVARCHAR) + ',' LIKE '%,' + @contentCategory + ',%')
ORDER BY c.customdatetime DESC;
```

Notes on adapting the template:

- The `OUTER APPLY ... cg` block exists only to expose `groupTitle` (the news
  group shown as a badge/label on each item). If the layout shows no group
  label, drop both the `OUTER APPLY` and the `cg.groupname AS groupTitle` line.
- Keep only the SELECT aliases the HTML actually binds; remove `kicker`, `lead`,
  `row`, `subfolder`, etc. when unused (`addon-rules.md`, "Query Rules").
- The `LIKE '%,id,%'` comma-wrapping is the safe way to match a single id inside
  the comma-separated `groups`/`positions` columns; don't use plain `=`.
- Drop the `@contentPosition` variable and its WHERE branch when the section has
  no position setting.

### Rendering an editable section header

When a news section has its own heading and archive link (a `section-header`
with an editable title + آرشیو link), you do **not** need a second query for it.
Carry the header values on the same items query: `SET` them into variables and
`SELECT` them as constant columns, then render the header once in `starthtml`
using `[query-result:...]` and the cards/rows in `repeathtml`.

```sql
DECLARE @boxTitle NVARCHAR(256), @archiveTitle NVARCHAR(256), @archivePage NVARCHAR(256);
SET @boxTitle = (SELECT TOP 1 title FROM <settings_table> WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC);
SET @archiveTitle = (SELECT TOP 1 arch_title FROM <settings_table> WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC);
-- @archivePage resolved as in "Item links and archive page"
SELECT TOP N
  CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'اطلاعیه ها' ELSE @boxTitle END AS boxTitle,
  CASE WHEN @archiveTitle = '' OR @archiveTitle IS NULL THEN N'آرشیو' ELSE @archiveTitle END AS archiveTitle,
  @archivePage AS archivePage,
  -- ... the per-row item columns ...
FROM contents c WHERE ...
```

When the section title (or archive label) is editable but the editor may leave
it empty, fall back to a sensible default with
`CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'<default>' ELSE @boxTitle END AS boxTitle`.
Use the section's natural name as the default (e.g. `N'اطلاعیه ها'`,
`N'اخبار ستادی'`) so the box never renders with a blank heading.

`starthtml` opens the section and renders the header
(`<h2>[query-result:boxTitle]</h2>` … `<a href="/[query-result:archivePage]">[query-result:archiveTitle]</a>`),
`repeathtml` renders one card/row, and `endhtml` closes the section. The section
archive link is `/[archivePage]` (no per-row link); each item link is
`/[archivePage]/[link]`. Reserve a separate query only for genuinely independent
DOM blocks (e.g. header vs footer regions), not for a heading that sits directly
above its own list.

If the header (or any `starthtml` block) shows an image, remember that
`[query-result-fileurl:...]` does not resolve in `starthtml`. Resolve the file
path in the query — `(SELECT filename FROM files WHERE files.id = ...) AS pic` —
and bind a plain `[query-result:pic]` (`addon-rules.md`, "Images").

## Layout Variants

- Image card: usually needs `title`, `pic`, `link`, date aliases, optional `groupTitle`.
- Compact text list: usually needs `title`, `link`, `newsDate`, optional `groupTitle`; do not force image aliases.
- Notification/announcement: keep within contents family unless stronger evidence suggests another domain.
- Gallery/video badge: expose `content_type_icon`.

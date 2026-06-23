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

## Typical Settings Fields

- `title`: box/section title
- `on_category`: selected content group/category
- `on_page`: archive/detail page
- `arch_title`: archive link label
- `item_count`: number of items
- `on_position`: content position filter

Use DB-bound metadata for selector fields when known:

- `on_category`: usually `contentgroups`, `db_text = groupname`, `db_value = id`
- `on_page`: usually `pages`, `db_text = pagetitle`, `db_value = id`
- `on_category` can be `selectbox` for single select or `checkbox` for multi-select.

## Common Content Columns

Important `contents` fields:

- `id`, `siteid`, `kicker`, `mainheadline`, `lead`, `deck`
- `contenttype`, `customdatetime`, `expiretime`, `maincontent`
- `groups`, `positions`, `picid`
- `published`, `deleted`, `presentinsite`
- `shamsi_year`, `shamsi_month`, `shamsi_day`, `shamsi_hour`, `shamsi_minute`

Important `contentgroups` fields:

- `id`, `parentid`, `siteid`, `groupname`, `deleted`

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

## Layout Variants

- Image card: usually needs `title`, `pic`, `link`, date aliases, optional `groupTitle`.
- Compact text list: usually needs `title`, `link`, `newsDate`, optional `groupTitle`; do not force image aliases.
- Notification/announcement: keep within contents family unless stronger evidence suggests another domain.
- Gallery/video badge: expose `content_type_icon`.

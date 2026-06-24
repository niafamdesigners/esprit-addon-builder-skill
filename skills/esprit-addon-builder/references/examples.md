# Worked Examples

End-to-end examples that show the rules in `addon-rules.md`, `html-analysis.md`,
and `news-contents.md` applied together on real input. Read one matching example
before generating, to anchor the output shape and the field/query decisions.

All examples are derived from a real Esprit page (the "isaar" portal home page).
Each follows the same form:

- **Input** — the relevant HTML block.
- **Analysis** — the structural read: repeating patterns, static vs. repeated
  fields, chosen tables, and *why* (citing the rule that drove each call).
- **Output** — the addon JSON. Shown fenced here for readability; real output is
  raw JSON with no fences. Every query carries a `withoutresult`: the original,
  complete static HTML for that block, shown when the query returns no rows so the
  section degrades to its original design instead of vanishing. The examples
  abbreviate it to two sample items for readability — in a real project paste the
  verbatim source HTML with all of its original items.

The examples are chosen because they exercise *different* core decisions:

1. A repeating editorial widget that should read from `contents`, not a custom
   table.
2. A repeating block that genuinely needs its own custom list table.
3. A contents-based list whose category is chosen from a DB-bound selector.
4. A news section whose editable heading + archive link is rendered in the
   items query's `starthtml` from `SET` variables — one query, no split.
5. An announcement slider with an editable title but no archive link, exposing
   only the date parts the markup actually shows.
6. A "products" slider that is still editorial `contents`, with a fixed
   new-tab link, a thumbnail-transform image path, and no date.
7. A footer whose link columns are served by one shared, parameterized query
   (`[esprit:query:…]`), plus a settings row for contact info and column titles.
8. A tabbed news widget: dynamic tabs (custom table) with synchronized header/pane
   loops, a `ROW_NUMBER()` CASE for the initial active tab, and each pane passing
   its group to a child `contents` query.
9. A multimedia gallery: tabs filtered by `contenttype` (not category), where each
   pane holds two synchronized child loops (a slider + a thumbnail strip).
10. Heterogeneous tabs: a fixed tab set where each pane is its own independent
    block (news from `contents`, tenders reusing `kicker`, a `contenttype` media
    mosaic, and a custom `achievements` table).

---

## Example 1: News cards grid → contents-based widget

The decision here: repeated news cards look like they need a "news items" table,
but in this Esprit environment editorial items live in `contents`. The addon
stores only widget settings and reads the cards with a query. See
`news-contents.md` ("Core Decision").

**Input**

```html
<div class="news-section__cards-grid">
  <a class="news-card" href="/" target="_self">
    <div class="news-card____image-container">
      <img class="news-card__image lazy" data-src="/uploads/isaar/assets/images/news-1.jpg"
           alt="تصویر خبر 1" width="300" height="200" />
      <div class="news-card__badge">
        <span class="news-card__badge-icon" data-src="/uploads/isaar/assets/svg/gallery.svg"></span>
      </div>
    </div>
    <div class="news-card__content">
      <h2 class="news-card__title">پنجمین همایش رویداد استارت‌آپ‌ها …</h2>
      <div class="news-card__date">
        <span class="news-card__date-icon" data-src="/uploads/isaar/assets/svg/calendar.svg"></span>
        <span class="news-card__date-text">27 آذر 1404</span>
      </div>
    </div>
  </a>
  <!-- 3 more .news-card items; card #2 and #4 use play.svg instead of gallery.svg -->
</div>
```

**Analysis**

- The four `a.news-card` elements share one structural signature → repeating
  pattern (`html-analysis.md`).
- The items are news/editorial → read from `contents`, do **not** create a
  `news_items` table (`news-contents.md`).
- The badge icon alternates `gallery.svg` / `play.svg` → it encodes content
  type, so map it from `contents.contenttype` instead of storing it
  (`news-contents.md`, "Content type icon mapping"). Here gallery → photo
  report, play → video.
- The layout fixes the count at four cards, so there is **no** `item_count`
  field — the query just uses `SELECT TOP 4` (`news-contents.md`, "Which
  settings a news section actually needs").
- It is a news section, so it still needs an archive page: add `on_page` so the
  item link can be built as `/archivePage/link`. A category filter (`on_category`)
  is optional here since the grid shows latest news.
- This block shows no section heading and no group label, so there is no
  editable `title`/`arch_title` and the `OUTER APPLY` for `groupTitle` is
  dropped (`news-contents.md`, "Canonical news query template").
- Image is lazy-loaded (`data-src`, 300×200). Bind `pic` with the standard
  `contents` image fallback.
- Date is emitted as the bilingual `display_day` / `display_month` /
  `display_year` aliases so the same query works on FA and non-FA sites
  (`news-contents.md`, "Date rendering (bilingual)").
- Aliases the HTML needs: `title`, `link`, `archivePage`, `pic`,
  `content_type_icon`, `display_day`, `display_month`, `display_year`. Expose
  nothing else (`addon-rules.md`, "Query Rules").

**Output**

```json
{
  "addonname": "ویجت کارت‌های خبری",
  "description": "نمایش آخرین اخبار به‌صورت گرید کارت، خوانده‌شده از محتوای مرکزی",
  "tables": [
    {
      "userfriendlyname": "تنظیمات کارت‌های خبری",
      "tablename": "news_cards_settings",
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
          "friendlyname": "صفحه آرشیو خبر",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        },
        {
          "friendlyname": "گروه محتوا",
          "friendlyname_en": "Category",
          "fieldname": "on_category",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "contentgroups",
          "db_text": "groupname",
          "db_value": "id"
        }
      ]
    }
  ],
  "queries": [
    {
      "queryname": "news_cards",
      "query": "DECLARE @contentCategory NVARCHAR(100), @archivePage NVARCHAR(256); SET @contentCategory = (SELECT TOP 1 ISNULL(on_category,'') FROM news_cards_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_category,'') != '' ORDER BY id DESC); SET @archivePage = (SELECT TOP 1 (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]) FROM news_cards_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != '' ORDER BY id DESC); SELECT TOP 4 c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE c.contenttype WHEN 2 THEN 'gallery.svg' WHEN 3 THEN 'play.svg' ELSE 'article.svg' END AS content_type_icon, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_year AS NVARCHAR(4)) ELSE DATENAME(year, c.customdatetime) END AS display_year FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND (@contentCategory = '' OR ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @contentCategory + ',%') ORDER BY c.customdatetime DESC",
      "starthtml": "<div class=\"news-section__cards-grid\">",
      "repeathtml": "<a class=\"news-card\" href=\"/[query-result:archivePage]/[query-result:link]\" target=\"_self\"><div class=\"news-card____image-container\"><img class=\"news-card__image lazy\" data-src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"300\" height=\"200\" /><div class=\"news-card__badge\"><span class=\"news-card__badge-icon\" data-src=\"/uploads/isaar/assets/svg/[query-result:content_type_icon]\"></span></div></div><div class=\"news-card__content\"><h2 class=\"news-card__title\">[query-result:title]</h2><div class=\"news-card__date\"><span class=\"news-card__date-icon\" data-src=\"/uploads/isaar/assets/svg/calendar.svg\"></span><span class=\"news-card__date-text\">[query-result:display_day] [query-result:display_month] [query-result:display_year]</span></div></div></a>",
      "endhtml": "</div>",
      "withoutresult": "<div class=\"news-section__cards-grid\"><a class=\"news-card\" href=\"/\" target=\"_self\"><div class=\"news-card____image-container\"><img class=\"news-card__image lazy\" data-src=\"/uploads/isaar/assets/images/news-1.jpg\" alt=\"تصویر خبر 1\" width=\"300\" height=\"200\" /><div class=\"news-card__badge\"><span class=\"news-card__badge-icon\" data-src=\"/uploads/isaar/assets/svg/gallery.svg\"></span></div></div><div class=\"news-card__content\"><h2 class=\"news-card__title\">پنجمین همایش رویداد استارت‌آپ‌ها برگزار شد</h2><div class=\"news-card__date\"><span class=\"news-card__date-icon\" data-src=\"/uploads/isaar/assets/svg/calendar.svg\"></span><span class=\"news-card__date-text\">27 آذر 1404</span></div></div></a><a class=\"news-card\" href=\"/\" target=\"_self\"><div class=\"news-card____image-container\"><img class=\"news-card__image lazy\" data-src=\"/uploads/isaar/assets/images/news-2.jpg\" alt=\"تصویر خبر 2\" width=\"300\" height=\"200\" /><div class=\"news-card__badge\"><span class=\"news-card__badge-icon\" data-src=\"/uploads/isaar/assets/svg/play.svg\"></span></div></div><div class=\"news-card__content\"><h2 class=\"news-card__title\">دیدار حجت‌الاسلام ابوترابی‌فرد با خانواده شهیدان عسگری</h2><div class=\"news-card__date\"><span class=\"news-card__date-icon\" data-src=\"/uploads/isaar/assets/svg/calendar.svg\"></span><span class=\"news-card__date-text\">27 آذر 1404</span></div></div></a></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

---

## Example 2: Systems grid → custom list table

The decision here is the opposite of Example 1. The "سامانه‌ها" cards are not
editorial content — they are a fixed, editor-managed set of links with their own
icons and descriptions. There is no central table for them, so a custom list
table is the right model (`html-analysis.md`, repeating list table).

**Input**

```html
<div class="systems-section__grid">
  <a class="system-card" href="/" target="_self" aria-label="سامانه ایثار من">
    <div class="system-card__content">
      <h3 class="system-card__title">سامانه ایثار من</h3>
      <p class="system-card__description">درگاه اختصاصی جامعه ایثارگری …</p>
    </div>
    <div class="system-card__icon">
      <img src="/uploads/isaar/assets/images/systems-1.png" alt="آیکون سامانه ایثار من" width="64" height="64" />
    </div>
  </a>
  <a class="system-card" href="/" target="_self" aria-label="پیشخوان ارباب رجوع">
    <span class="system-card__beta-badge">نسخه آزمایشی</span>
    <div class="system-card__content"> … </div>
    <div class="system-card__icon"> … </div>
  </a>
  <!-- 4 more .system-card items -->
</div>
```

**Analysis**

- Six `a.system-card` with one signature → repeating list table `systems`.
- Per-card fields: `title` (h3), `description` (p), `icon` (img 64×64),
  `link` (href). The link is editable, so it is `textinput` with `length=1024`
  plus a companion `target` selectbox (`addon-rules.md`, "Links").
- The "نسخه آزمایشی" badge appears on some cards only → an optional per-row
  `badge_text` field, not a separate table. Leaving it empty renders nothing.
- An editor needs to show/hide and reorder cards, so add `active` (checkbox,
  string `'1'`/`'0'`, default `"1"`) and `ordlist` (selectbox). The query filters
  on `active` and orders by `ordlist` (`addon-rules.md`, "Sliders And Repeating
  Item Lists" + "Query Rules").
- Image goes last, after text/link/select/config fields (`addon-rules.md`,
  "Metadata"). The icon is freely uploaded, so render it with
  `[query-result-fileurl:icon]`.
- The section heading "سامانه‌ها" is static and always present, so keep it as
  fixed text in `starthtml` rather than a field.
- Guard every selected column with `ISNULL` and a safe default (text → `''`,
  link → `'/'`, target → `'_self'`) so a missing value never renders as `NULL`,
  and start the href with a leading `/` (`addon-rules.md`, "Query Rules").

**Output**

```json
{
  "addonname": "سامانه‌ها",
  "description": "فهرست سامانه‌های قابل مدیریت با آیکون، توضیح و لینک",
  "tables": [
    {
      "userfriendlyname": "سامانه‌ها",
      "tablename": "systems",
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
          "friendlyname": "عنوان سامانه",
          "friendlyname_en": "Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "توضیحات",
          "friendlyname_en": "Description",
          "fieldname": "description",
          "fieldtype": "textarea",
          "defaultvalue": "",
          "length": "max",
          "direction": 0,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "لینک",
          "friendlyname_en": "Link",
          "fieldname": "link",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 1024,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "نحوه باز شدن لینک",
          "friendlyname_en": "Target",
          "fieldname": "target",
          "fieldtype": "selectbox",
          "defaultvalue": "_self",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\" تب جاری\",\"value\":\"_self\"},{\"text\":\" تب جدید\",\"value\":\"_blank\"}]"
        },
        {
          "friendlyname": "برچسب وضعیت",
          "friendlyname_en": "Badge Text",
          "fieldname": "badge_text",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 5,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 6,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 7,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"},{\"text\":\"5\",\"value\":\"5\"},{\"text\":\"6\",\"value\":\"6\"},{\"text\":\"7\",\"value\":\"7\"},{\"text\":\"8\",\"value\":\"8\"},{\"text\":\"9\",\"value\":\"9\"},{\"text\":\"10\",\"value\":\"10\"}]"
        },
        {
          "friendlyname": "آیکون [64*64]",
          "friendlyname_en": "Icon",
          "fieldname": "icon",
          "fieldtype": "file",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 8,
          "showonlist": 0,
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
      "queryname": "systems_list",
      "query": "SELECT ISNULL(title, '') AS title, ISNULL(description, '') AS description, ISNULL(icon, '') AS icon, ISNULL(link, '/') AS link, ISNULL(target, '_self') AS target, ISNULL(badge_text, N'') AS badge_text FROM systems WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "<div class=\"systems-section__grid\">",
      "repeathtml": "<a class=\"system-card\" href=\"/[query-result:link]\" target=\"[query-result:target]\" aria-label=\"[query-result:title]\"><span class=\"system-card__beta-badge\">[query-result:badge_text]</span><div class=\"system-card__content\"><h3 class=\"system-card__title\">[query-result:title]</h3><p class=\"system-card__description\">[query-result:description]</p></div><div class=\"system-card__icon\"><img src=\"[query-result-fileurl:icon]\" alt=\"[query-result:title]\" width=\"64\" height=\"64\" /></div></a>",
      "endhtml": "</div>",
      "withoutresult": "<div class=\"systems-section__grid\"><a class=\"system-card\" href=\"/\" target=\"_self\" aria-label=\"سامانه ایثار من\"><div class=\"system-card__content\"><h3 class=\"system-card__title\">سامانه ایثار من</h3><p class=\"system-card__description\">درگاه اختصاصی جامعه ایثارگری برای دسترسی سریع به خدمات بنیاد.</p></div><div class=\"system-card__icon\"><img src=\"/uploads/isaar/assets/images/systems-1.png\" alt=\"آیکون سامانه ایثار من\" width=\"64\" height=\"64\" /></div></a><a class=\"system-card\" href=\"/\" target=\"_self\" aria-label=\"پیشخوان ارباب رجوع\"><span class=\"system-card__beta-badge\">نسخه آزمایشی</span><div class=\"system-card__content\"><h3 class=\"system-card__title\">پیشخوان ارباب رجوع</h3><p class=\"system-card__description\">بستری برای ثبت درخواست‌ها و مکاتبات مردمی.</p></div><div class=\"system-card__icon\"><img src=\"/uploads/isaar/assets/images/systems-2.png\" alt=\"آیکون پیشخوان ارباب رجوع\" width=\"64\" height=\"64\" /></div></a></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

---

## Example 3: Provinces news list → contents + DB-bound category selector

This block combines a `contents` list with a category chooser. The province
`<select>` in the source (options carrying `data-grpid="1..31"`) is exactly a
`contentgroups` selector: the visible text is `groupname` and the value is the
group `id`. So the editable "category" setting becomes a DB-bound selectbox, and
each item exposes its group name as `groupTitle` (`news-contents.md`, DB-bound
metadata).

**Input**

```html
<div class="content-block content-block--provinces">
  <div class="section-header">
    <h2 class="section-header__title">اخبار استان‌ها</h2>
    <div class="section-header__controls">
      <select id="province-select">
        <option value="all">همه استان‌ها</option>
        <option value="آذربایجان شرقی" data-grpid="1">آذربایجان شرقی</option>
        <!-- … 31 provinces, each with data-grpid -->
      </select>
      <a class="section-header__archive-link" href="/archive">آرشیو</a>
    </div>
  </div>
  <div class="content-block__list">
    <a class="news-item" href="/" target="_self">
      <div class="news-item__image-container">
        <img class="news-item__image lazy" data-src="/uploads/isaar/assets/images/news-1.jpg"
             alt="همایش بزرگ ایثارگران در مشهد" width="134" height="100" />
      </div>
      <div class="news-item__content">
        <h3 class="news-item__title">همایش بزرگ ایثارگران در مشهد برگزار شد</h3>
        <p class="news-item__description">همایش سراسری ایثارگران …</p>
        <div class="news-item__meta">
          <div class="news-item__date">
            <span class="news-item__date-text">27 آذر 1404</span>
          </div>
          <span class="news-item__province">خراسان رضوی</span>
        </div>
      </div>
    </a>
    <!-- more .news-item rows -->
  </div>
</div>
```

**Analysis**

- The `news-item` rows share one signature → repeating, and they are editorial →
  read from `contents` (not a custom table).
- The province `<select>` is a category filter, not stored data. Model it as a
  settings field `on_category`, DB-bound to `contentgroups`
  (`db_text=groupname`, `db_value=id`) — the `data-grpid` values confirm the
  mapping. A single province is selected, so `selectbox` (use `checkbox` only if
  multiple provinces should show at once).
- Static, editable settings: the box `title` ("اخبار استان‌ها"), the archive
  label `arch_title` ("آرشیو"), and the archive `on_page`. These go in a one-row
  settings table (no `item_count` — the count is fixed in the query).
- Each row needs `title`, `summary` (the lead), `link`, `pic`, the bilingual
  date aliases, and `groupTitle` (the province name). This is the "compact text
  list with image" layout (`news-contents.md`, "Layout Variants").
- The province name **is** the content group label, so resolve it with the
  `OUTER APPLY` on `contentgroups` using the comma-safe match — not a plain
  `= c.groups`, which breaks when an item belongs to several groups
  (`news-contents.md`, "Canonical news query template").
- This section has its own heading and archive link, so `title`, `arch_title`,
  and `on_page` are all editable settings, and the item link is built as
  `/archivePage/link`. There is no `item_count` — like every news widget the row
  count is fixed in the query (`SELECT TOP 5`).
- Date uses the bilingual `display_day` / `display_month` / `display_year`
  aliases (`news-contents.md`, "Date rendering (bilingual)").

**Output**

```json
{
  "addonname": "اخبار استان‌ها",
  "description": "فهرست اخبار بر اساس استان (گروه محتوا) با امکان انتخاب استان",
  "tables": [
    {
      "userfriendlyname": "تنظیمات اخبار استان‌ها",
      "tablename": "province_news_settings",
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
          "friendlyname": "عنوان باکس",
          "friendlyname_en": "Box Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "اخبار استان‌ها",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "استان (گروه محتوا)",
          "friendlyname_en": "Province Group",
          "fieldname": "on_category",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "contentgroups",
          "db_text": "groupname",
          "db_value": "id"
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        },
        {
          "friendlyname": "عنوان لینک آرشیو",
          "friendlyname_en": "Archive Title",
          "fieldname": "arch_title",
          "fieldtype": "textinput",
          "defaultvalue": "آرشیو",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
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
      "queryname": "province_news",
      "query": "DECLARE @contentCategory NVARCHAR(100), @archivePage NVARCHAR(256); SET @contentCategory = (SELECT TOP 1 ISNULL(on_category,'') FROM province_news_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_category,'') != '' ORDER BY id DESC); SET @archivePage = (SELECT TOP 1 (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]) FROM province_news_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != '' ORDER BY id DESC); SELECT TOP 5 c.mainheadline AS title, c.lead AS summary, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, cg.groupname AS groupTitle, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_year AS NVARCHAR(4)) ELSE DATENAME(year, c.customdatetime) END AS display_year FROM contents c OUTER APPLY (SELECT TOP 1 cg.groupname FROM contentgroups cg WHERE ',' + c.groups + ',' LIKE '%,' + CAST(cg.id AS VARCHAR(20)) + ',%' ORDER BY LEN(cg.id) DESC, cg.id DESC) cg WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND (@contentCategory = '' OR ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @contentCategory + ',%') ORDER BY c.customdatetime DESC",
      "starthtml": "<div class=\"content-block content-block--provinces\"><div class=\"content-block__list\">",
      "repeathtml": "<a class=\"news-item\" href=\"/[query-result:archivePage]/[query-result:link]\" target=\"_self\"><div class=\"news-item__image-container\"><img class=\"news-item__image lazy\" data-src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"134\" height=\"100\" /></div><div class=\"news-item__content\"><h3 class=\"news-item__title\">[query-result:title]</h3><p class=\"news-item__description\">[query-result:summary]</p><div class=\"news-item__meta\"><div class=\"news-item__date\"><span class=\"news-item__date-text\">[query-result:display_day] [query-result:display_month] [query-result:display_year]</span></div><span class=\"news-item__province\">[query-result:groupTitle]</span></div></div></a>",
      "endhtml": "</div></div>",
      "withoutresult": "<div class=\"content-block content-block--provinces\"><div class=\"content-block__list\"><a class=\"news-item\" href=\"/\" target=\"_self\"><div class=\"news-item__image-container\"><img class=\"news-item__image lazy\" data-src=\"/uploads/isaar/assets/images/news-1.jpg\" alt=\"همایش بزرگ ایثارگران در مشهد\" width=\"134\" height=\"100\" /></div><div class=\"news-item__content\"><h3 class=\"news-item__title\">همایش بزرگ ایثارگران در مشهد برگزار شد</h3><p class=\"news-item__description\">همایش سراسری ایثارگران استان خراسان رضوی در مشهد مقدس برگزار شد.</p><div class=\"news-item__meta\"><div class=\"news-item__date\"><span class=\"news-item__date-text\">27 آذر 1404</span></div><span class=\"news-item__province\">خراسان رضوی</span></div></div></a><a class=\"news-item\" href=\"/\" target=\"_self\"><div class=\"news-item__image-container\"><img class=\"news-item__image lazy\" data-src=\"/uploads/isaar/assets/images/news-2.jpg\" alt=\"افتتاح مرکز خدمات درمانی\" width=\"134\" height=\"100\" /></div><div class=\"news-item__content\"><h3 class=\"news-item__title\">افتتاح مرکز خدمات درمانی ویژه ایثارگران استان اصفهان</h3><p class=\"news-item__description\">در راستای ارتقای خدمات درمانی، مرکز خدمات تخصصی درمانی ایثارگران در شهر اصفهان افتتاح شد.</p><div class=\"news-item__meta\"><div class=\"news-item__date\"><span class=\"news-item__date-text\">27 آذر 1404</span></div><span class=\"news-item__province\">اصفهان</span></div></div></a></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

---

## Example 4: Headquarters news carousel → editable section header in one query

This is a contents card slider with a full `section-header`: an editable
heading, prev/next controls, and an archive link. The slider behaviour
(`owl-carousel`) is pure front-end JS and has no bearing on the addon — model it
exactly like a card grid. The new lesson is the **header**: resolve its title,
archive label, and archive page into SQL variables (the same variable pattern
the news queries already use), expose them as constant columns, and render the
header in `starthtml`. One query is enough — no separate header query
(`news-contents.md`, "Rendering an editable section header").

**Input**

```html
<div class="content-block content-block--headquarters">
  <div class="section-header">
    <div class="section-header__title-wrapper">
      <h2 class="section-header__title">اخبار ستادی</h2>
    </div>
    <div class="section-header__controls">
      <div class="section-header__navigation" data-carousel="news-headquarters-carousel">
        <a href="#" class="section-header__nav-button section-header__nav-next" aria-label="بعدی">…</a>
        <a href="#" class="section-header__nav-button section-header__nav-prev" aria-label="قبلی">…</a>
      </div>
      <div class="section-header__divider"></div>
      <a class="section-header__archive-link" href="/archive" target="_self" aria-label="آرشیو">
        <span class="section-header__archive-icon" data-src="/uploads/isaar/assets/svg/direct.svg"></span>
        <span class="section-header__archive-text">آرشیو</span>
      </a>
    </div>
  </div>
  <div class="owl-carousel owl-theme content-block__cards" id="news-headquarters-carousel">
    <a class="headquarters-news-card headquarters-news-card--large" href="/" target="_self">
      <div class="headquarters-news-card__image-wrapper">
        <img class="headquarters-news-card__image owl-lazy" data-src="uploads/isaar/assets/images/news-8.jpg"
             alt="تصویر خبر" width="285" height="190" />
        <div class="headquarters-news-card__badge">
          <span class="headquarters-news-card__badge-icon" data-src="/uploads/isaar/assets/svg/gallery.svg"></span>
        </div>
      </div>
      <div class="headquarters-news-card__content">
        <div class="headquarters-news-card__date">
          <span class="headquarters-news-card__date-icon" data-src="/uploads/isaar/assets/svg/calendar.svg"></span>
          <span class="headquarters-news-card__date-text">27 آذر 1404</span>
        </div>
        <h3 class="headquarters-news-card__title">دومین نشست اتاق فکر دانش‌پژوهان …</h3>
      </div>
    </a>
    <!-- ~8 more .headquarters-news-card items -->
  </div>
  <div class="carousel-pagination" data-carousel="news-headquarters-carousel"></div>
</div>
```

**Analysis**

- The `headquarters-news-card` items repeat and are editorial → read from
  `contents`. The card layout (image 285×190, gallery/play badge, date, title)
  is the same kind as Example 1; reuse the canonical query with a fixed
  `SELECT TOP 8`.
- The heading text ("اخبار ستادی") and the archive link label ("آرشیو") are
  visible and belong to this section, so they are editable: `title` and
  `arch_title`. The archive link points at the section archive page, so add
  `on_page`; the section's own group is `on_category`.
- One query is enough. `SET` the box title, archive label, and archive page into
  variables, then `SELECT` them as constant columns next to the card columns. The
  title and archive label are editable but may be left empty, so fall back to a
  sensible default with
  `CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'اخبار ستادی' ELSE @boxTitle END`
  (`news-contents.md`, "Rendering an editable section header"). The header is
  rendered once in `starthtml` via `[query-result:boxTitle]` /
  `[query-result:archiveTitle]` / `[query-result:archivePage]`, and the cards in
  `repeathtml`.
- The section archive link is just `/[archivePage]` (no per-item link), while
  each card links to `/[archivePage]/[link]`.
- The prev/next buttons are static JS controls — keep them as fixed markup in
  the header `repeathtml`.
- Date uses the bilingual `display_*` aliases; the badge maps from `contenttype`
  to `content_type_icon` (`news-contents.md`).

**Output**

```json
{
  "addonname": "اخبار ستادی",
  "description": "اسلایدر اخبار ستادی همراه با هدر و لینک آرشیو قابل ویرایش",
  "tables": [
    {
      "userfriendlyname": "تنظیمات اخبار ستادی",
      "tablename": "headquarters_news_settings",
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
          "friendlyname": "عنوان بخش",
          "friendlyname_en": "Box Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "اخبار ستادی",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "گروه محتوا",
          "friendlyname_en": "Category",
          "fieldname": "on_category",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "contentgroups",
          "db_text": "groupname",
          "db_value": "id"
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        },
        {
          "friendlyname": "عنوان لینک آرشیو",
          "friendlyname_en": "Archive Title",
          "fieldname": "arch_title",
          "fieldtype": "textinput",
          "defaultvalue": "آرشیو",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
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
      "queryname": "headquarters_news",
      "query": "DECLARE @contentCategory NVARCHAR(100), @archivePage NVARCHAR(256), @boxTitle NVARCHAR(256), @archiveTitle NVARCHAR(256); SET @contentCategory = (SELECT TOP 1 ISNULL(on_category,'') FROM headquarters_news_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_category,'') != '' ORDER BY id DESC); SET @archivePage = (SELECT TOP 1 (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]) FROM headquarters_news_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != '' ORDER BY id DESC); SET @boxTitle = (SELECT TOP 1 title FROM headquarters_news_settings WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC); SET @archiveTitle = (SELECT TOP 1 arch_title FROM headquarters_news_settings WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC); SELECT TOP 8 CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'اخبار ستادی' ELSE @boxTitle END AS boxTitle, CASE WHEN @archiveTitle = '' OR @archiveTitle IS NULL THEN N'آرشیو' ELSE @archiveTitle END AS archiveTitle, @archivePage AS archivePage, c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE c.contenttype WHEN 2 THEN 'gallery.svg' WHEN 3 THEN 'play.svg' ELSE 'article.svg' END AS content_type_icon, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_year AS NVARCHAR(4)) ELSE DATENAME(year, c.customdatetime) END AS display_year FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND (@contentCategory = '' OR ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @contentCategory + ',%') ORDER BY c.customdatetime DESC",
      "starthtml": "<div class=\"content-block content-block--headquarters\"><div class=\"section-header\"><div class=\"section-header__title-wrapper\"><h2 class=\"section-header__title\">[query-result:boxTitle]</h2></div><div class=\"section-header__controls\"><div class=\"section-header__navigation\" data-carousel=\"news-headquarters-carousel\"><a href=\"#\" class=\"section-header__nav-button section-header__nav-next\" aria-label=\"بعدی\"><span class=\"section-header__nav-icon\" data-src=\"/uploads/isaar/assets/svg/arrow-circle-right.svg\"></span></a><a href=\"#\" class=\"section-header__nav-button section-header__nav-prev\" aria-label=\"قبلی\"><span class=\"section-header__nav-icon\" data-src=\"/uploads/isaar/assets/svg/arrow-circle-left.svg\"></span></a></div><div class=\"section-header__divider\"></div><a class=\"section-header__archive-link\" href=\"/[query-result:archivePage]\" target=\"_self\" aria-label=\"[query-result:archiveTitle]\"><span class=\"section-header__archive-icon\" data-src=\"/uploads/isaar/assets/svg/direct.svg\"></span><span class=\"section-header__archive-text\">[query-result:archiveTitle]</span></a></div></div><div class=\"owl-carousel owl-theme content-block__cards\" id=\"news-headquarters-carousel\">",
      "repeathtml": "<a class=\"headquarters-news-card headquarters-news-card--large\" href=\"/[query-result:archivePage]/[query-result:link]\" target=\"_self\"><div class=\"headquarters-news-card__image-wrapper\"><img class=\"headquarters-news-card__image owl-lazy\" data-src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"285\" height=\"190\" /><div class=\"headquarters-news-card__badge\"><span class=\"headquarters-news-card__badge-icon\" data-src=\"/uploads/isaar/assets/svg/[query-result:content_type_icon]\"></span></div></div><div class=\"headquarters-news-card__content\"><div class=\"headquarters-news-card__date\"><span class=\"headquarters-news-card__date-icon\" data-src=\"/uploads/isaar/assets/svg/calendar.svg\"></span><span class=\"headquarters-news-card__date-text\">[query-result:display_day] [query-result:display_month] [query-result:display_year]</span></div><h3 class=\"headquarters-news-card__title\">[query-result:title]</h3></div></a>",
      "endhtml": "</div><div class=\"carousel-pagination\" data-carousel=\"news-headquarters-carousel\"></div></div>",
      "withoutresult": "<div class=\"content-block content-block--headquarters\"><div class=\"section-header\"><div class=\"section-header__title-wrapper\"><h2 class=\"section-header__title\">اخبار ستادی</h2></div><div class=\"section-header__controls\"><div class=\"section-header__navigation\" data-carousel=\"news-headquarters-carousel\"><a href=\"#\" class=\"section-header__nav-button section-header__nav-next\" aria-label=\"بعدی\"><span class=\"section-header__nav-icon\" data-src=\"/uploads/isaar/assets/svg/arrow-circle-right.svg\"></span></a><a href=\"#\" class=\"section-header__nav-button section-header__nav-prev\" aria-label=\"قبلی\"><span class=\"section-header__nav-icon\" data-src=\"/uploads/isaar/assets/svg/arrow-circle-left.svg\"></span></a></div><div class=\"section-header__divider\"></div><a class=\"section-header__archive-link\" href=\"/archive\" target=\"_self\" aria-label=\"آرشیو\"><span class=\"section-header__archive-icon\" data-src=\"/uploads/isaar/assets/svg/direct.svg\"></span><span class=\"section-header__archive-text\">آرشیو</span></a></div></div><div class=\"owl-carousel owl-theme content-block__cards\" id=\"news-headquarters-carousel\"><a class=\"headquarters-news-card headquarters-news-card--large\" href=\"/\" target=\"_self\"><div class=\"headquarters-news-card__image-wrapper\"><img class=\"headquarters-news-card__image owl-lazy\" data-src=\"uploads/isaar/assets/images/news-8.jpg\" alt=\"تصویر خبر\" width=\"285\" height=\"190\" /><div class=\"headquarters-news-card__badge\"><span class=\"headquarters-news-card__badge-icon\" data-src=\"/uploads/isaar/assets/svg/gallery.svg\"></span></div></div><div class=\"headquarters-news-card__content\"><div class=\"headquarters-news-card__date\"><span class=\"headquarters-news-card__date-icon\" data-src=\"/uploads/isaar/assets/svg/calendar.svg\"></span><span class=\"headquarters-news-card__date-text\">27 آذر 1404</span></div><h3 class=\"headquarters-news-card__title\">دومین نشست اتاق فکر دانش‌پژوهان و نخبگان شاهد و ایثارگر برگزار شد</h3></div></a><a class=\"headquarters-news-card headquarters-news-card--large\" href=\"/\" target=\"_self\"><div class=\"headquarters-news-card__image-wrapper\"><img class=\"headquarters-news-card__image owl-lazy\" data-src=\"uploads/isaar/assets/images/news-7.jpg\" alt=\"تصویر خبر\" width=\"285\" height=\"190\" /><div class=\"headquarters-news-card__badge\"><span class=\"headquarters-news-card__badge-icon\" data-src=\"/uploads/isaar/assets/svg/gallery.svg\"></span></div></div><div class=\"headquarters-news-card__content\"><div class=\"headquarters-news-card__date\"><span class=\"headquarters-news-card__date-icon\" data-src=\"/uploads/isaar/assets/svg/calendar.svg\"></span><span class=\"headquarters-news-card__date-text\">27 آذر 1404</span></div><h3 class=\"headquarters-news-card__title\">دیدار نماینده ولی‌فقیه در استان البرز با خانواده شهدای حملات صهیونیستی</h3></div></a></div><div class=\"carousel-pagination\" data-carousel=\"news-headquarters-carousel\"></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

---

## Example 5: Announcement slider → editable title, no archive link, day+month only

A "اطلاعیه ها" (announcements) slider from another Esprit site. It is the
notification/announcement variant: a contents-based list with an editable
heading but **no** archive link, and a date that shows only day + month. The
lesson is restraint — expose only the settings and aliases the markup actually
uses, and keep the decorative chrome static.

**Input**

```html
<section class="notif" id="notif__sec" data-visibility="box_3">
  <img src="/uploads/npcrt/assets/images/invers-vector.webp" alt="invers-curve" class="invers__top" />
  <img src="/uploads/npcrt/assets/images/invers-vector.webp" alt="invers-curve" class="invers__bottom" />
  <div class="container">
    <div class="npc__head" data-aos="fade-up">
      <div class="npc__head__dots">…</div>
      <h4 class="npc__title">اطلاعیه ها</h4>
      <div class="npc__head__dots">…</div>
    </div>
    <div class="notif__slider" data-aos="fade-up">
      <div class="notif__cell">
        <div class="notif__item">
          <a href="/اطلاعیه-ها/فراخوان-مناقصه-عمومی-…" class="cover-link"></a>
          <div class="notif__date">
            <span data-src="/uploads/npcrt/assets/svg/bell.svg" data-stroke="var(--yellow)" data-stroke-width="2" data-size="35" class="notif__bell"></span>
            <span>1</span>
            <span>تیر</span>
          </div>
          <div class="notif__content">
            <h4 class="notif__title">فراخوان مناقصه عمومی یک مرحله‌ای همراه با ارزیابی کیفی مناقصه‌گران</h4>
          </div>
        </div>
      </div>
      <!-- 3 more .notif__cell items -->
    </div>
  </div>
</section>
```

**Analysis**

- The `notif__item` cells repeat and are editorial announcements → read from
  `contents` (`news-contents.md`, "Notification/announcement" variant).
- The heading "اطلاعیه ها" is editable (`title`), but there is **no** archive
  link in this section, so add no `arch_title` and render no archive link. Still
  add `on_page`, because each item links under the announcements archive
  (`/اطلاعیه-ها/<slug>` → `/[archivePage]/[link]`).
- The date shows only day and month — no year. Expose only `display_day` and
  `display_month`; drop `display_year` (expose only the aliases the HTML uses —
  `addon-rules.md`, "Query Rules").
- There is no image and no content-type badge in the item, so do not select
  `pic` or `content_type_icon`. This is the compact text list shape.
- The empty `a.cover-link` is the item link; bind its `href`. The bell icon, the
  `invers` decorative images, the `npc__head__dots`, and `data-visibility` are
  static front-end chrome — keep them as fixed markup in `starthtml` /
  `repeathtml`, not fields.
- One query: render the header in `starthtml` from `SET @boxTitle` with the
  `CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'اطلاعیه ها' ELSE @boxTitle END`
  fallback (`news-contents.md`, "Rendering an editable section header").

**Output**

```json
{
  "addonname": "اطلاعیه‌ها",
  "description": "اسلایدر اطلاعیه‌ها، خوانده‌شده از محتوای مرکزی",
  "tables": [
    {
      "userfriendlyname": "تنظیمات اطلاعیه‌ها",
      "tablename": "notif_settings",
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
          "friendlyname": "عنوان بخش",
          "friendlyname_en": "Box Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "اطلاعیه ها",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "گروه محتوا",
          "friendlyname_en": "Category",
          "fieldname": "on_category",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "contentgroups",
          "db_text": "groupname",
          "db_value": "id"
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        }
      ]
    }
  ],
  "queries": [
    {
      "queryname": "notifications",
      "query": "DECLARE @contentCategory NVARCHAR(100), @archivePage NVARCHAR(256), @boxTitle NVARCHAR(256); SET @contentCategory = (SELECT TOP 1 ISNULL(on_category,'') FROM notif_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_category,'') != '' ORDER BY id DESC); SET @archivePage = (SELECT TOP 1 (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]) FROM notif_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != '' ORDER BY id DESC); SET @boxTitle = (SELECT TOP 1 title FROM notif_settings WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC); SELECT TOP 8 CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'اطلاعیه ها' ELSE @boxTitle END AS boxTitle, @archivePage AS archivePage, c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND (@contentCategory = '' OR ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @contentCategory + ',%') ORDER BY c.customdatetime DESC",
      "starthtml": "<section class=\"notif\" id=\"notif__sec\" data-visibility=\"box_3\"><img src=\"/uploads/npcrt/assets/images/invers-vector.webp\" alt=\"invers-curve\" class=\"invers__top\" /><img src=\"/uploads/npcrt/assets/images/invers-vector.webp\" alt=\"invers-curve\" class=\"invers__bottom\" /><div class=\"container\"><div class=\"npc__head\" data-aos=\"fade-up\"><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div><h4 class=\"npc__title\">[query-result:boxTitle]</h4><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div></div><div class=\"notif__slider\" data-aos=\"fade-up\">",
      "repeathtml": "<div class=\"notif__cell\"><div class=\"notif__item\"><a href=\"/[query-result:archivePage]/[query-result:link]\" class=\"cover-link\"></a><div class=\"notif__date\"><span data-src=\"/uploads/npcrt/assets/svg/bell.svg\" data-stroke=\"var(--yellow)\" data-stroke-width=\"2\" data-size=\"35\" class=\"notif__bell\"></span><span>[query-result:display_day]</span><span>[query-result:display_month]</span></div><div class=\"notif__content\"><h4 class=\"notif__title\">[query-result:title]</h4></div></div></div>",
      "endhtml": "</div></div></section>",
      "withoutresult": "<section class=\"notif\" id=\"notif__sec\" data-visibility=\"box_3\"><img src=\"/uploads/npcrt/assets/images/invers-vector.webp\" alt=\"invers-curve\" class=\"invers__top\" /><img src=\"/uploads/npcrt/assets/images/invers-vector.webp\" alt=\"invers-curve\" class=\"invers__bottom\" /><div class=\"container\"><div class=\"npc__head\" data-aos=\"fade-up\"><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div><h4 class=\"npc__title\">اطلاعیه ها</h4><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div></div><div class=\"notif__slider\" data-aos=\"fade-up\"><div class=\"notif__cell\"><div class=\"notif__item\"><a href=\"/اطلاعیه-ها/فراخوان-مناقصه-عمومی-یک-مرحله‌ای-همراه-با-ارزیابی-کیفی-مناقصه‌گران\" class=\"cover-link\"></a><div class=\"notif__date\"><span data-src=\"/uploads/npcrt/assets/svg/bell.svg\" data-stroke=\"var(--yellow)\" data-stroke-width=\"2\" data-size=\"35\" class=\"notif__bell\"></span><span>1</span><span>تیر</span></div><div class=\"notif__content\"><h4 class=\"notif__title\">فراخوان مناقصه عمومی یک مرحله‌ای همراه با ارزیابی کیفی مناقصه‌گران</h4></div></div></div><div class=\"notif__cell\"><div class=\"notif__item\"><a href=\"/اطلاعیه-ها/تشکیل-بانک-اطلاعات-شرکت-های-توانمند-جهت-بازسازی-مجتمع-های-پتروشیمی\" class=\"cover-link\"></a><div class=\"notif__date\"><span data-src=\"/uploads/npcrt/assets/svg/bell.svg\" data-stroke=\"var(--yellow)\" data-stroke-width=\"2\" data-size=\"35\" class=\"notif__bell\"></span><span>30</span><span>خرداد</span></div><div class=\"notif__content\"><h4 class=\"notif__title\">تشکیل بانک اطلاعات شرکت های توانمند جهت بازسازی مجتمع های پتروشیمی</h4></div></div></div></div></div></section>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

---

## Example 6: Products slider → custom item table with an editable section header

A "محصولات" (products) slider. These are editor-managed catalog records, **not**
editorial `contents` — confirmed with the user, the exact contents-vs-custom-table
call described in `SKILL.md` ("When To Ask Instead Of Guessing"). So the products
live in a custom `products` table, while the editable section title and the
archive page live in a small `products_settings` table. It combines Example 2
(custom list table with `active`/`ordlist`) and Example 4 (header values via
`SET` variables), plus a fixed new-tab link and a thumbnail-transform image.

**Input**

```html
<section class="products" id="products" data-visibility="box_6">
  <div class="container">
    <div class="npc__head" data-aos="fade-up">
      <div class="npc__head__dots">…</div>
      <h4 class="npc__title">محصولات</h4>
      <div class="npc__head__dots">…</div>
    </div>
    <div class="product__slider" data-aos="zoom-in">
      <div class="product__cell">
        <div class="product__item">
          <a href="/محصولات/کاتالیست-تولید-اتیلن-اکساید" target="_blank" class="cover-link"></a>
          <div class="product__img">
            <img src="/thumbnail/150-150/uploads/1/2026/Jun/23/Gemini_…png" width="145" height="145" alt="" class="fit-img" />
          </div>
          <div class="product__content">
            <h4 class="product__title">کاتالیست تولید اتیلن اکساید</h4>
            <span class="product__dot"><span></span></span>
            <p class="product__lead">کاتالیست تولید اتیلن‌اکساید یکی از کلیدی‌ترین مواد …</p>
          </div>
        </div>
      </div>
      <!-- 5 more .product__cell items -->
    </div>
  </div>
</section>
```

**Analysis**

- The repeating `product__item` are managed catalog records → a custom
  `products` table, **not** `contents`. This is the contents-vs-custom-table
  decision from `SKILL.md` ("When To Ask Instead Of Guessing"); it was confirmed
  with the user rather than guessed.
- The section title "محصولات" is editable and the products sit under a "محصولات"
  archive page, so a `products_settings` table holds `title` + `on_page`. Resolve
  both with the `SET`-variable pattern and render the header in `starthtml`
  (`news-contents.md`, "Rendering an editable section header").
- Each product's link is built from its own title under that archive page:
  `dbo.rew(title) AS link`, with `href="/[query-result:archivePage]/[query-result:link]"`.
- The link always opens in a new tab in the markup, so keep `target="_blank"` as
  a constant — no editable `target` field (`addon-rules.md`, "Header/Footer").
- The image is a `file` field served through a resize transform: keep the
  constant `/thumbnail/150-150/` prefix in the HTML and bind the file URL,
  `src="/thumbnail/150-150/[query-result-fileurl:image]"` (`addon-rules.md`,
  "Images"). The empty `alt` is bound to the title.
- It is an editor-managed, sortable slider → add `active` (checkbox `'1'`/`'0'`)
  and `ordlist`; filter `active = '1'` and order by `ordlist` (`addon-rules.md`,
  "Sliders And Repeating Item Lists").
- No date in the markup → no date field or aliases. Decorative `product__dot`,
  the head dots, and `data-visibility` stay static.

**Output**

```json
{
  "addonname": "محصولات",
  "description": "اسلایدر محصولات با جدول اختصاصی و تنظیمات عنوان/آرشیو",
  "tables": [
    {
      "userfriendlyname": "تنظیمات محصولات",
      "tablename": "products_settings",
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
          "friendlyname": "عنوان بخش",
          "friendlyname_en": "Box Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "محصولات",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        }
      ]
    },
    {
      "userfriendlyname": "محصولات",
      "tablename": "products",
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
          "friendlyname": "عنوان محصول",
          "friendlyname_en": "Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "توضیح کوتاه",
          "friendlyname_en": "Lead",
          "fieldname": "lead",
          "fieldtype": "textarea",
          "defaultvalue": "",
          "length": "max",
          "direction": 0,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"},{\"text\":\"5\",\"value\":\"5\"},{\"text\":\"6\",\"value\":\"6\"},{\"text\":\"7\",\"value\":\"7\"},{\"text\":\"8\",\"value\":\"8\"},{\"text\":\"9\",\"value\":\"9\"},{\"text\":\"10\",\"value\":\"10\"}]"
        },
        {
          "friendlyname": "تصویر [145*145]",
          "friendlyname_en": "Image",
          "fieldname": "image",
          "fieldtype": "file",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 0,
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
      "queryname": "products",
      "query": "DECLARE @archivePage NVARCHAR(256), @boxTitle NVARCHAR(256); SET @boxTitle = (SELECT TOP 1 title FROM products_settings WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC); SET @archivePage = (SELECT TOP 1 (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE ISNULL(on_page,'') = pages.id AND deleted = 0 AND siteid = [system:site-id]) FROM products_settings WHERE deleted = 0 AND siteid = [system:site-id] AND ISNULL(on_page,'') != '' ORDER BY id DESC); SELECT CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'محصولات' ELSE @boxTitle END AS boxTitle, @archivePage AS archivePage, ISNULL(p.title, '') AS title, dbo.rew(p.title) AS link, ISNULL(p.lead, '') AS lead, ISNULL(p.image, '') AS image FROM products p WHERE p.deleted = 0 AND p.active = '1' AND p.siteid = [system:site-id] ORDER BY CAST(p.ordlist AS INT) ASC",
      "starthtml": "<section class=\"products\" id=\"products\" data-visibility=\"box_6\"><div class=\"container\"><div class=\"npc__head\" data-aos=\"fade-up\"><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div><h4 class=\"npc__title\">[query-result:boxTitle]</h4><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div></div><div class=\"product__slider\" data-aos=\"zoom-in\">",
      "repeathtml": "<div class=\"product__cell\"><div class=\"product__item\"><a href=\"/[query-result:archivePage]/[query-result:link]\" target=\"_blank\" class=\"cover-link\"></a><div class=\"product__img\"><img src=\"/thumbnail/150-150/[query-result-fileurl:image]\" width=\"145\" height=\"145\" alt=\"[query-result:title]\" class=\"fit-img\" /></div><div class=\"product__content\"><h4 class=\"product__title\">[query-result:title]</h4><span class=\"product__dot\"><span></span></span><p class=\"product__lead\">[query-result:lead]</p></div></div></div>",
      "endhtml": "</div></div></section>",
      "withoutresult": "<section class=\"products\" id=\"products\" data-visibility=\"box_6\"><div class=\"container\"><div class=\"npc__head\" data-aos=\"fade-up\"><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div><h4 class=\"npc__title\">محصولات</h4><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div></div><div class=\"product__slider\" data-aos=\"zoom-in\"><div class=\"product__cell\"><div class=\"product__item\"><a href=\"/محصولات/کاتالیست-تولید-اتیلن-اکساید\" target=\"_blank\" class=\"cover-link\"></a><div class=\"product__img\"><img src=\"/thumbnail/150-150/uploads/1/2026/Jun/23/Gemini_Generated_Image_dgrmzvdgrmzvdgrm.png\" width=\"145\" height=\"145\" alt=\"کاتالیست تولید اتیلن اکساید\" class=\"fit-img\" /></div><div class=\"product__content\"><h4 class=\"product__title\">کاتالیست تولید اتیلن اکساید</h4><span class=\"product__dot\"><span></span></span><p class=\"product__lead\">کاتالیست تولید اتیلن‌اکساید یکی از کلیدی‌ترین مواد در صنعت پتروشیمی است.</p></div></div></div><div class=\"product__cell\"><div class=\"product__item\"><a href=\"/محصولات/کاتالیست-سنتز-متانول\" target=\"_blank\" class=\"cover-link\"></a><div class=\"product__img\"><img src=\"/thumbnail/150-150/uploads/1/2026/Jun/23/methanol.png\" width=\"145\" height=\"145\" alt=\"کاتالیست سنتز متانول\" class=\"fit-img\" /></div><div class=\"product__content\"><h4 class=\"product__title\">کاتالیست سنتز متانول</h4><span class=\"product__dot\"><span></span></span><p class=\"product__lead\">کاتالیست سنتز متانول یکی از اساسی‌ترین اجزای فنی در زنجیره تولید متانول است.</p></div></div></div></div></div></section>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

---

## Example 7: Footer → per-block queries assembled in an HTML skeleton

The footer has several distinct DOM regions: a contact block, three link
columns, a visitor-stats column, and a copyright line. Rather than one giant
query, model each block as its own table + query and assemble them by embedding
`[esprit:query:ID]` shortcodes in a static footer skeleton (`addon-rules.md`,
"Composing A Section From Multiple Queries"). This exercises the footer rule and
the cross-query parameter mechanism together, and the same compose-from-queries
pattern is reusable in any section.

**Input**

```html
<footer class="footer"><div class="container"><div class="row"><div class="col-12">
  <div class="footer__contact">
    <div class="contact-item contact-item--address">…<h3 class="contact-item__title">آدرس</h3><p class="contact-item__text">تهران، خیابان ولیعصر…</p>…</div>
    <div class="contact-item">…<h3 class="contact-item__title">تلفن</h3><p class="contact-item__text number-breaker">02183230000</p>…</div>
    <div class="contact-item" style="display:none;">…<h3>نمابر</h3><p class="contact-item__text number-breaker"></p>…</div>
    <div class="contact-item" style="display:none;">…<h3>پست الکترونیک</h3><p class="contact-item__text"></p>…</div>
    <div class="contact-item">…<h3 class="contact-item__title">کد پستی</h3><p class="contact-item__text number-breaker">1593647711</p>…</div>
  </div>
  <div class="footer__separator"></div>
  <div class="footer__links">
    <div class="footer-section">
      <h3 class="footer-section__title">خدمات و سامانه‌ها</h3>
      <div class="footer-section__list">
        <a class="footer-link" href="https://my.isaar.ir/" target="_blank" aria-label="سامانه ایثارمن"><span class="footer-link__text">سامانه ایثارمن</span></a>
        <!-- … more links -->
      </div>
    </div>
    <div class="footer-section"><h3 class="footer-section__title">دسترسی سریع</h3><div class="footer-section__list">…</div></div>
    <div class="footer-section"><h3 class="footer-section__title">پیوندهای مفید</h3><div class="footer-section__list">…</div></div>
    <div class="footer-section">
      <h3 class="footer-section__title">آمار بازدیدکنندگان</h3>
      <div class="footer-section__list"><div class="footer-link"><span class="footer-link__text">بازدید کل : 5741957</span></div>…</div>
    </div>
  </div>
  <div class="footer__final-separator"></div>
  <div class="footer__copyright">
    <div class="footer__copyright-text">© به روزرسانی فنی مرکز نوآوری…</div>
    <div class="footer__update-text">آخرین بروزرسانی سایت : 1405/04/03 22:28</div>
  </div>
</div></div></div></footer>
```

**Analysis**

- Three separate concerns → three tables: `contact_info` (address, phone, fax,
  email, postcode — all five exist even though نمابر/ایمیل are currently empty),
  `footer_settings` (the column titles + the stats-column title), and
  `footer_link_items` (the links). Keep contact info out of `footer_settings`
  (`addon-rules.md`, "Footer Link Lists").
- The contact-item **labels** (آدرس، تلفن، کد پستی) are universal micro-labels,
  not editable fields — render them with `[esprit:translate:address]`,
  `[esprit:translate:phone]`, `[esprit:translate:postal-code]`
  (`esprit-portal.md`, "Translations"). The contact *values* still come from
  `contact_info`. By contrast the column/box headings ("خدمات و سامانه‌ها",
  "آمار بازدیدکنندگان") are editable, so they are `footer_settings` fields.
- The three link columns share one `footer_link_items` table, distinguished by a
  `group_id` selectbox with generic values (`col_1`, `col_2`, `col_3`). Each link
  has its own editable `target` because the source mixes `_blank` and `_self`.
- Footer links are full external URLs (`https://…`), so bind `href` as-is — **no**
  leading `/` here (that rule is for site-root-relative paths).
- Write one query per block and render only that block's DOM:
  - `footer_contact` — `SELECT TOP 1` over `contact_info`, renders the
    `footer__contact` items. An optional item (نمابر/ایمیل) is best given its own
    guarded `SELECT TOP 1 … WHERE ISNULL(fax,'') != ''` query so it shows only
    when filled.
  - `footer_columns` — `SELECT TOP 1` over `footer_settings`, renders the
    `footer__links` region: the three section titles, each followed by the link
    query embedded with its column id, `[esprit:query:NN:col_1]` … and the static
    stats column.
  - `footer_links` — the shared list, filtered by `group_id = '[parameters:0:]'`.
- The footer wrapper, separators, and the copyright/last-update line are the
  static skeleton; it embeds the contact and columns queries and uses fixed
  Esprit shortcodes (`[esprit:total-visits]`, `[esprit:today-visits]`,
  `[esprit:online-visitors]`, `[esprit:site-last-update]`) for non-addon data
  (`esprit-portal.md`). `NN` is each query's DB id, wired after import.
- `ordlist` covers up to 7 links per column.

**Output**

```json
{
  "addonname": "فوتر",
  "description": "اطلاعات تماس، عنوان ستون‌ها و لینک‌های فوتر در جدول‌های جداگانه",
  "tables": [
    {
      "userfriendlyname": "اطلاعات تماس",
      "tablename": "contact_info",
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
          "friendlyname": "آدرس",
          "friendlyname_en": "Address",
          "fieldname": "address",
          "fieldtype": "textarea",
          "defaultvalue": "",
          "length": "max",
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "تلفن",
          "friendlyname_en": "Phone",
          "fieldname": "phone",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "نمابر",
          "friendlyname_en": "Fax",
          "fieldname": "fax",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "پست الکترونیک",
          "friendlyname_en": "Email",
          "fieldname": "email",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "کد پستی",
          "friendlyname_en": "Postcode",
          "fieldname": "postcode",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        }
      ]
    },
    {
      "userfriendlyname": "تنظیمات فوتر",
      "tablename": "footer_settings",
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
          "friendlyname": "عنوان ستون ۱",
          "friendlyname_en": "Column 1 Title",
          "fieldname": "col1_title",
          "fieldtype": "textinput",
          "defaultvalue": "خدمات و سامانه‌ها",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "عنوان ستون ۲",
          "friendlyname_en": "Column 2 Title",
          "fieldname": "col2_title",
          "fieldtype": "textinput",
          "defaultvalue": "دسترسی سریع",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "عنوان ستون ۳",
          "friendlyname_en": "Column 3 Title",
          "fieldname": "col3_title",
          "fieldtype": "textinput",
          "defaultvalue": "پیوندهای مفید",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "عنوان ستون آمار",
          "friendlyname_en": "Stats Column Title",
          "fieldname": "stats_title",
          "fieldtype": "textinput",
          "defaultvalue": "آمار بازدیدکنندگان",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        }
      ]
    },
    {
      "userfriendlyname": "لینک‌های فوتر",
      "tablename": "footer_link_items",
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
          "friendlyname": "عنوان لینک",
          "friendlyname_en": "Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "لینک",
          "friendlyname_en": "Link",
          "fieldname": "link",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 1024,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "نحوه باز شدن لینک",
          "friendlyname_en": "Target",
          "fieldname": "target",
          "fieldtype": "selectbox",
          "defaultvalue": "_self",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\" تب جاری\",\"value\":\"_self\"},{\"text\":\" تب جدید\",\"value\":\"_blank\"}]"
        },
        {
          "friendlyname": "ستون",
          "friendlyname_en": "Column",
          "fieldname": "group_id",
          "fieldtype": "selectbox",
          "defaultvalue": "col_1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "[{\"text\":\"ستون اول\",\"value\":\"col_1\"},{\"text\":\"ستون دوم\",\"value\":\"col_2\"},{\"text\":\"ستون سوم\",\"value\":\"col_3\"}]"
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 6,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"},{\"text\":\"5\",\"value\":\"5\"},{\"text\":\"6\",\"value\":\"6\"},{\"text\":\"7\",\"value\":\"7\"}]"
        }
      ]
    }
  ],
  "queries": [
    {
      "queryname": "footer_contact",
      "query": "SELECT TOP 1 ISNULL(address, '') AS address, ISNULL(phone, '') AS phone, ISNULL(postcode, '') AS postcode FROM contact_info WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC",
      "starthtml": "",
      "repeathtml": "<div class=\"footer__contact\"><div class=\"contact-item contact-item--address\"><div class=\"contact-item__icon\"><span class=\"contact-item__icon\" data-src=\"/uploads/isaar/assets/svg/fi-rr-marker.svg\" data-stroke=\"#64748B\" data-stroke-width=\"0\" data-size=\"32\"></span></div><div class=\"contact-item__content\"><h3 class=\"contact-item__title\">[esprit:translate:address]</h3><p class=\"contact-item__text\">[query-result:address]</p></div></div><div class=\"contact-item\"><div class=\"contact-item__icon\"><span class=\"contact-item__icon\" data-src=\"/uploads/isaar/assets/svg/fi-rr-phone-call.svg\" data-stroke=\"#64748B\" data-stroke-width=\"0\" data-size=\"32\"></span></div><div class=\"contact-item__content\"><h3 class=\"contact-item__title\">[esprit:translate:phone]</h3><p class=\"contact-item__text number-breaker\">[query-result:phone]</p></div></div><div class=\"contact-item\"><div class=\"contact-item__icon\"><span class=\"contact-item__icon\" data-src=\"/uploads/isaar/assets/svg/fi-rr-envelope.svg\" data-stroke=\"#64748B\" data-stroke-width=\"0\" data-size=\"32\"></span></div><div class=\"contact-item__content\"><h3 class=\"contact-item__title\">[esprit:translate:postal-code]</h3><p class=\"contact-item__text number-breaker\">[query-result:postcode]</p></div></div></div>",
      "endhtml": "",
      "withoutresult": "<div class=\"footer__contact\"><div class=\"contact-item contact-item--address\"><div class=\"contact-item__content\"><h3 class=\"contact-item__title\">آدرس</h3><p class=\"contact-item__text\">تهران، خیابان ولیعصر، ساختمان بنیاد شهید و امور ایثارگران</p></div></div><div class=\"contact-item\"><div class=\"contact-item__content\"><h3 class=\"contact-item__title\">تلفن</h3><p class=\"contact-item__text number-breaker\">02183230000</p></div></div><div class=\"contact-item\"><div class=\"contact-item__content\"><h3 class=\"contact-item__title\">کد پستی</h3><p class=\"contact-item__text number-breaker\">1593647711</p></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "footer_columns",
      "query": "SELECT TOP 1 ISNULL(NULLIF(col1_title, N''), N'خدمات و سامانه‌ها') AS col1_title, ISNULL(NULLIF(col2_title, N''), N'دسترسی سریع') AS col2_title, ISNULL(NULLIF(col3_title, N''), N'پیوندهای مفید') AS col3_title, ISNULL(NULLIF(stats_title, N''), N'آمار بازدیدکنندگان') AS stats_title FROM footer_settings WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC",
      "starthtml": "",
      "repeathtml": "<div class=\"footer__links\"><div class=\"footer-section\"><h3 class=\"footer-section__title\">[query-result:col1_title]</h3><div class=\"footer-section__list\">[esprit:query:NN:col_1]</div></div><div class=\"footer-section\"><h3 class=\"footer-section__title\">[query-result:col2_title]</h3><div class=\"footer-section__list\">[esprit:query:NN:col_2]</div></div><div class=\"footer-section\"><h3 class=\"footer-section__title\">[query-result:col3_title]</h3><div class=\"footer-section__list\">[esprit:query:NN:col_3]</div></div><div class=\"footer-section\"><h3 class=\"footer-section__title\">[query-result:stats_title]</h3><div class=\"footer-section__list\"><div class=\"footer-link\"><span class=\"footer-link__text\">بازدید کل : [esprit:total-visits]</span></div><div class=\"footer-link\"><span class=\"footer-link__text\">بازدید امروز : [esprit:today-visits]</span></div><div class=\"footer-link\"><span class=\"footer-link__text\">کاربران آنلاین : [esprit:online-visitors]</span></div></div></div></div>",
      "endhtml": "",
      "withoutresult": "<div class=\"footer__links\"><div class=\"footer-section\"><h3 class=\"footer-section__title\">خدمات و سامانه‌ها</h3><div class=\"footer-section__list\"><a class=\"footer-link\" href=\"https://my.isaar.ir/\" target=\"_blank\" aria-label=\"سامانه ایثارمن\"><span class=\"footer-link__text\">سامانه ایثارمن</span></a></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "footer_links",
      "query": "SELECT ISNULL(title, '') AS title, ISNULL(link, '/') AS link, ISNULL(target, '_self') AS target FROM footer_link_items WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] AND group_id = '[parameters:0:]' ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "",
      "repeathtml": "<a class=\"footer-link\" href=\"[query-result:link]\" target=\"[query-result:target]\" aria-label=\"[query-result:title]\"><span class=\"footer-link__text\">[query-result:title]</span></a>",
      "endhtml": "",
      "withoutresult": "<a class=\"footer-link\" href=\"https://my.isaar.ir/\" target=\"_blank\" aria-label=\"سامانه ایثارمن\"><span class=\"footer-link__text\">سامانه ایثارمن</span></a>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

The footer skeleton — placed in the template/static block, not inside any query
— embeds the per-block queries by their DB ids (replace each `NN` with the real
query id after import):

```html
<footer class="footer"><div class="container"><div class="row"><div class="col-12">
  [esprit:query:NN]               <!-- footer_contact -->
  <div class="footer__separator"></div>
  [esprit:query:NN]               <!-- footer_columns (each column embeds footer_links) -->
  <div class="footer__final-separator"></div>
  <div class="footer__copyright">
    <div class="footer__copyright-text">© به روزرسانی فنی مرکز نوآوری، هوشمندسازی و امنیت بنیاد شهید و امور ایثارگران</div>
    <div class="footer__update-text">آخرین بروزرسانی سایت : [esprit:site-last-update]</div>
  </div>
</div></div></div></footer>
```

**Translation keys to add** (report to the user): this footer uses
`[esprit:translate:address]`, `[esprit:translate:phone]`,
`[esprit:translate:postal-code]` (and `fax`/`email` if those items are enabled).
Add each keyword under Settings → Language Management, or they render blank.

---

## Example 8: Tabbed news widget → dynamic tabs + synchronized header/pane loops + child query

The richest case: tab titles are dynamic, each tab carries its own news settings,
and panes are filled by passing the tab's group to a child query. It combines a
custom list table, the `ROW_NUMBER()` id/active pattern, compose-from-queries,
and parameter passing (`addon-rules.md`, "Tabbed Widgets").

**Input**

```html
<div class="col-lg-6">
  <ul class="news__tabs" data-aos="zoom-in">
    <li class="news__tab__item active"><a href="#news1" id="tab_item1" class="news__tab__link"><span data-src="/uploads/npcrt/assets/svg/newspaper.svg" …></span>اخبار ویژه</a></li>
    <li class="news__tab__item"><a href="#news2" id="tab_item2" class="news__tab__link"><span data-src="/uploads/npcrt/assets/svg/megaphone.svg" …></span>اخبار استان‌ها</a></li>
    <li class="news__tab__item"><a href="#news3" id="tab_item3" class="news__tab__link"><span data-src="/uploads/npcrt/assets/svg/radio.svg" …></span>گزارش‌ها</a></li>
  </ul>
  <div class="news__tabs__content" data-aos="zoom-in">
    <div class="news__tabs__pane show fade" id="news1">
      <div class="news__tabs__inner"><div class="row">
        <div class="col-lg-12"><div class="newstab__item">
          <div class="newstab__img"><img data-src="/uploads/npcrt/assets/images/g1.webp" alt="sample" class="fit-img lazy" /><a href="###" class="cover-link"></a></div>
          <div class="newstab__content">
            <p class="newstabs__date"><span data-src="/uploads/npcrt/assets/svg/new-calendar.svg" …></span>30 فروردین 1405</p>
            <h4 class="newstab__title"><a href="###" class="newstab__link">دستیابی به دانش فنی تولید کاتالیست …</a></h4>
          </div>
        </div></div>
        <!-- more .newstab__item -->
      </div></div>
    </div>
    <div class="news__tabs__pane fade" id="news2">…</div>
    <div class="news__tabs__pane fade" id="news3">…</div>
  </div>
</div>
```

**Analysis**

- The three `li.news__tab__item` are editor-managed (dynamic titles, per-tab
  icons, and each tab owns its news settings) → a custom list table `news_tabs`
  (`title`, `icon`, `on_category`, `on_page`, `active`, `ordlist`), not contents
  (`SKILL.md`, "When To Ask Instead Of Guessing").
- The pane items (`newstab__item`) are editorial news → read from `contents` in a
  child query, not stored.
- Headers (`<ul>`) and panes (`news__tabs__content`) are two synchronized loops
  over `news_tabs`, so write **two** queries over it and give both the same
  `ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) AS row`, so the header
  `href="#news[row]"` pairs with the pane `id="news[row]"` (`addon-rules.md`,
  "Tabbed Widgets").
- Only the first tab/pane starts open, so seed it with
  `CASE WHEN ROW_NUMBER() OVER (...) = 1 THEN 'active' ELSE '' END` (and `'show'`
  for the pane); JS handles clicks afterwards.
- Each pane fills itself by passing only the tab's `id` (a default column on
  every table — no field needed): `[esprit:query:NN:[query-result:id]]`. The
  child `tab_news` receives it with `[intparameters:0:0]` and resolves
  `@contentCategory` and `@archivePage` from `news_tabs` (and `pages`) by that id
  at the top, then filters `contents` by the group. Passing one id beats passing
  many values (`addon-rules.md`, "Passing Parameters Between Queries").
- The tab icon is a theme svg with a constant base path, so store just the
  filename in a textinput and bind `data-src="/uploads/npcrt/assets/svg/[query-result:icon]"`
  (`addon-rules.md`, "Images"). Date uses the bilingual `display_*` aliases; item
  links are `/[archivePage]/[link]`. Each `NN` is wired to the real query id after
  import.

**Output**

```json
{
  "addonname": "تب‌های خبری",
  "description": "ویجت تب‌دار با تب‌های پویا که هر تب اخبار گروه خودش را نشان می‌دهد",
  "tables": [
    {
      "userfriendlyname": "تب‌های خبری",
      "tablename": "news_tabs",
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
          "friendlyname": "عنوان تب",
          "friendlyname_en": "Tab Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "آیکون",
          "friendlyname_en": "Icon",
          "fieldname": "icon",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "گروه محتوا",
          "friendlyname_en": "Category",
          "fieldname": "on_category",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "contentgroups",
          "db_text": "groupname",
          "db_value": "id"
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 6,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"},{\"text\":\"5\",\"value\":\"5\"},{\"text\":\"6\",\"value\":\"6\"},{\"text\":\"7\",\"value\":\"7\"},{\"text\":\"8\",\"value\":\"8\"},{\"text\":\"9\",\"value\":\"9\"},{\"text\":\"10\",\"value\":\"10\"}]"
        }
      ]
    }
  ],
  "queries": [
    {
      "queryname": "news_tab_headers",
      "query": "SELECT ISNULL(title, '') AS title, ISNULL(icon, '') AS icon, ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) AS row, CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'active' ELSE '' END AS active_class FROM news_tabs WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "<ul class=\"news__tabs\" data-aos=\"zoom-in\">",
      "repeathtml": "<li class=\"news__tab__item [query-result:active_class]\"><a href=\"#news[query-result:row]\" id=\"tab_item[query-result:row]\" class=\"news__tab__link\"><span data-src=\"/uploads/npcrt/assets/svg/[query-result:icon]\" data-stroke=\"var(--secondary)\" data-stroke-width=\"2\" data-size=\"30\"></span>[query-result:title]</a></li>",
      "endhtml": "</ul>",
      "withoutresult": "<ul class=\"news__tabs\" data-aos=\"zoom-in\"><li class=\"news__tab__item active\"><a href=\"#news1\" id=\"tab_item1\" class=\"news__tab__link\"><span data-src=\"/uploads/npcrt/assets/svg/newspaper.svg\" data-stroke=\"var(--secondary)\" data-stroke-width=\"2\" data-size=\"30\"></span>اخبار ویژه</a></li><li class=\"news__tab__item\"><a href=\"#news2\" id=\"tab_item2\" class=\"news__tab__link\"><span data-src=\"/uploads/npcrt/assets/svg/megaphone.svg\" data-stroke=\"var(--secondary)\" data-stroke-width=\"2\" data-size=\"30\"></span>اخبار استان‌ها</a></li></ul>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "news_tab_panes",
      "query": "SELECT id, ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) AS row, CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'show' ELSE '' END AS show_class FROM news_tabs WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "<div class=\"news__tabs__content\" data-aos=\"zoom-in\">",
      "repeathtml": "<div class=\"news__tabs__pane [query-result:show_class] fade\" id=\"news[query-result:row]\"><div class=\"news__tabs__inner\"><div class=\"row\">[esprit:query:NN:[query-result:id]]</div></div></div>",
      "endhtml": "</div>",
      "withoutresult": "<div class=\"news__tabs__content\" data-aos=\"zoom-in\"><div class=\"news__tabs__pane show fade\" id=\"news1\"><div class=\"news__tabs__inner\"><div class=\"row\"><div class=\"col-lg-12\"><div class=\"newstab__item\"><div class=\"newstab__img\"><img data-src=\"/uploads/npcrt/assets/images/g1.webp\" alt=\"sample\" class=\"fit-img lazy\" /><a href=\"###\" class=\"cover-link\"></a></div><div class=\"newstab__content\"><p class=\"newstabs__date\"><span data-src=\"/uploads/npcrt/assets/svg/new-calendar.svg\" data-stroke=\"var(--text)\" data-stroke-width=\"2\" data-size=\"15\"></span>30 فروردین 1405</p><h4 class=\"newstab__title\"><a href=\"###\" class=\"newstab__link\">دستیابی به دانش فنی تولید کاتالیست نشانه بلوغ</a></h4></div></div></div></div></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "tab_news",
      "query": "DECLARE @contentCategory NVARCHAR(100), @archivePage NVARCHAR(256); SET @contentCategory = (SELECT ISNULL(on_category,'') FROM news_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SET @archivePage = (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE pages.id = (SELECT on_page FROM news_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]) AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 5 c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_year AS NVARCHAR(4)) ELSE DATENAME(year, c.customdatetime) END AS display_year FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @contentCategory + ',%' ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<div class=\"col-lg-12\"><div class=\"newstab__item\"><div class=\"newstab__img\"><img data-src=\"[query-result:pic]\" alt=\"[query-result:title]\" class=\"fit-img lazy\" /><a href=\"/[query-result:archivePage]/[query-result:link]\" class=\"cover-link\"></a></div><div class=\"newstab__content\"><p class=\"newstabs__date\"><span data-src=\"/uploads/npcrt/assets/svg/new-calendar.svg\" data-stroke=\"var(--text)\" data-stroke-width=\"2\" data-size=\"15\"></span>[query-result:display_day] [query-result:display_month] [query-result:display_year]</p><h4 class=\"newstab__title\"><a href=\"/[query-result:archivePage]/[query-result:link]\" class=\"newstab__link\">[query-result:title]</a></h4></div></div></div>",
      "endhtml": "",
      "withoutresult": "<div class=\"col-lg-12\"><div class=\"newstab__item\"><div class=\"newstab__img\"><img data-src=\"/uploads/npcrt/assets/images/g1.webp\" alt=\"sample\" class=\"fit-img lazy\" /><a href=\"###\" class=\"cover-link\"></a></div><div class=\"newstab__content\"><p class=\"newstabs__date\"><span data-src=\"/uploads/npcrt/assets/svg/new-calendar.svg\" data-stroke=\"var(--text)\" data-stroke-width=\"2\" data-size=\"15\"></span>30 فروردین 1405</p><h4 class=\"newstab__title\"><a href=\"###\" class=\"newstab__link\">دستیابی به دانش فنی تولید کاتالیست نشانه بلوغ</a></h4></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

The section skeleton — embeds the headers query then the panes query (each pane
embeds `tab_news`); replace each `NN` with the real query id after import:

```html
<div class="col-lg-6">
  [esprit:query:NN]   <!-- news_tab_headers -->
  [esprit:query:NN]   <!-- news_tab_panes (each pane embeds tab_news with its group) -->
</div>
```

---

## Example 9: Multimedia gallery → contenttype tabs + slider/thumb dual loops

Like Example 8 but multimedia: the tabs (ویدئویی / تصویری / interview …) are
filtered by `contenttype` instead of a category, and each pane holds **two**
synchronized loops over the same content — a main `gallery__slider` and a
`gallery__thumb` strip (`addon-rules.md`, "Tabbed Widgets"; `news-contents.md`,
"Content types").

**Input**

```html
<section class="gallery lazy" data-bg="/uploads/npcrt/assets/images/gallery-bg.webp" id="gallery" data-visibility="box_5">
  <div class="container">
    <div class="npc__head"><h4 class="npc__title">چندرسانه ای</h4></div>
    <div class="gallery__tabs__wrapper">
      <ul class="gallery__tabs" data-aos="fade-up">
        <li class="gallery__tab__item active"><a href="#gallery1" id="gallerytab_item1" class="gallery__tab__link"><span data-src="/uploads/npcrt/assets/svg/video.svg" …></span>ویدئویی</a></li>
        <li class="gallery__tab__item"><a href="#gallery2" id="gallerytab_item2" class="gallery__tab__link"><span data-src="/uploads/npcrt/assets/svg/camera.svg" …></span>تصویری</a></li>
        <!-- مصاحبه مدیران / مصاحبه پژوهشگران -->
      </ul>
    </div>
    <div class="gallery__tabs__content" data-aos="fade-up">
      <div class="gallery__tabs__pane show fade" id="gallery1">
        <div class="gallery__box">
          <div class="gallery__slider">
            <div class="gallery__cell"><div class="gallery__item">
              <div class="gallery__img-div"><div class="gallery__img-box"><img src="/uploads/npcrt/assets/images/g1.webp" alt="news" class="fit-img" /></div></div>
              <div class="gallery__content">
                <p class="gallery__kicker">تقویت پیوند علم و صنعت …</p>
                <h4 class="gallery__title"><a href="###" class="gallery__link">هیئت امنا، مدیران …</a></h4>
                <p class="gallery__date"><span data-src="/uploads/npcrt/assets/svg/new-calendar.svg" …></span>30 فروردین 1405</p>
              </div>
            </div></div>
            <!-- more .gallery__cell -->
          </div>
          <div class="gallery__thumb">
            <div class="gallery__thumb__cell"><div class="gallery__thumb__item">
              <span data-src="/uploads/npcrt/assets/svg/video.svg" …></span>
              <img src="/uploads/npcrt/assets/images/g1.webp" alt="news" class="fit-img" />
            </div></div>
            <!-- more .gallery__thumb__cell -->
          </div>
        </div>
      </div>
      <!-- panes #gallery2 … -->
    </div>
  </div>
</section>
```

**Analysis**

- Tabs are editor-managed → a custom `gallery_tabs` table. Because the widget is
  multimedia, each tab stores a `contenttype` selectbox (`1` news, `2` image,
  `3` video, `4` audio) **instead of** `on_category` (`addon-rules.md`, "Tabbed
  Widgets"; `news-contents.md`, "Content types"). Plus `title`, `icon`, `on_page`,
  `active`, `ordlist`.
- Headers and panes are two synchronized loops over `gallery_tabs` (same
  `ROW_NUMBER() AS row` so `#gallery[row]` ↔ `id="gallery[row]"`, CASE for the
  initial active/show) — exactly as Example 8.
- Each pane holds two loops over the same content: the `gallery__slider` and the
  `gallery__thumb`. Each is its own child query; the pane embeds both and passes
  the tab `id` to each: `[esprit:query:SLIDER_NN:[query-result:id]]` and
  `[esprit:query:THUMB_NN:[query-result:id]]`.
- Both child queries resolve `@contenttype` (and `@archivePage`) from
  `gallery_tabs` by the passed id, then filter `contents` with
  `c.contenttype = @contenttype`. The thumb strip shows a per-type icon via
  `CASE c.contenttype …` (`news-contents.md`, content-type icon mapping).
- The section heading "چندرسانه ای" is a visible heading, so it is always
  editable — a one-row `gallery_settings` table holds `title`, rendered by a
  `gallery_header` (`SELECT TOP 1`) query with a CASE fallback (never hardcode a
  visible heading static). Item links are `/[archivePage]/[link]`; dates use the
  bilingual `display_*` aliases.
- Tabs are sensitive: this example assumed every tab is multimedia. In practice,
  ask the user per tab (news vs multimedia vs a non-news type needing its own
  table) before building (`addon-rules.md`, "Tabbed Widgets").

**Output**

```json
{
  "addonname": "گالری چندرسانه‌ای",
  "description": "تب‌های چندرسانه‌ای بر اساس نوع محتوا، با اسلایدر و نوار بندانگشتی",
  "tables": [
    {
      "userfriendlyname": "تنظیمات گالری",
      "tablename": "gallery_settings",
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
          "friendlyname": "عنوان بخش",
          "friendlyname_en": "Box Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "چندرسانه ای",
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
    },
    {
      "userfriendlyname": "تب‌های گالری",
      "tablename": "gallery_tabs",
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
          "friendlyname": "عنوان تب",
          "friendlyname_en": "Tab Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "آیکون",
          "friendlyname_en": "Icon",
          "fieldname": "icon",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "نوع محتوا",
          "friendlyname_en": "Content Type",
          "fieldname": "contenttype",
          "fieldtype": "selectbox",
          "defaultvalue": "3",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "[{\"text\":\"خبری\",\"value\":\"1\"},{\"text\":\"تصویری\",\"value\":\"2\"},{\"text\":\"ویدئویی\",\"value\":\"3\"},{\"text\":\"صوتی\",\"value\":\"4\"}]"
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 6,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"},{\"text\":\"5\",\"value\":\"5\"}]"
        }
      ]
    }
  ],
  "queries": [
    {
      "queryname": "gallery_header",
      "query": "DECLARE @boxTitle NVARCHAR(256); SET @boxTitle = (SELECT TOP 1 title FROM gallery_settings WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY id DESC); SELECT TOP 1 CASE WHEN @boxTitle = '' OR @boxTitle IS NULL THEN N'چندرسانه ای' ELSE @boxTitle END AS boxTitle",
      "starthtml": "",
      "repeathtml": "<div class=\"npc__head\" data-aos=\"fade-up\"><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div><h4 class=\"npc__title\">[query-result:boxTitle]</h4><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div></div>",
      "endhtml": "",
      "withoutresult": "<div class=\"npc__head\" data-aos=\"fade-up\"><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div><h4 class=\"npc__title\">چندرسانه ای</h4><div class=\"npc__head__dots\"><span class=\"nhd__top\"></span><div class=\"nhd__bottom\"><span class=\"nhd__bottom1\"></span><span class=\"nhd__bottom2\"></span></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "gallery_tab_headers",
      "query": "SELECT ISNULL(title, '') AS title, ISNULL(icon, '') AS icon, ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) AS row, CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'active' ELSE '' END AS active_class FROM gallery_tabs WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "<div class=\"gallery__tabs__wrapper\"><ul class=\"gallery__tabs\" data-aos=\"fade-up\">",
      "repeathtml": "<li class=\"gallery__tab__item [query-result:active_class]\"><a href=\"#gallery[query-result:row]\" id=\"gallerytab_item[query-result:row]\" class=\"gallery__tab__link\"><span data-src=\"/uploads/npcrt/assets/svg/[query-result:icon]\" data-stroke=\"var(--secondary)\" data-stroke-width=\"2\" data-size=\"30\"></span>[query-result:title]</a></li>",
      "endhtml": "</ul></div>",
      "withoutresult": "<div class=\"gallery__tabs__wrapper\"><ul class=\"gallery__tabs\" data-aos=\"fade-up\"><li class=\"gallery__tab__item active\"><a href=\"#gallery1\" id=\"gallerytab_item1\" class=\"gallery__tab__link\"><span data-src=\"/uploads/npcrt/assets/svg/video.svg\" data-stroke=\"var(--secondary)\" data-stroke-width=\"2\" data-size=\"30\"></span>ویدئویی</a></li><li class=\"gallery__tab__item\"><a href=\"#gallery2\" id=\"gallerytab_item2\" class=\"gallery__tab__link\"><span data-src=\"/uploads/npcrt/assets/svg/camera.svg\" data-stroke=\"var(--secondary)\" data-stroke-width=\"2\" data-size=\"30\"></span>تصویری</a></li></ul></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "gallery_tab_panes",
      "query": "SELECT id, ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) AS row, CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'show' ELSE '' END AS show_class FROM gallery_tabs WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "<div class=\"gallery__tabs__content\" data-aos=\"fade-up\">",
      "repeathtml": "<div class=\"gallery__tabs__pane [query-result:show_class] fade\" id=\"gallery[query-result:row]\"><div class=\"gallery__box\"><div class=\"gallery__slider\">[esprit:query:NN:[query-result:id]]</div><div class=\"gallery__thumb\">[esprit:query:NN:[query-result:id]]</div></div></div>",
      "endhtml": "</div>",
      "withoutresult": "<div class=\"gallery__tabs__content\" data-aos=\"fade-up\"><div class=\"gallery__tabs__pane show fade\" id=\"gallery1\"><div class=\"gallery__box\"><div class=\"gallery__slider\"><div class=\"gallery__cell\"><div class=\"gallery__item\"><div class=\"gallery__img-div\"><div class=\"gallery__img-box\"><img src=\"/uploads/npcrt/assets/images/g1.webp\" alt=\"news\" class=\"fit-img\" /></div></div><div class=\"gallery__content\"><p class=\"gallery__kicker\">تقویت پیوند علم و صنعت در مسیر توسعه صنعت پتروشیمی</p><h4 class=\"gallery__title\"><a href=\"###\" class=\"gallery__link\">هیئت امنا، مدیران و روسای دانشگاه آزاد اسلامی …</a></h4><p class=\"gallery__date\"><span data-src=\"/uploads/npcrt/assets/svg/new-calendar.svg\" data-stroke=\"#fff\" data-stroke-width=\"2\" data-size=\"15\"></span>30 فروردین 1405</p></div></div></div></div><div class=\"gallery__thumb\"><div class=\"gallery__thumb__cell\"><div class=\"gallery__thumb__item\"><span data-src=\"/uploads/npcrt/assets/svg/video.svg\" data-stroke=\"#fff\" data-stroke-width=\"2\" data-size=\"25\"></span><img src=\"/uploads/npcrt/assets/images/g1.webp\" alt=\"news\" class=\"fit-img\" /></div></div></div></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "gallery_slider",
      "query": "DECLARE @contenttype INT, @archivePage NVARCHAR(256); SET @contenttype = (SELECT contenttype FROM gallery_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SET @archivePage = (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE pages.id = (SELECT on_page FROM gallery_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]) AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 6 c.kicker AS kicker, c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_year AS NVARCHAR(4)) ELSE DATENAME(year, c.customdatetime) END AS display_year FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND c.contenttype = @contenttype ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<div class=\"gallery__cell\"><div class=\"gallery__item\"><div class=\"gallery__img-div\"><div class=\"gallery__img-box\"><img src=\"[query-result:pic]\" alt=\"[query-result:title]\" class=\"fit-img\" /></div></div><div class=\"gallery__content\"><p class=\"gallery__kicker\">[query-result:kicker]</p><h4 class=\"gallery__title\"><a href=\"/[query-result:archivePage]/[query-result:link]\" class=\"gallery__link\">[query-result:title]</a></h4><p class=\"gallery__date\"><span data-src=\"/uploads/npcrt/assets/svg/new-calendar.svg\" data-stroke=\"#fff\" data-stroke-width=\"2\" data-size=\"15\"></span>[query-result:display_day] [query-result:display_month] [query-result:display_year]</p></div></div></div>",
      "endhtml": "",
      "withoutresult": "<div class=\"gallery__cell\"><div class=\"gallery__item\"><div class=\"gallery__img-div\"><div class=\"gallery__img-box\"><img src=\"/uploads/npcrt/assets/images/g1.webp\" alt=\"news\" class=\"fit-img\" /></div></div><div class=\"gallery__content\"><p class=\"gallery__kicker\">تقویت پیوند علم و صنعت در مسیر توسعه صنعت پتروشیمی</p><h4 class=\"gallery__title\"><a href=\"###\" class=\"gallery__link\">هیئت امنا، مدیران و روسای دانشگاه آزاد اسلامی …</a></h4><p class=\"gallery__date\"><span data-src=\"/uploads/npcrt/assets/svg/new-calendar.svg\" data-stroke=\"#fff\" data-stroke-width=\"2\" data-size=\"15\"></span>30 فروردین 1405</p></div></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "gallery_thumb",
      "query": "DECLARE @contenttype INT; SET @contenttype = (SELECT contenttype FROM gallery_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 6 c.mainheadline AS title, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE c.contenttype WHEN 2 THEN 'camera.svg' WHEN 3 THEN 'video.svg' WHEN 4 THEN 'mic.svg' ELSE 'video.svg' END AS media_icon FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND c.contenttype = @contenttype ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<div class=\"gallery__thumb__cell\"><div class=\"gallery__thumb__item\"><span data-src=\"/uploads/npcrt/assets/svg/[query-result:media_icon]\" data-stroke=\"#fff\" data-stroke-width=\"2\" data-size=\"25\"></span><img src=\"[query-result:pic]\" alt=\"[query-result:title]\" class=\"fit-img\" /></div></div>",
      "endhtml": "",
      "withoutresult": "<div class=\"gallery__thumb__cell\"><div class=\"gallery__thumb__item\"><span data-src=\"/uploads/npcrt/assets/svg/video.svg\" data-stroke=\"#fff\" data-stroke-width=\"2\" data-size=\"25\"></span><img src=\"/uploads/npcrt/assets/images/g1.webp\" alt=\"news\" class=\"fit-img\" /></div></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

The section skeleton (static template) embeds the headers then the panes; each
pane already embeds the slider + thumb child queries. Replace each `NN` with the
real query id after import:

```html
<section class="gallery lazy" data-bg="/uploads/npcrt/assets/images/gallery-bg.webp" id="gallery" data-visibility="box_5">
  <img src="/uploads/npcrt/assets/images/invers-vector.webp" alt="invers-curve" class="invers__top" />
  <img src="/uploads/npcrt/assets/images/invers-vector.webp" alt="invers-curve" class="invers__bottom" />
  <div class="container">
    [esprit:query:NN]   <!-- gallery_header (editable section title) -->
    [esprit:query:NN]   <!-- gallery_tab_headers -->
    [esprit:query:NN]   <!-- gallery_tab_panes (each pane embeds gallery_slider + gallery_thumb) -->
  </div>
</section>
```

---

## Example 10: Heterogeneous featured tabs → a fixed tab set, each pane its own block

Four tabs of **different** kinds: news, tenders, a media mosaic, and
achievements. The homogeneous tab pattern (Examples 8–9) doesn't fit — instead
the tab set is fixed, the labels live in a `featured_tabs` settings table, and
**each pane is its own independent query/block** wired into a static skeleton
(`addon-rules.md`, "Heterogeneous tabs"). Decisions here were confirmed with the
user per tab.

**Input** (abridged)

```html
<section id="site-featured" class="featured-tabs">
  <div class="featured-tabs__topbar">
    <div class="featured-tabs__tab-list esprit-tab-list" role="tablist">
      <button class="featured-tabs__tab esprit-tab active" data-tab="featured-notices" data-archiveText="آرشیو اطلاعیه‌ها">اطلاعیه‌ها و پیام‌ها</button>
      <button class="featured-tabs__tab esprit-tab" data-tab="featured-tenders" data-archiveText="آرشیو مناقصه‌ها">مناقصه‌ها و مزایده‌ها</button>
      <button class="featured-tabs__tab esprit-tab" data-tab="featured-media">چندرسانه‌ای</button>
      <button class="featured-tabs__tab esprit-tab" data-tab="featured-achievements">افتخارات و دستاوردها</button>
    </div>
    <div class="featured-tabs__actions"><!-- archive link + owl prev/next/dots (JS chrome) --></div>
  </div>
  <div class="featured-tabs__contents esprit-tab-contents">
    <div class="featured-tabs__content active" data-content="featured-notices"><div class="featured-tabs__carousel owl-carousel">
      <article class="featured-tabs__card"><a class="featured-tabs__media" href="#"><img src="…featured-tabs-01.webp" width="410" height="231" /><span class="featured-tabs__media-badge"><span data-src="…/gallery.svg"></span></span></a><h3 class="featured-tabs__card-title"><a href="#">…</a></h3><div class="featured-tabs__date"><time>27 آذر 1404</time>…</div></article>
    </div></div>
    <div class="featured-tabs__content" data-content="featured-tenders"><div class="featured-tabs__carousel owl-carousel">
      <article class="featured-tabs__card">…<time>شماره مناقصه : ۴۰۴۵۵</time><span data-src="…/directbox-notif.svg"></span></article>
    </div></div>
    <div class="featured-tabs__content" data-content="featured-media"><div class="media-gallery-tab">
      <div class="media-gallery-tab__item media-gallery-tab__item--hero"><div class="media-gallery-tab__carousel owl-carousel"><a class="media-gallery-tab__carousel-item">…</a></div></div>
      <a class="media-gallery-tab__item media-gallery-tab__item--side-top">…</a>
      <!-- side-bottom / bottom-start / bottom-end -->
    </div></div>
    <div class="featured-tabs__content" data-content="featured-achievements"><div class="featured-tabs__carousel owl-carousel">
      <article class="featured-tabs__card"><a class="featured-tabs__media" href="#"><img src="…achievements-01.jpg" /></a><h3 class="featured-tabs__card-title"><a href="#">گواهینامه …</a></h3></article>
    </div></div>
  </div>
</section>
```

**Analysis**

- Heterogeneous tabs, but built to be **extensible**: a `featured_tabs` table
  holds the editable label, a `tab_key` **selectbox** of the known types
  (`news`/`tenders`/`media`/`achievements`), archive text/page, and the per-pane
  filter settings (`on_category`, `contenttype`). A `featured_tab_headers` query
  renders the buttons, pairing each to its pane by the row **id**
  (`data-tab="tab_[id]"`), active via the `ROW_NUMBER()` CASE.
- Panes are not fixed wrappers. There is **one panes-loop query per type**
  (`featured_news_panes`, `featured_tenders_panes`, …) that loops only its type's
  tabs (`WHERE tab_key = 'news'` …), emits each pane `id="tab_[id]"`, and embeds
  the type's content child passing the tab `id`: `[esprit:query:NN:[query-result:id]]`.
  So **adding another tab of an existing type is just a new row** — the headers
  loop shows it and that type's panes-loop renders its pane, with no query or
  table change (`addon-rules.md`, "Heterogeneous tabs"). JS seeds the initial
  active pane.
- Each content child resolves its own settings from the passed tab id
  (`… FROM featured_tabs WHERE id = [intparameters:0:0]`), so one child query
  serves every tab of its type.
- **اطلاعیه‌ها** → `featured_notices`: `contents` news cards with the
  `content_type_icon` badge and the bilingual date.
- **مناقصه‌ها** → `featured_tenders`: `contents` (tenders category), and the
  "شماره مناقصه : …" number is read from the existing `kicker` column — no
  separate table (user's choice).
- **چندرسانه‌ای** → a `contenttype` media mosaic: a hero carousel
  (`featured_media_hero`) plus four positioned slots (`featured_media_slots`,
  whose position class comes from a `ROW_NUMBER()` CASE) — two child loops over
  the same content, both filtered by the tab's `contenttype`.
- **افتخارات** → `featured_achievements`: a custom `achievements` table (image +
  title only, no date/badge).
- The topbar archive link and owl prev/next/dots are JS chrome → kept static in
  the skeleton. Item links are `/[archivePage]/[link]`. Only adding a brand-new
  *type* (a layout not among the four) needs new development.

**Output**

```json
{
  "addonname": "محتوای منتخب (تب‌ها)",
  "description": "تب‌های ثابت ناهمگن: اطلاعیه‌ها، مناقصه‌ها، چندرسانه‌ای و افتخارات",
  "tables": [
    {
      "userfriendlyname": "تب‌های محتوای منتخب",
      "tablename": "featured_tabs",
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
          "friendlyname": "عنوان تب",
          "friendlyname_en": "Tab Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "نوع تب",
          "friendlyname_en": "Tab Type",
          "fieldname": "tab_key",
          "fieldtype": "selectbox",
          "defaultvalue": "news",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 1,
          "staticitems": "[{\"text\":\"خبری/اطلاعیه‌ها\",\"value\":\"news\"},{\"text\":\"مناقصه‌ها و مزایده‌ها\",\"value\":\"tenders\"},{\"text\":\"چندرسانه‌ای\",\"value\":\"media\"},{\"text\":\"افتخارات\",\"value\":\"achievements\"}]"
        },
        {
          "friendlyname": "متن آرشیو",
          "friendlyname_en": "Archive Text",
          "fieldname": "archive_text",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 3,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "صفحه آرشیو",
          "friendlyname_en": "Archive Page",
          "fieldname": "on_page",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "pages",
          "db_text": "pagetitle",
          "db_value": "id"
        },
        {
          "friendlyname": "گروه محتوا",
          "friendlyname_en": "Category",
          "fieldname": "on_category",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "",
          "dbtable": "contentgroups",
          "db_text": "groupname",
          "db_value": "id"
        },
        {
          "friendlyname": "نوع محتوا",
          "friendlyname_en": "Content Type",
          "fieldname": "contenttype",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 6,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"خبری\",\"value\":\"1\"},{\"text\":\"تصویری\",\"value\":\"2\"},{\"text\":\"ویدئویی\",\"value\":\"3\"},{\"text\":\"صوتی\",\"value\":\"4\"}]"
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 7,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 8,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"}]"
        }
      ]
    },
    {
      "userfriendlyname": "افتخارات",
      "tablename": "achievements",
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
          "friendlyname": "عنوان",
          "friendlyname_en": "Title",
          "fieldname": "title",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 255,
          "direction": 0,
          "deleted": 0,
          "ord": 1,
          "showonlist": 1,
          "subform": 0,
          "search": 1,
          "required": 1,
          "staticitems": ""
        },
        {
          "friendlyname": "لینک",
          "friendlyname_en": "Link",
          "fieldname": "link",
          "fieldtype": "textinput",
          "defaultvalue": "",
          "length": 1024,
          "direction": 1,
          "deleted": 0,
          "ord": 2,
          "showonlist": 0,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "وضعیت نمایش",
          "friendlyname_en": "Active",
          "fieldname": "active",
          "fieldtype": "checkbox",
          "defaultvalue": "1",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 3,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": ""
        },
        {
          "friendlyname": "ترتیب",
          "friendlyname_en": "Order",
          "fieldname": "ordlist",
          "fieldtype": "selectbox",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 4,
          "showonlist": 1,
          "subform": 0,
          "search": 0,
          "required": 0,
          "staticitems": "[{\"text\":\"1\",\"value\":\"1\"},{\"text\":\"2\",\"value\":\"2\"},{\"text\":\"3\",\"value\":\"3\"},{\"text\":\"4\",\"value\":\"4\"},{\"text\":\"5\",\"value\":\"5\"},{\"text\":\"6\",\"value\":\"6\"}]"
        },
        {
          "friendlyname": "تصویر [410*231]",
          "friendlyname_en": "Image",
          "fieldname": "image",
          "fieldtype": "file",
          "defaultvalue": "",
          "length": 0,
          "direction": 1,
          "deleted": 0,
          "ord": 5,
          "showonlist": 0,
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
      "queryname": "featured_tab_headers",
      "query": "SELECT id, ISNULL(title, '') AS title, ISNULL(archive_text, '') AS archive_text, CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'active' ELSE '' END AS active_class, CASE WHEN ROW_NUMBER() OVER (ORDER BY CAST(ordlist AS INT) ASC) = 1 THEN 'true' ELSE 'false' END AS aria_selected FROM featured_tabs WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "<div class=\"featured-tabs__tab-list esprit-tab-list\" role=\"tablist\">",
      "repeathtml": "<button class=\"featured-tabs__tab esprit-tab [query-result:active_class]\" type=\"button\" data-tab=\"tab_[query-result:id]\" data-archiveText=\"[query-result:archive_text]\" role=\"tab\" aria-selected=\"[query-result:aria_selected]\">[query-result:title]</button>",
      "endhtml": "</div>",
      "withoutresult": "<div class=\"featured-tabs__tab-list esprit-tab-list\" role=\"tablist\"><button class=\"featured-tabs__tab esprit-tab active\" type=\"button\" data-tab=\"featured-notices\" data-archiveText=\"آرشیو اطلاعیه‌ها\" role=\"tab\" aria-selected=\"true\">اطلاعیه‌ها و پیام‌ها</button><button class=\"featured-tabs__tab esprit-tab\" type=\"button\" data-tab=\"featured-tenders\" data-archiveText=\"آرشیو مناقصه‌ها\" role=\"tab\" aria-selected=\"false\">مناقصه‌ها و مزایده‌ها</button></div>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_news_panes",
      "query": "SELECT id FROM featured_tabs WHERE deleted = 0 AND active = '1' AND tab_key = 'news' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "",
      "repeathtml": "<div class=\"featured-tabs__content esprit-tab-content\" data-content=\"tab_[query-result:id]\" role=\"tabpanel\"><div class=\"featured-tabs__carousel owl-carousel\">[esprit:query:NN:[query-result:id]]</div></div>",
      "endhtml": "",
      "withoutresult": "",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_tenders_panes",
      "query": "SELECT id FROM featured_tabs WHERE deleted = 0 AND active = '1' AND tab_key = 'tenders' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "",
      "repeathtml": "<div class=\"featured-tabs__content esprit-tab-content\" data-content=\"tab_[query-result:id]\" role=\"tabpanel\"><div class=\"featured-tabs__carousel owl-carousel\">[esprit:query:NN:[query-result:id]]</div></div>",
      "endhtml": "",
      "withoutresult": "",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_media_panes",
      "query": "SELECT id FROM featured_tabs WHERE deleted = 0 AND active = '1' AND tab_key = 'media' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "",
      "repeathtml": "<div class=\"featured-tabs__content esprit-tab-content\" data-content=\"tab_[query-result:id]\" role=\"tabpanel\"><div class=\"media-gallery-tab\"><div class=\"media-gallery-tab__item media-gallery-tab__item--hero\"><div class=\"media-gallery-tab__carousel owl-carousel\">[esprit:query:NN:[query-result:id]]</div></div>[esprit:query:NN:[query-result:id]]</div></div>",
      "endhtml": "",
      "withoutresult": "",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_achievements_panes",
      "query": "SELECT id FROM featured_tabs WHERE deleted = 0 AND active = '1' AND tab_key = 'achievements' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "",
      "repeathtml": "<div class=\"featured-tabs__content esprit-tab-content\" data-content=\"tab_[query-result:id]\" role=\"tabpanel\"><div class=\"featured-tabs__carousel owl-carousel\">[esprit:query:NN]</div></div>",
      "endhtml": "",
      "withoutresult": "",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_notices",
      "query": "DECLARE @on_category NVARCHAR(100), @archivePage NVARCHAR(256); SET @on_category = (SELECT ISNULL(on_category,'') FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SET @archivePage = (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE pages.id = (SELECT on_page FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]) AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 4 c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE c.contenttype WHEN 2 THEN 'gallery.svg' WHEN 3 THEN 'video-square.svg' ELSE 'gallery.svg' END AS content_type_icon, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_day AS NVARCHAR(2)) ELSE DATENAME(day, c.customdatetime) END AS display_day, CASE WHEN '[system:site-lang]' = 'FA' THEN CASE c.shamsi_month WHEN '1' THEN N'فروردین' WHEN '2' THEN N'اردیبهشت' WHEN '3' THEN N'خرداد' WHEN '4' THEN N'تیر' WHEN '5' THEN N'مرداد' WHEN '6' THEN N'شهریور' WHEN '7' THEN N'مهر' WHEN '8' THEN N'آبان' WHEN '9' THEN N'آذر' WHEN '10' THEN N'دی' WHEN '11' THEN N'بهمن' WHEN '12' THEN N'اسفند' ELSE '' END ELSE DATENAME(month, c.customdatetime) END AS display_month, CASE WHEN '[system:site-lang]' = 'FA' THEN CAST(c.shamsi_year AS NVARCHAR(4)) ELSE DATENAME(year, c.customdatetime) END AS display_year FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND (@on_category = '' OR ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @on_category + ',%') ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<article class=\"featured-tabs__card\"><a class=\"featured-tabs__media\" href=\"/[query-result:archivePage]/[query-result:link]\"><img class=\"featured-tabs__image\" src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"410\" height=\"231\" /><span class=\"featured-tabs__media-badge\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/[query-result:content_type_icon]\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"24\"></span></span></a><h3 class=\"featured-tabs__card-title\"><a href=\"/[query-result:archivePage]/[query-result:link]\">[query-result:title]</a></h3><div class=\"featured-tabs__date\"><time class=\"featured-tabs__date-text\">[query-result:display_day] [query-result:display_month] [query-result:display_year]</time><span class=\"featured-tabs__date-icon\" data-src=\"/uploads/epc/assets/svg/calendar.svg\" data-stroke=\"#475569\" data-stroke-width=\"1.8\" data-size=\"24\"></span></div></article>",
      "endhtml": "",
      "withoutresult": "<article class=\"featured-tabs__card\"><a class=\"featured-tabs__media\" href=\"#\"><img class=\"featured-tabs__image\" src=\"/uploads/epc/assets/images/featured-tabs-01.webp\" alt=\"اطلاعیه\" width=\"410\" height=\"231\" /><span class=\"featured-tabs__media-badge\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/gallery.svg\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"24\"></span></span></a><h3 class=\"featured-tabs__card-title\"><a href=\"#\">برنامه‌ریزی‌های بلند مدت پتروشیمی اصفهان</a></h3><div class=\"featured-tabs__date\"><time class=\"featured-tabs__date-text\">27 آذر 1404</time><span class=\"featured-tabs__date-icon\" data-src=\"/uploads/epc/assets/svg/calendar.svg\" data-stroke=\"#475569\" data-stroke-width=\"1.8\" data-size=\"24\"></span></div></article>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_tenders",
      "query": "DECLARE @on_category NVARCHAR(100), @archivePage NVARCHAR(256); SET @on_category = (SELECT ISNULL(on_category,'') FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SET @archivePage = (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE pages.id = (SELECT on_page FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]) AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 6 c.mainheadline AS title, ISNULL(c.kicker, '') AS tender_no, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND (@on_category = '' OR ',' + CAST(c.groups AS NVARCHAR) + ',' LIKE '%,' + @on_category + ',%') ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<article class=\"featured-tabs__card\"><a class=\"featured-tabs__media\" href=\"/[query-result:archivePage]/[query-result:link]\"><img class=\"featured-tabs__image\" src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"410\" height=\"231\" /><span class=\"featured-tabs__media-badge\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/gallery.svg\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"24\"></span></span></a><h3 class=\"featured-tabs__card-title\"><a href=\"/[query-result:archivePage]/[query-result:link]\">[query-result:title]</a></h3><div class=\"featured-tabs__date\"><time class=\"featured-tabs__date-text\">شماره مناقصه : [query-result:tender_no]</time><span class=\"featured-tabs__date-icon\" data-src=\"/uploads/epc/assets/svg/directbox-notif.svg\" data-stroke=\"#475569\" data-stroke-width=\"1.8\" data-size=\"24\"></span></div></article>",
      "endhtml": "",
      "withoutresult": "<article class=\"featured-tabs__card\"><a class=\"featured-tabs__media\" href=\"#\"><img class=\"featured-tabs__image\" src=\"/uploads/epc/assets/images/tender-img.jpg\" alt=\"مناقصه\" width=\"410\" height=\"231\" /><span class=\"featured-tabs__media-badge\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/gallery.svg\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"24\"></span></span></a><h3 class=\"featured-tabs__card-title\"><a href=\"#\">فراخوان مناقصه تأمین تجهیزات ایمنی</a></h3><div class=\"featured-tabs__date\"><time class=\"featured-tabs__date-text\">شماره مناقصه : ۴۰۴۵۵</time><span class=\"featured-tabs__date-icon\" data-src=\"/uploads/epc/assets/svg/directbox-notif.svg\" data-stroke=\"#475569\" data-stroke-width=\"1.8\" data-size=\"24\"></span></div></article>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_media_hero",
      "query": "DECLARE @contenttype INT, @archivePage NVARCHAR(256); SET @contenttype = (SELECT contenttype FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SET @archivePage = (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE pages.id = (SELECT on_page FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]) AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 3 c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE c.contenttype WHEN 3 THEN 'video' ELSE 'gallery' END AS icon_modifier, CASE c.contenttype WHEN 3 THEN 'video-square.svg' ELSE 'gallery.svg' END AS media_icon FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND c.contenttype = @contenttype ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<a class=\"media-gallery-tab__carousel-item\" href=\"/[query-result:archivePage]/[query-result:link]\"><img class=\"media-gallery-tab__image\" src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"760\" height=\"472\" /><span class=\"media-gallery-tab__shade\"></span><span class=\"media-gallery-tab__icon media-gallery-tab__icon--[query-result:icon_modifier]\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/[query-result:media_icon]\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"44\"></span></span><span class=\"media-gallery-tab__title\">[query-result:title]</span></a>",
      "endhtml": "",
      "withoutresult": "<a class=\"media-gallery-tab__carousel-item\" href=\"#\"><img class=\"media-gallery-tab__image\" src=\"/uploads/epc/assets/images/media-gallery-hero.jpg\" alt=\"گزارش تصویری\" width=\"760\" height=\"472\" /><span class=\"media-gallery-tab__shade\"></span><span class=\"media-gallery-tab__icon media-gallery-tab__icon--gallery\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/gallery.svg\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"44\"></span></span><span class=\"media-gallery-tab__title\">گزارش تصویری از فعالیت‌ها و خطوط عملیاتی مجتمع پتروشیمی</span></a>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_media_slots",
      "query": "DECLARE @contenttype INT, @archivePage NVARCHAR(256); SET @contenttype = (SELECT contenttype FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]); SET @archivePage = (SELECT dbo.rew(ISNULL(urlrewritetitle,pagetitle)) FROM pages WHERE pages.id = (SELECT on_page FROM featured_tabs WHERE id = [intparameters:0:0] AND deleted = 0 AND siteid = [system:site-id]) AND deleted = 0 AND siteid = [system:site-id]); SELECT TOP 4 c.mainheadline AS title, dbo.rew(c.mainheadline) AS link, @archivePage AS archivePage, CASE WHEN ISNULL(c.picid,'') = '' THEN (SELECT TOP 1 defaultimage FROM setting WHERE siteid = [system:site-id]) ELSE (SELECT filename FROM files WHERE files.id = c.picid) END AS pic, CASE c.contenttype WHEN 3 THEN 'video' ELSE 'gallery' END AS icon_modifier, CASE c.contenttype WHEN 3 THEN 'video-square.svg' ELSE 'gallery.svg' END AS media_icon, CASE ROW_NUMBER() OVER (ORDER BY c.customdatetime DESC) WHEN 1 THEN 'media-gallery-tab__item--side-top' WHEN 2 THEN 'media-gallery-tab__item--side-bottom' WHEN 3 THEN 'media-gallery-tab__item--bottom-start' ELSE 'media-gallery-tab__item--bottom-end' END AS pos_class FROM contents c WHERE c.siteid = [system:site-id] AND c.published = 1 AND c.deleted = 0 AND c.presentinsite = 0 AND ISNULL(c.expiretime, GETDATE()) >= GETDATE() AND ISNULL(c.customdatetime, GETDATE()) <= GETDATE() AND c.contenttype = @contenttype ORDER BY c.customdatetime DESC",
      "starthtml": "",
      "repeathtml": "<a class=\"media-gallery-tab__item [query-result:pos_class]\" href=\"/[query-result:archivePage]/[query-result:link]\"><img class=\"media-gallery-tab__image\" src=\"[query-result:pic]\" alt=\"[query-result:title]\" width=\"500\" height=\"375\" /><span class=\"media-gallery-tab__shade\"></span><span class=\"media-gallery-tab__icon media-gallery-tab__icon--[query-result:icon_modifier]\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/[query-result:media_icon]\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"44\"></span></span><span class=\"media-gallery-tab__title\">[query-result:title]</span></a>",
      "endhtml": "",
      "withoutresult": "<a class=\"media-gallery-tab__item media-gallery-tab__item--side-top\" href=\"#\"><img class=\"media-gallery-tab__image\" src=\"/uploads/epc/assets/images/media-gallery-01.jpg\" alt=\"ویدئو\" width=\"500\" height=\"375\" /><span class=\"media-gallery-tab__shade\"></span><span class=\"media-gallery-tab__icon media-gallery-tab__icon--video\" aria-hidden=\"true\"><span data-src=\"/uploads/epc/assets/svg/video-square.svg\" data-stroke=\"#ffffff\" data-stroke-width=\"1.8\" data-size=\"44\"></span></span><span class=\"media-gallery-tab__title\">ویدئو از واحدهای عملیاتی مجتمع پتروشیمی</span></a>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    },
    {
      "queryname": "featured_achievements",
      "query": "SELECT ISNULL(title, '') AS title, ISNULL(link, '/') AS link, ISNULL(image, '') AS image FROM achievements WHERE deleted = 0 AND active = '1' AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
      "starthtml": "",
      "repeathtml": "<article class=\"featured-tabs__card\"><a class=\"featured-tabs__media\" href=\"/[query-result:link]\"><img class=\"featured-tabs__image\" src=\"[query-result-fileurl:image]\" alt=\"[query-result:title]\" width=\"410\" height=\"231\" /></a><h3 class=\"featured-tabs__card-title\"><a href=\"/[query-result:link]\">[query-result:title]</a></h3></article>",
      "endhtml": "",
      "withoutresult": "<article class=\"featured-tabs__card\"><a class=\"featured-tabs__media\" href=\"#\"><img class=\"featured-tabs__image\" src=\"/uploads/epc/assets/images/achievements-01.jpg\" alt=\"افتخار\" width=\"410\" height=\"231\" /></a><h3 class=\"featured-tabs__card-title\"><a href=\"#\">گواهینامه تأیید صلاحیت آزمایشگاه سال ۹۳</a></h3></article>",
      "deleted": 0,
      "global": 0,
      "useinsite": 1
    }
  ]
}
```

The section skeleton (static template) renders the topbar with the headers query
and the four fixed pane wrappers, each embedding its own pane query (the media
pane embeds the hero and slots queries). Replace each `NN` with the real query id
after import:

```html
<section id="site-featured" class="featured-tabs" aria-label="اطلاعیه‌ها و محتوای منتخب">
  <div class="container"><div class="row"><div class="col-12">
    <div class="featured-tabs__layout esprit-tab-container">
      <div class="featured-tabs__topbar">
        [esprit:query:NN]   <!-- featured_tab_headers -->
        <div class="featured-tabs__actions"><!-- archive link + owl prev/next/dots: JS chrome, static --></div>
      </div>
      <div class="featured-tabs__contents esprit-tab-contents">
        [esprit:query:NN]   <!-- featured_news_panes (one pane per news tab; embeds featured_notices by id) -->
        [esprit:query:NN]   <!-- featured_tenders_panes (embeds featured_tenders by id) -->
        [esprit:query:NN]   <!-- featured_media_panes (embeds featured_media_hero + featured_media_slots by id) -->
        [esprit:query:NN]   <!-- featured_achievements_panes (embeds featured_achievements) -->
      </div>
    </div>
  </div></div></div>
</section>
```

---

## More patterns in this page (to fill in together)

The same source page has good candidates for additional examples, each
exercising a rule not yet shown above:

- **گزارش‌های ویدئویی / تصویری** (media lists) — contents filtered by
  `contenttype` (video vs gallery); good for the `content_type_icon` and
  type-filter variants.
- **سامانه‌ها dropdown in the header** vs the systems grid — same data, two
  render blocks; illustrates "split independent DOM blocks into independent
  queries" while sharing one table.
- **language switcher** (the header `EN` link) — the language-list rule from
  `html-analysis.md` (model as a list table even with one visible item).

Add these as the project needs them; keep each example focused on the one
decision it demonstrates.

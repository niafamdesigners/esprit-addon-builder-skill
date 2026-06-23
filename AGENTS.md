# راهنمای عامل‌ها برای این مخزن

## مأموریت

این مخزن یک پروژه محلی skill/knowledge محور برای تبدیل HTML به افزونه Esprit Portal / Esprit CMS است. ورودی رایج، فایل‌هایی مثل `index-to-convert.html` هستند و خروجی اصلی باید JSON استاندارد افزونه باشد.

UI قدیمی `addon-builder/` حذف‌شدنی/حذف‌شده است و نباید دوباره به عنوان مسیر اصلی توسعه برگردد. مسیر اصلی کار از این به بعد skill محلی زیر است:

```text
skills/esprit-addon-builder/
```

## ساختار اصلی

- `skills/esprit-addon-builder/SKILL.md`: workflow اصلی تبدیل HTML به افزونه
- `skills/esprit-addon-builder/references/`: قواعد، قرارداد خروجی و دانش تخصصی
- `skills/esprit-addon-builder/scripts/analyze_html.py`: تحلیل سبک HTML بدون وابستگی به مرورگر
- `skills/esprit-addon-builder/references/original-js/`: نسخه‌های محافظتی از سه فایل مهم UI قدیمی
- `آموزش-افزونه-سازی/`: آموزش فارسی مرحله‌ای، تا زمانی که به skill/reference تبدیل نشده حذف نشود

## فایل‌های محافظت‌شده از UI قدیمی

قبل از حذف `addon-builder/` سه فایل زیر بررسی و در skill package نگه‌داری شده‌اند:

- `skills/esprit-addon-builder/references/original-js/addon-knowledge.js`
- `skills/esprit-addon-builder/references/original-js/addon-skill.js`
- `skills/esprit-addon-builder/references/original-js/structure-analyzer.js`

برای استفاده روزمره، اول referenceهای خلاصه‌شده را بخوان:

- `references/addon-rules.md`
- `references/html-analysis.md`
- `references/news-contents.md`
- `references/output-contract.md`
- `references/esprit-portal.md`
- `references/sql-security.md`
- `references/source-review.md`

فایل‌های `original-js` فقط برای audit، بازیابی قواعد تاریخی، یا بررسی اختلاف رفتار استفاده شوند.

## جریان کار استاندارد

1. HTML ورودی را بخوان، معمولا `index-to-convert.html`.
2. در صورت نیاز تحلیل اولیه بگیر:

```bash
python skills/esprit-addon-builder/scripts/analyze_html.py index-to-convert.html
```

3. فقط referenceهای لازم را از `skills/esprit-addon-builder/references/` بخوان.
4. ابتدا JSON افزونه تولید کن.
5. SQL فقط وقتی تولید شود که کاربر export/setup بخواهد.
6. consistency بین table، field، query، alias و HTML placeholder را بررسی کن.

## قواعد خروجی

- خروجی اصلی AI برای ساخت افزونه باید JSON معتبر باشد.
- JSON نباید markdown fence، توضیح اضافه یا comment داشته باشد.
- `tablename`، `fieldname` و `queryname` باید انگلیسی و `lowercase_underscore` باشند.
- `friendlyname` و `userfriendlyname` باید فارسی باشند.
- mapping فقط با syntax Esprit مجاز است:
  - `[query-result:fieldname]`
  - `[query-result-fileurl:fieldname]`
- از `{fieldname}` و `{{fieldname}}` استفاده نکن.

## قواعد مهم افزونه‌سازی

- لینک‌ها، ایمیل و تلفن با `fieldtype = textinput` ساخته شوند.
- لینک‌ها `length = 1024` داشته باشند.
- برای لینک editable فیلد `target` از نوع `selectbox` اضافه شود، مگر target در HTML ثابت و عمدی باشد.
- تصویرها با `fieldtype = file` ساخته شوند، نه `image`.
- برای تصویرها، اگر `width` و `height` در HTML هست، `filewidth` و `fileheight` را ثبت کن.
- برای `alt` تصویر، اگر جدول title/name دارد فیلد جدا نساز و از همان title/name استفاده کن.
- `ordlist` فقط برای جدول‌های تکرارشونده و قابل مرتب‌سازی ساخته شود.
- `textarea` بلند در SQL metadata با `length = 0` ثبت شود و در جدول فیزیکی `nvarchar(max)` باشد.

## قواعد محتوا و خبر

اگر HTML شبیه خبر، مقاله، بلاگ، اطلاعیه، آرشیو، گزارش تصویری یا گزارش ویدیویی است:

- قبل از ساخت جدول سفارشی، معماری `contents` محور را بررسی کن.
- آیتم‌های تکرارشونده خبر معمولا نباید رکورد جدول custom باشند.
- جدول افزونه معمولا settings widget را نگه می‌دارد.
- query باید از `contents`، `contentgroups`، `files`، `pages` یا `setting` استفاده کند.
- فیلدهای تنظیماتی رایج: `title`، `on_category`، `on_page`، `arch_title`، `item_count`، `on_position`.

## قواعد query و SQL

- queryها ترجیحا فقط `SELECT` باشند.
- از `deleted = 0` و `siteid = [system:site-id]` استفاده کن.
- وقتی `ordlist` وجود دارد، `ORDER BY CAST(ordlist AS INT) ASC` مناسب است.
- در queryهای target از `ISNULL(target,'_self') AS target` استفاده کن.
- در export SQL مقدار `addons_queries.connectionid` همیشه `0` باشد.
- export SQL باید transaction، rollback و `@creatorid = 1` داشته باشد.

## حذف و پاک‌سازی مستندات

هیچ مستند تاریخی را بدون تصمیم صریح حذف نکن. برای حذف، اول بررسی کن آیا محتوای آن در skill package منتقل شده است یا نه.

کاندیدهای بررسی برای حذف مرحله بعد:

- مستندات وضعیت، progress، update و bugfix
- فایل‌های تست قدیمی
- نمونه‌های duplicate
- مستندات UI یا setup ابزارهای حذف‌شده
- assetهای وابسته به UI قدیمی

## سبک نگارش

- توضیحات و مستندات آموزشی را فارسی روان بنویس.
- شناسه‌های کد، JSON، SQL و مسیر فایل‌ها را انگلیسی نگه دار.
- تغییرات را کوچک، قابل ردیابی و مرتبط با تبدیل پروژه به skill package نگه دار.

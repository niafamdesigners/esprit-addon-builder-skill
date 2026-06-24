# Esprit Addon Builder — اسکیل تبدیل HTML به افزونه

این مخزن یک **اسکیل (skill) دانش‌محور** برای Claude / Codex است که فایل‌های خام
HTML را به **تعریف افزونه‌ی Esprit Portal / Esprit CMS** تبدیل می‌کند؛ یعنی خروجی
استاندارد **JSON افزونه** (و در صورت نیاز، SQL خروجی بازبینی‌شده).

این یک برنامه‌ی اجراشدنی نیست؛ «محصول» همان پوشه‌ی اسکیل است:

```text
skills/esprit-addon-builder/
```

---

## این اسکیل چیست؟

به‌جای ساختن دستیِ جدول‌ها، فیلدها و کوئری‌های یک افزونه‌ی Esprit از روی یک طرح
HTML، این HTML را به Claude می‌دهید و اسکیل با استفاده از قواعد تقطیرشده‌ی Esprit:

- ساختار HTML را تحلیل می‌کند (الگوهای تکراری، فیلدهای ثابت در برابر تکرارشونده،
  والد/فرزند)،
- جدول‌ها، فیلدها و کوئری‌های افزونه را استنتاج می‌کند،
- و خروجی را به‌صورت **JSON معتبر افزونه** تولید می‌کند که قابل import است.

اسکیل از الگوی **progressive disclosure** استفاده می‌کند: ابتدا `SKILL.md`، و سپس
فقط آن referenceهایی که هر کار لازم دارد خوانده می‌شوند.

## چه کاربردهایی دارد؟

نمونه‌هایی از بلوک‌هایی که این اسکیل می‌سازد (همه در `references/examples.md` با
ورودی/تحلیل/خروجی کامل آمده‌اند):

- ویجت‌های خبری/محتوایی که از جداول مرکزی `contents` خوانده می‌شوند (کارت، لیست،
  اسلایدر، اطلاعیه، گزارش تصویری/ویدئویی).
- جدول‌های لیست سفارشی (مثل «سامانه‌ها»، «افتخارات») با `active` و `ordlist`.
- لیست‌های مبتنی بر دسته با سلکتور DB-bound به `contentgroups`/`pages`.
- هدر/فوتر، ستون‌های لینک فوتر، اطلاعات تماس و شمارنده‌های بازدید.
- **ویجت‌های تب‌دار** — همگن، مبتنی بر `contenttype`، و حالت پیشرفته‌ی
  **تب‌های ناهمگنِ قابل‌گسترش** که با افزودن یک ردیف، تب جدید اضافه می‌شود.
- گالری چندرسانه‌ای، اسلایدر محصولات، و موارد مشابه.

## چطور کار می‌کند (گردش کار)

1. HTML ورودی خوانده می‌شود (معمولاً `index-to-convert.html` یا یک بخش نام‌دار).
2. یک گذر ساختاری اولیه به‌صورت دستی روی HTML انجام می‌شود (بدون اسکریپت کمکی).
3. فقط referenceهای لازم از `references/` خوانده می‌شوند.
4. ابتدا **JSON افزونه** تولید می‌شود.
5. SQL فقط در صورت درخواست export/setup تولید می‌شود.
6. سازگاری جدول‌ها، فیلدها، aliasهای کوئری و placeholderهای HTML بررسی می‌شود.

در نقاط واقعاً مبهم (مثلاً «این بلوک محتوای ادیتوریال است یا جدول سفارشی؟» یا
«نوع هر تب چیست؟») اسکیل به‌جای حدس، **از کاربر سؤال می‌پرسد**.

## ساختار مخزن

```text
skills/esprit-addon-builder/
├── SKILL.md                      # نقطه ورود: workflow و قواعد خروجی
├── agents/openai.yaml            # متادیتای رابط
└── references/
    ├── addon-rules.md            # نام‌گذاری، انواع فیلد، لینک، تصویر، قواعد کوئری، الگوهای تب/پارامتر
    ├── html-analysis.md          # تحلیل ساختاری دستی
    ├── news-contents.md          # ویجت‌های مبتنی بر contents
    ├── output-contract.md        # شکل دقیق JSON خروجی + چک‌لیست
    ├── esprit-portal.md          # شورت‌کدهای پورتال و ترجمه‌ها
    ├── sql-security.md           # امنیت SQL/export
    ├── examples.md               # ۱۰ نمونه‌ی کامل ورودی→خروجی
    ├── source-review.md          # آنچه از UI حذف‌شده نگه داشته شد
    └── original-js/              # سه فایل UI قدیمی، فقط برای آرشیو
آموزش-افزونه-سازی/                # آموزش فارسی مرحله‌ای
AGENTS.md                          # راهنمای کامل قواعد (انگلیسی)
CLAUDE.md                          # راهنمای Claude Code
```

## چطور در Claude استفاده کنیم

اسکیل از طریق **توضیح (description) در frontmatter فایل `SKILL.md`** فعال می‌شود؛
وقتی درخواست کاربر با آن توضیح هم‌خوانی داشته باشد (تبدیل HTML/markup به افزونه‌ی
Esprit)، اسکیل فراخوانی می‌شود.

### در Claude Code

1. پوشه‌ی اسکیل را در مسیر اسکیل‌های Claude Code قرار دهید (مثلاً داخل
   `.claude/skills/` پروژه یا یک plugin):

   ```text
   .claude/skills/esprit-addon-builder/
   ```

2. فایل HTML طرح را در پروژه داشته باشید (مثلاً `index-to-convert.html`).
3. از Claude بخواهید تبدیل را انجام دهد، مثلاً:

   > فایل `index-to-convert.html` را با اسکیل Esprit Addon Builder به JSON افزونه تبدیل کن.

4. Claude ابتدا ساختار را تحلیل می‌کند، در صورت ابهام سؤال می‌پرسد، و سپس
   **JSON افزونه** را تولید می‌کند. اگر export خواستید، SQL هم می‌دهد.

### در محیط‌های دیگر (Claude.ai / SDK)

اگر از سیستم اسکیل بومی استفاده نمی‌کنید، می‌توانید `SKILL.md` و referenceهای لازم
را به‌عنوان context به مدل بدهید و همان درخواست بالا را مطرح کنید؛ خروجی همان JSON
افزونه خواهد بود.

## شکل خروجی (خلاصه)

- خروجی **JSON خام** و مطابق `references/output-contract.md` است؛ بدون code fence
  یا توضیح اضافه.
- `tablename`/`fieldname`/`queryname` انگلیسیِ `lowercase_underscore`؛
  `friendlyname`/`userfriendlyname` فارسی.
- فقط نحو placeholder خود Esprit: `[query-result:field]` و
  `[query-result-fileurl:field]`.
- هر کوئری یک `withoutresult` دارد (HTML ایستای اولیه که هنگام نبودِ رکورد نمایش
  داده می‌شود).

برای جزئیات کامل قواعد، `AGENTS.md` و فایل‌های `references/` را ببینید.

## اعتبارسنجی نمونه‌ها

بلوک‌های JSON داخل `examples.md` باید معتبر بمانند و code fenceها متوازن باشند:

```bash
cd skills/esprit-addon-builder/references && python - <<'PY'
import re, json
txt = open('examples.md', encoding='utf-8').read()
assert txt.count('```') % 2 == 0, "unbalanced code fences"
blocks = re.findall(r'```json\n(.*?)\n```', txt, re.S)
for b in blocks: json.loads(b)
print(f"{len(blocks)} JSON blocks OK")
PY
```

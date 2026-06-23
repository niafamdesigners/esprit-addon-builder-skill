# بخش ۵ — قالب نمایش HTML

## مقدمه

وقتی داده‌ها از پایگاه داده خوانده می‌شوند، باید **شکل نمایش** آن‌ها در سایت تعریف شود. این کار با سه بخش HTML انجام می‌شود.

---

## سه بخش قالب نمایش

| بخش | نام | توضیح |
|-----|-----|-------|
| `starthtml` | شروع | HTML قبل از لیست — یک‌بار نوشته می‌شود |
| `repeathtml` | تکرار | HTML برای هر آیتم — به‌تعداد رکوردها تکرار می‌شود |
| `endhtml` | پایان | HTML بعد از لیست — یک‌بار نوشته می‌شود |

### تصویرسازی ساده:

```
starthtml:  <div class="container">
               ↓
repeathtml:    <div class="item">عنوان ۱</div>   ← رکورد اول
               <div class="item">عنوان ۲</div>   ← رکورد دوم
               <div class="item">عنوان ۳</div>   ← رکورد سوم
               ↓
endhtml:    </div>
```

---

## الگوهای جایگزینی — نحوه نمایش داده

برای نمایش مقدار یک فیلد در HTML از این الگوها استفاده کنید:

### الگو ۱: فیلدهای متنی معمولی
```
[query-result:fieldname]
```

**مثال‌ها:**
```html
<h3>[query-result:title]</h3>
<p>[query-result:description]</p>
<span>[query-result:category]</span>
<a href="[query-result:link_url]">کلیک کنید</a>
```

### الگو ۲: فایل و تصویر (مهم!)
```
[query-result-fileurl:fieldname]
```

**مثال‌ها:**
```html
<img src="[query-result-fileurl:image_url]" alt="[query-result:title]">
<a href="[query-result-fileurl:document_file]">دانلود</a>
```

> **هشدار:** برای تصاویر و فایل‌ها **حتماً** از `query-result-fileurl` استفاده کنید.
> استفاده از `query-result` برای تصاویر نتیجه نمی‌دهد!

### استثنا: مسیر ثابت برای آیکن‌های تکرارشونده

اگر چند آیکن یا تصویر تکرارشونده یک مسیر ثابت مشترک دارند، مسیر ثابت را در HTML نگه دارید و فیلد فقط بخش متغیر را ذخیره کند.

```html
<span data-src="/uploads/epc/dist/assets/svg/[query-result:icon]"></span>
```

در این نمونه مقدار فیلد `icon` فقط چیزی مثل `aparat.svg` یا `telegram.svg` است. این روش برای آیکن‌های ثابت قالب مناسب است، نه برای تصویرهایی که کاربر آزادانه آپلود می‌کند.

---

## الگوهای اشتباه که کار نمی‌کنند

```
❌ {title}
❌ {image_url}
❌ {{fieldname}}
❌ %fieldname%
❌ $fieldname
❌ [query-result:image_url]  ← برای تصاویر اشتباه است
❌ [query-result-file:image_url]  ← سینتکس غلط
```

---

## قالب‌های آماده برای انواع رایج

### قالب ۱: لیست ساده (کارت)

```html
<!-- starthtml -->
<div class="container-fluid">
  <div class="row">

<!-- repeathtml -->
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">[query-result:title]</h5>
          <p class="card-text">[query-result:description]</p>
          <a href="[query-result:link_url]" class="btn btn-primary" target="[query-result:target]">
            مشاهده
          </a>
        </div>
      </div>
    </div>

<!-- endhtml -->
  </div>
</div>
```

---

### قالب ۲: لیست با تصویر

```html
<!-- starthtml -->
<div class="container">
  <div class="row">

<!-- repeathtml -->
    <div class="col-md-4 mb-4">
      <div class="card">
        <img src="[query-result-fileurl:image_url]" 
             class="card-img-top" 
             alt="[query-result:title]">
        <div class="card-body">
          <h5 class="card-title">[query-result:title]</h5>
          <p class="card-text">[query-result:description]</p>
        </div>
      </div>
    </div>

<!-- endhtml -->
  </div>
</div>
```

---

### قالب ۳: جدول HTML

```html
<!-- starthtml -->
<table class="table table-striped">
  <thead>
    <tr>
      <th>عنوان</th>
      <th>توضیح</th>
      <th>لینک</th>
    </tr>
  </thead>
  <tbody>

<!-- repeathtml -->
    <tr>
      <td>[query-result:title]</td>
      <td>[query-result:description]</td>
      <td>
        <a href="[query-result:link_url]" target="[query-result:target]">
          باز کردن
        </a>
      </td>
    </tr>

<!-- endhtml -->
  </tbody>
</table>
```

---

### قالب ۴: لیست لینک‌ها (مخصوص افزونه پیوندها)

```html
<!-- starthtml -->
<div class="links-section">
  <div class="row">

<!-- repeathtml -->
    <div class="col-md-6 col-lg-4 mb-3">
      <div class="link-card border rounded p-3 h-100">
        <div class="d-flex align-items-start">
          <div class="flex-grow-1">
            <h5 class="mb-1">
              <a href="[query-result:link_url]" 
                 target="[query-result:target]" 
                 class="text-decoration-none">
                [query-result:title]
              </a>
            </h5>
            <p class="text-muted small mb-1">[query-result:description]</p>
            <span class="badge bg-secondary">[query-result:category]</span>
          </div>
        </div>
      </div>
    </div>

<!-- endhtml -->
  </div>
</div>
```

---

### قالب ۵: کارت تیم

```html
<!-- starthtml -->
<div class="team-section">
  <div class="row justify-content-center">

<!-- repeathtml -->
    <div class="col-md-3 mb-4 text-center">
      <div class="team-card">
        <img src="[query-result-fileurl:photo]" 
             class="rounded-circle mb-3" 
             width="120" height="120"
             alt="[query-result:name]">
        <h5>[query-result:name]</h5>
        <p class="text-muted">[query-result:position]</p>
        <p class="small">[query-result:bio]</p>
        <div class="contact-links">
          <a href="mailto:[query-result:email]" class="btn btn-sm btn-outline-primary me-1">ایمیل</a>
          <a href="tel:[query-result:phone]" class="btn btn-sm btn-outline-secondary">تلفن</a>
        </div>
      </div>
    </div>

<!-- endhtml -->
  </div>
</div>
```

---

## فیلد `withoutresult` — پیام بدون نتیجه

اگر هیچ رکوردی در پایگاه داده وجود نداشته باشد، این متن نمایش داده می‌شود:

```
"در حال حاضر محتوایی موجود نیست."
```

---

## ساختار JSON کامل یک کوئری

```json
{
  "queryname": "list_links",
  "query": "SELECT ISNULL(title,'') AS title, ISNULL(description,'') AS description, ISNULL(link_url,'#') AS link_url, ISNULL(category,'') AS category, ISNULL(target,'_self') AS target FROM links WHERE deleted = 0 AND siteid = [system:site-id] ORDER BY CAST(ordlist AS INT) ASC",
  "starthtml": "<div class=\"links-section\"><div class=\"row\">",
  "repeathtml": "<div class=\"col-md-6 col-lg-4 mb-3\"><div class=\"link-card border rounded p-3\"><h5><a href=\"[query-result:link_url]\" target=\"[query-result:target]\">[query-result:title]</a></h5><p class=\"text-muted small\">[query-result:description]</p><span class=\"badge bg-secondary\">[query-result:category]</span></div></div>",
  "endhtml": "</div></div>",
  "withoutresult": "در حال حاضر پیوندی ثبت نشده است."
}
```

> **نکته:** در JSON، کوتیشن‌ها داخل string باید با `\"` نوشته شوند.

---

## چک‌لیست قالب HTML

```
[ ] starthtml یک تگ را باز می‌کند؟
[ ] endhtml همان تگ را می‌بندد؟
[ ] repeathtml برای هر رکورد کامل و مستقل است؟
[ ] تصاویر از [query-result-fileurl:...] استفاده می‌کنند؟
[ ] لینک‌ها از [query-result:link_url] استفاده می‌کنند؟
[ ] نام فیلدها در HTML با نام فیلدها در SQL یکسان است؟
[ ] پیام بدون نتیجه (withoutresult) تعریف شده؟
```

---

**بخش بعدی ←** [پروژه عملی: ساخت افزونه پیوندها](06-پروژه-عملی-افزونه-پیوندها.md)

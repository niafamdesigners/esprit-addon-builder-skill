---
name: esprit-addon-endpoints
description: Use when generating browser-console scripts that create Esprit/EspritPortal addons, addon tables, fields, or queries (or list/relate them, or manage uploaded files) by calling the admin AJAX endpoints. Covers espritajax.ashx actions (saveaddon, save_addon_table, save_addon_fields, save_addon_query), DataTables list endpoints, parent→child relation endpoints, file handlers, the CSRF triple-placement pattern, and the B64: body-encoding convention.
---

# Esprit Addon Endpoints

## Overview

EspritPortal's admin panel builds "addons" (custom modules) made of **addons → tables → fields → queries**. All builder operations are `POST` requests to a single AJAX handler with an `action=` discriminator; file operations use two separate handlers. This skill is a reference for the exact endpoints, request bodies, encoding rules, and response shapes, so an agent can **generate scripts that run in the admin browser console** to perform these operations programmatically.

Source of truth: `espritportal/admin/endpointtester.aspx` (an in-panel tester that issues the real requests). This document is the extracted, code-free reference.

**Core hierarchy & build order (must be respected):**
```
addon (saveaddon → addonid)
  ├── table (save_addon_table, needs addonid → tableid)
  │     └── field (save_addon_fields, needs tableid)
  └── query (save_addon_query, needs addonid)
```

## Environment & Runtime Assumptions

These scripts are meant to run **inside the logged-in admin panel** (e.g. browser DevTools console on an admin page where `scripts.js` is loaded). They depend on two page globals:

| Global | Meaning | Fallback |
|--------|---------|----------|
| `xhrURL` | Base endpoint for the addon builder. Normally `engine/espritajax.ashx` (already includes `?csrf=…`). | If absent, build `engine/espritajax.ashx?csrf=<csrf>` manually. |
| `pageInfo.csrf` | CSRF token for the current session. | Can be overridden manually. |

If `xhrURL` is undefined, `scripts.js` has not loaded → the endpoint is "not available". Session auth travels via cookie, so requests must use `credentials: "include"`.

## Endpoints

| Purpose | Endpoint | Method | Content-Type |
|---------|----------|--------|--------------|
| Addon builder (all `action=…` below) | `engine/espritajax.ashx` (= `xhrURL`) | POST | `application/x-www-form-urlencoded; charset=UTF-8` |
| File manager (mkdir/list/rename/delete) | `engine/FileManagerHandler.ashx` | POST | `application/x-www-form-urlencoded; charset=UTF-8` |
| File upload | `engine/file_upload.ashx` | POST | `multipart/form-data` (browser sets boundary) |
| List endpoints (DataTables) | `engine/espritajax.ashx` | POST | `application/x-www-form-urlencoded; charset=UTF-8` |
| Relation endpoints (parent→child) | `engine/espritajax.ashx` | POST | `application/x-www-form-urlencoded; charset=UTF-8` |

## CSRF Pattern (triple placement)

Every request sends the CSRF token in **all three** locations, matching the project convention:

1. **Query string:** `…?csrf=<urlencoded token>`
2. **Body:** append `&csrf=<urlencoded token>` (only if not already present)
3. **Header:** `X-CSRF-Token: <token>`

For `multipart` uploads, the CSRF also goes into the FormData as a `csrf` field (plus the query string and header).

## B64 Body-Encoding Convention

Persian/free-text values in the body are **not** sent as plain UTF-8. They are encoded as:

```
B64:<base64 of UTF-8 bytes>   →  then percent-encoded for the urlencoded body
```

- Prefix is the literal `B64:`.
- Empty values are still sent as `B64:` (e.g. `description=B64:`).
- Numeric/string config flags (`id`, `addonid`, `direction`, `fieldtype`, …) are sent **plain**, not B64.

UTF-8-safe encode/decode (reference implementation, unchanged from source):

```js
function b64encode(str) {
  var bytes = new TextEncoder().encode(str), bin = "";
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64decode(b64) {
  var bin = atob(b64.replace(/^B64:/, ""));
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
// Body value = "B64:" + b64encode(text); then encodeURIComponent(...) when placed in the body.
```

## Create Endpoints (the four core operations)

All four are `POST` to `xhrURL` with an `action`. On success, `save_addon_fields` and `save_addon_query` return `{"status":"success","id":"…"}`; `saveaddon` and `save_addon_table` return no documented body but their new `id` is needed downstream (read it from the JSON `id` if present).

### 1. Create Addon — `action=saveaddon`

Captured body (decoded values in the right column):

```
action=saveaddon&id=0&addonname=B64:<name>&description=B64:&global=0&useinsite=&showonmenu=0&showcategory=0
```

| Field | Plain/B64 | Example (decoded) | Notes |
|-------|-----------|-------------------|-------|
| `action` | plain | `saveaddon` | |
| `id` | plain | `0` | `0` = create new; existing id = update |
| `addonname` | B64 | `تست اندپ` | addon display name |
| `description` | B64 | (empty) | |
| `global` | plain | `0` | |
| `useinsite` | plain | (empty) | |
| `showonmenu` | plain | `0` | |
| `showcategory` | plain | `0` | |

→ Capture returned `addonid`, inject into table & query bodies.

### 2. Create Table — `action=save_addon_table`

```
tablename=test_endp&action=save_addon_table&id=0&addonid=<addonid>&direction=0&showonlist=0&showoninsite=0&search=0&userfriendlyname=B64:<label>&add_attributes=0&add_shop_fields=0&insert_acc=&insert_acc_groups=&edit_acc=&edit_acc_groups=&delete_acc=&delete_acc_groups=&usersgroup_confirm=&users_confirm=
```

| Field | Plain/B64 | Example | Notes |
|-------|-----------|---------|-------|
| `tablename` | plain | `test_endp` | DB-safe identifier, **sent without the `zes_` prefix** (must be unique) |
| `action` | plain | `save_addon_table` | |
| `id` | plain | `0` | create vs update |
| `addonid` | plain | `509` | **parent addon id** (from step 1) |
| `direction` | plain | `0` | |
| `showonlist` | plain | `0` | |
| `showoninsite` | plain | `0` | |
| `search` | plain | `0` | |
| `userfriendlyname` | B64 | `تست اندپ` | human label |
| `add_attributes` | plain | `0` | |
| `add_shop_fields` | plain | `0` | |
| `insert_acc`, `insert_acc_groups`, `edit_acc`, `edit_acc_groups`, `delete_acc`, `delete_acc_groups`, `usersgroup_confirm`, `users_confirm` | plain | (empty) | access-control fields |

→ Capture returned `tableid`, inject into the fields body. If the create call does not return an id, set `tableid` manually before creating fields.

> **`zes_` prefix:** send `tablename` **bare** (e.g. `petro_news_settings`).
> Esprit creates the physical table as `zes_<tablename>` (e.g.
> `zes_petro_news_settings`). Any SELECT query you generate for this addon must
> therefore read from the prefixed name — `FROM zes_petro_news_settings` — while
> system tables (`contents`, `contentgroups`, `pages`, `files`, `setting`) stay
> bare. So in a build script the SQL references `zes_${tableName}`, not
> `${tableName}`.

### 3. Create Field — `action=save_addon_fields`

```
action=save_addon_fields&staticitems=B64:[]&tableid=<tableid>&id=0&friendlyname=B64:<label>&friendlyname_en=B64:test_field&fieldname=B64:test_field&fieldtype=textinput&subform=&length=B64:128&filewidth=B64:1000&fileheight=B64:700&direction=0&showonlist=0&showoninsite=0&search=0&defaultvalue=B64:&fieldaccess=&add_attributes=0&add_shop_fields=0
```

| Field | Plain/B64 | Example (decoded) | Notes |
|-------|-----------|-------------------|-------|
| `action` | plain | `save_addon_fields` | |
| `staticitems` | B64 | `[]` | JSON array of static options (for select-type fields) |
| `tableid` | plain | `743` | **parent table id** (from step 2) |
| `id` | plain | `0` | create vs update |
| `friendlyname` | B64 | `تست فیلد` | label (FA) |
| `friendlyname_en` | B64 | `test_field` | label (EN) |
| `fieldname` | B64 | `test_field` | DB-safe field identifier (must be unique within table) |
| `fieldtype` | plain | `textinput` | field control type |
| `subform` | plain | (empty) | |
| `length` | B64 | `128` | max length |
| `filewidth` | B64 | `1000` | for file/image fields |
| `fileheight` | B64 | `700` | for file/image fields |
| `direction` | plain | `0` | |
| `showonlist` | plain | `0` | |
| `showoninsite` | plain | `0` | |
| `search` | plain | `0` | |
| `defaultvalue` | B64 | (empty) | |
| `fieldaccess` | plain | (empty) | |
| `add_attributes` | plain | `0` | |
| `add_shop_fields` | plain | `0` | |

Response: `{"status":"success","id":"…"}`. Repeat this call once per field; give each a unique `fieldname`/`friendlyname`.

The captured `textinput` body above is the **minimal** subset. A `selectbox`/
`checkbox` field carries extra option/data-source params (see 3b); they are
accepted (empty) on any field, so a single full-superset body builder works for
every `fieldtype` — fill the relevant group, leave the rest empty.

### 3b. Selectbox / checkbox fields (static options vs DB-bound)

A select-type field (`fieldtype=selectbox` for single choice, `checkbox` for
multi) gets its options one of two ways. The extra params (beyond the textinput
body) are:

| Field | Plain/B64 | Example (decoded) | Notes |
|-------|-----------|-------------------|-------|
| `staticitems` | B64 | `[{"text":"تب جاری","value":"_self"},…]` | **static mode**: JSON array of options. DB mode: `[]`. |
| `textlist` | B64 | (empty) | legacy static option labels; leave empty |
| `valuelist` | B64 | (empty) | legacy static option values; leave empty |
| `db_connectionstring` | plain | `0` | DB connection id (`0` = default) |
| `db_table` | B64 | `pages` | **DB mode**: source table |
| `db_text` | B64 | `pagetitle` | column shown as the option label |
| `db_value` | B64 | `id` | column stored as the option value |
| `db_whereorder` | B64 | `where deleted = 0 and siteid = [system:site-id]` | filter/sort clause appended to the lookup |
| `md_relationfield` | B64 | (empty) | master-detail relation field; empty unless used |
| `md_relationwith` | plain | `0` | master-detail target; `0` = none |
| `md_equal` | plain | `0` | master-detail equality flag; `0` = none |

- **Static options** (e.g. `target`, `ordlist`): set `staticitems` to the JSON
  array, leave every `db_*` empty.
- **DB-bound** (e.g. `on_page`→`pages`, `on_category`→`contentgroups`): set
  `staticitems=[]`, fill `db_table`/`db_text`/`db_value`/`db_whereorder`, and keep
  `db_connectionstring=0`. Use `selectbox` for single-select, `checkbox` for
  multi-select (multi stores a comma-separated list of `db_value`s — match it in
  SQL with the comma-wrapped `LIKE`, not `=`).

Real captured DB-bound `on_page` body (decoded values):

```
action=save_addon_fields  staticitems=[]  tableid=745  id=0
friendlyname=صفحهٔ آرشیو (id)  friendlyname_en=on_page  fieldname=on_page
fieldtype=selectbox  textlist=  valuelist=  db_connectionstring=0
db_table=pages  db_text=pagetitle  db_value=id
db_whereorder=where deleted = 0 and siteid = [system:site-id]
md_relationfield=  md_relationwith=0  md_equal=0
subform=  length=128  filewidth=  fileheight=  direction=0
showonlist=0  showoninsite=0  search=0  defaultvalue=  fieldaccess=
add_attributes=0  add_shop_fields=0
```

### 4. Create Query — `action=save_addon_query`

```
action=save_addon_query&id=0&addonid=<addonid>&wsdlfunction=&act=1&queryname=B64:test query&connectionid=0&query=B64:select 1&weburl=B64:&webrequestheader=B64:&webrequesttype=&webrequestdata=B64:&templatetype=&wsdlurl=B64:http://www.dneonline.com/calculator.asmx?wsdl&wsdl_soapaction=B64:&wsdlusername=B64:&wsdlpassword=B64:&wsdl_contentype=B64:application/soap+xml; charset=utf-8&wsdlsend=B64:&wsdlnode=B64:&email_address=B64:&email_subject=B64:&email_body=B64:&starthtml=B64:<...>&repeathtml=B64:<...>&endhtml=B64:<...>&withoutresult=B64:<...>&errormsg=B64:&queryaccess=0&xhraccess=0&catchdata=1
```

| Field | Plain/B64 | Example (decoded) | Notes |
|-------|-----------|-------------------|-------|
| `action` | plain | `save_addon_query` | |
| `id` | plain | `0` | create vs update |
| `addonid` | plain | `509` | **parent addon id** |
| `wsdlfunction` | plain | (empty) | |
| `act` | plain | `1` | active flag |
| `queryname` | B64 | `test query` | |
| `connectionid` | plain | `0` | DB connection id (`0` = default) |
| `query` | B64 | `select 1` | SQL body |
| `weburl`, `webrequestheader` | B64 | (empty) | web-request data source |
| `webrequesttype`, `templatetype` | plain | (empty) | |
| `webrequestdata` | B64 | (empty) | |
| `wsdlurl` | B64 | `http://www.dneonline.com/calculator.asmx?wsdl` | SOAP source |
| `wsdl_soapaction`, `wsdlusername`, `wsdlpassword` | B64 | (empty) | |
| `wsdl_contentype` | B64 | `application/soap+xml; charset=utf-8` | |
| `wsdlsend`, `wsdlnode` | B64 | (empty) | |
| `email_address`, `email_subject`, `email_body` | B64 | (empty) | email data source |
| `starthtml` | B64 | `کد HTML ابتدای قالب\n` | template header HTML |
| `repeathtml` | B64 | `کد HTML تکرار شونده\n` | per-row HTML |
| `endhtml` | B64 | `کد HTML انتهایی\n` | template footer HTML |
| `withoutresult` | B64 | `کد های اجرا شونده در صورت عدم نتیجه\n` | empty-result HTML |
| `errormsg` | B64 | (empty) | |
| `queryaccess` | plain | `0` | |
| `xhraccess` | plain | `0` | |
| `catchdata` | plain | `1` | |

Response: `{"status":"success","id":"…"}`.

## Auto-Chain (parent id → child body)

After a successful create, take the response `id` and inject it into dependent requests:

| Source create | Response id becomes | Injected into (param) |
|---------------|---------------------|------------------------|
| `saveaddon` | addon id | `save_addon_table` & `save_addon_query` → `addonid` |
| `save_addon_table` | table id | `save_addon_fields` → `tableid` |

So a full build script runs **addon → (table → fields) and (query)** in order, threading ids through.

### Interactive id fallback (older Esprit versions)

Not every EspritPortal build returns a JSON body with `id` from `saveaddon` /
`save_addon_table` — older or not-updated panels create the row but respond with
no usable id. The record **was** created; only the id is missing from the
response. So a generated script must **not** hard-abort when the id is absent.
Instead, resolve the id interactively:

1. Read `resp.id` (or `resp.addonid` / `resp.tableid`) if present → use it.
2. If absent, **`prompt()` the user** for the id of the row just created (they
   can read it from the addon/table list in the panel), then continue the chain
   with the entered value.
3. Only abort if the user cancels/leaves it empty.

Wrap this in one helper (e.g. `resolveId(resp, label, hint)`) reused for both the
addon and the table step. This keeps the script working on panels that don't echo
ids, without changing the request bodies. (Auto-lookup via the `Addonlist` /
`addon_tables_list` list endpoints — newest row matching the just-sent name — is
an optional alternative to prompting; prefer the prompt unless the user asks to
automate it.)

## Name Uniqueness (avoid "duplicate name" errors)

Each run should make names unique. Source strategy:
- **Identifier fields** (`tablename`, `fieldname`) → suffix with `_<unique>` (stays DB-safe). Unique token = `Date.now().toString(36).slice(-5)`.
- **Display-name fields** (`addonname`, `userfriendlyname`, `friendlyname`, `friendlyname_en`, `queryname`) → suffix with ` <unique>` (a space).
- For multi-field creation in one millisecond, also append a per-item index.

### Reacting to the server's duplicate-name error (retry with a counter)

Pre-suffixing is optional; the server also rejects a clash at create time with a
JSON error rather than a new id, e.g.:

```json
{ "status": "error", "msg": "عنوان انتخابی شما قبلا استفاده شده است" }
```

When this happens **nothing is created**, so there is no id to prompt for —
retrying with a different name is the only way forward. A generated script should
detect this response and **retry the same create with an incrementing numeric
suffix** until it succeeds: identifier names get `_2`, `_3`, … and display names
get ` 2`, ` 3`, …. Tell the user the addon/table/query was created under the
bumped name so they can rename it later in the panel.

- Detect with a small predicate, e.g. `status === "error"` **and** the msg
  matches the duplicate phrase (`/قبلا استفاده شده/`).
- Wrap each named create in a `createUnique(label, build)` loop where `build(n)`
  rebuilds the body with the n-th suffix (`n === 1` = no suffix). Cap the attempts
  (e.g. 50) to avoid an infinite loop.
- If a create returns a **non-duplicate** `status:"error"`, do **not** prompt for
  an id — abort and surface the message; creation genuinely failed.
- When a parent (e.g. the table) is bumped, the child SQL/body must reference the
  **final** name actually used — capture it after the retry, then build the query
  SQL with that name.

## List Endpoints (DataTables server-side)

Read lists from `xhrURL` using the standard DataTables server-side protocol (`draw`, `columns[i][…]`, `order[0][…]`, `start`, `length`, `search[value]`).

| Action | Returns | Column layout (data array) |
|--------|---------|----------------------------|
| `Addonlist` | addons | `[id, B64name, B64date, B64type]` |
| `addon_tables_list` | tables | `[tableid, B64fname, B64tablename, addonid, B64date, …]` |

Response shape:
```json
{ "draw": 1, "recordsTotal": N, "recordsFiltered": N, "access": "...", "data": [[...], ...] }
```
Text cells in `data` are B64-encoded — decode with `b64decode`.

Extra body params (alongside the DataTables fields): `action=<…>&startdate=&enddate=&date_field=createtime`.

**Fetch-all (two-step)** pattern for dropdowns:
1. Send with `length=1`, read `recordsTotal`.
2. Send again with `length=<recordsTotal>` to pull every row.
(Only the top-level `length=` is changed — not the `columns[i]` indices.)

**"All tables of one addon":** there is no dedicated endpoint — fetch the tables list and filter client-side on the `addonid` column. **"All fields of one table":** no endpoint exists (needs dev team).

## Relation Endpoints (parent → child, by id)

| Action | Body | Returns |
|--------|------|---------|
| `page_load_query` | `action=page_load_query&id=<addonid>` | queries belonging to that addon |
| `load_table_field` | `action=load_table_field&id=<fieldid>` | one field by its own id |

## File Endpoints

`FileManagerHandler.ashx` distinguishes operations by **which params are present** (no `action` discriminator). Paths are Windows-style with backslashes. These are not part of "run all"; run individually.

| Operation | Endpoint | Body | Expected response |
|-----------|----------|------|-------------------|
| Make folder | `FileManagerHandler.ashx` | `dir=\uploads&fname=<folder>` | `{"status":"success"}` |
| List folder | `FileManagerHandler.ashx` | `dir=\uploads\<folder>` | `[]` (array) |
| Upload file | `file_upload.ashx` | multipart (see below) | `{"success":true}` |
| Rename file | `FileManagerHandler.ashx` | `dir=\uploads\<folder>&oldname=<old>&rename=<new>` | `{"success":true}` (likely) |
| Delete file | `FileManagerHandler.ashx` | `dir=\uploads\<folder>&del=\<file>` | `{"status":"success"}` or `{"success":true}` |
| Delete folder | `FileManagerHandler.ashx` | `dir=\uploads&del=\<folder>` | `{"status":"success"}` or `{"success":true}` |

**Upload (Fine Uploader protocol, multipart/form-data):** build a `FormData` with:
- `csrf` (token)
- `qquuid` (a UUID, e.g. `crypto.randomUUID()`)
- `qqfilename` (file name)
- `qqtotalfilesize` (byte size)
- `qqfile` (the File blob, with filename)

Do **not** set `Content-Type` manually — the browser adds the multipart boundary. After a successful upload, the returned filename is what you pass to the delete-file `del=\<file>` param.

## Generating a Console Script

The intended use: an agent produces a self-contained snippet the user pastes into the admin browser console. Build it from the helpers below (these mirror the tester's request core exactly; do not invent new behaviors).

```js
// --- resolve endpoint + csrf from the page (with manual fallback) ---
function getCsrf()  { try { if (pageInfo && pageInfo.csrf) return String(pageInfo.csrf); } catch(e){} return ""; }
function getBase()  { try { if (xhrURL) return xhrURL; } catch(e){} 
                      var c=getCsrf(); return "engine/espritajax.ashx" + (c?"?csrf="+encodeURIComponent(c):""); }

function withCsrfUrl(url){ var c=getCsrf(); if(!c||/[?&]csrf=/.test(url)) return url;
  return url + (url.indexOf("?")<0?"?":"&") + "csrf="+encodeURIComponent(c); }
function withCsrfBody(body){ var c=getCsrf(); if(!c||/(^|&)csrf=/.test(body)) return body;
  return body + (body?"&":"") + "csrf="+encodeURIComponent(c); }

// --- one urlencoded POST (addon builder / list / relation) ---
async function postForm(endpoint, body){
  var c = getCsrf();
  var url = withCsrfUrl(endpoint || getBase());
  var res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: Object.assign(
      { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      c ? { "X-CSRF-Token": c } : {}
    ),
    body: withCsrfBody(body)
  });
  var text = await res.text();
  try { return JSON.parse(text); } catch(e){ return text; }
}

// helper to B64-encode a body value: "B64:" + b64encode(text)

// --- duplicate-name detection + retry-with-counter ---
function isDupErr(r){ return r && typeof r==="object" && r.status==="error" && /قبلا استفاده شده/.test(r.msg||""); }
async function createUnique(label, build /* (n)=>bodyString, n>=1, n===1 means no suffix */){
  for (var n=1; n<=50; n++){
    var r = await postForm(build(n));
    if (!isDupErr(r)) return { resp:r, n:n };
    console.warn("⚠ نام «"+label+"» تکراری بود — تلاش مجدد با پسوند "+(n+1));
  }
  throw new Error("نام تکراری حل نشد: "+label);
}

// --- resolve a parent id; abort on a real error, prompt if id just wasn't echoed ---
function resolveId(resp, label /* "addon" | "table" */, hint){
  if (resp && typeof resp==="object" && resp.status==="error")
    throw new Error(label+" خطا: "+(resp.msg||JSON.stringify(resp)));
  var id = resp && (resp.id || resp[label + "id"]);
  if (id) return String(id);
  console.warn("⚠ "+label+" id در پاسخ نبود (نسخهٔ قدیمی Esprit):", resp);
  var entered = window.prompt(
    "Esprit این id را برنگرداند، اما رکورد ساخته شد.\n"
    + "مقدار "+label+" id را از لیست پنل بخوان و اینجا وارد کن"
    + (hint ? " ("+hint+")" : "") + ":", "");
  if (entered === null || entered.trim() === "")
    throw new Error(label+" id داده نشد — توقف.");
  return entered.trim();
}
```

A full build script then, for each named create, wraps the POST in
`createUnique(label, n => buildBody(n))` so a server-side duplicate-name error
auto-retries with an incrementing suffix; reads the parent id from the returned
`resp` via `resolveId` (which aborts on a real error and prompts when the panel
simply didn't echo an id); captures the **final** suffixed name to thread into
child SQL/bodies; then runs **addon → (table → fields) and (query)** in order.

## Quick Reference

| Action | Endpoint | Needs | Returns |
|--------|----------|-------|---------|
| `saveaddon` | espritajax.ashx | — | new addon id |
| `save_addon_table` | espritajax.ashx | `addonid` | new table id |
| `save_addon_fields` | espritajax.ashx | `tableid` | `{status,id}` |
| `save_addon_query` | espritajax.ashx | `addonid` | `{status,id}` |
| `Addonlist` | espritajax.ashx | DataTables params | `{recordsTotal,data:[[id,B64name,…]]}` |
| `addon_tables_list` | espritajax.ashx | DataTables params | `{recordsTotal,data:[[tableid,…,addonid,…]]}` |
| `page_load_query` | espritajax.ashx | `id=addonid` | queries of addon |
| `load_table_field` | espritajax.ashx | `id=fieldid` | one field |
| mkdir/list/rename/delete | FileManagerHandler.ashx | path params | `{status/success}` |
| upload | file_upload.ashx | multipart qq* | `{success:true}` |

## Common Mistakes

- **Sending Persian as plain UTF-8** instead of `B64:` + base64 → garbled/failed values. Even empty text fields are sent as `B64:`.
- **Forgetting credentials/CSRF** → 401/403. CSRF must be in query, body, and header; cookie via `credentials:"include"`.
- **Wrong build order** → missing `addonid`/`tableid`. Always addon → table → fields, and addon → query.
- **Duplicate names** → rejected. Suffix identifiers with `_<unique>` and labels with ` <unique>`.
- **Manually setting `Content-Type` for uploads** → broken multipart. Let the browser set the boundary.
- **Editing `columns[i]` length** when paginating — only change the top-level `length=`.

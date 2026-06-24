# Agent guide for this repository

## Mission

This is a local, knowledge-driven **skill** repository for converting raw HTML
into **Esprit Portal / Esprit CMS addon definitions**. Typical input is a file
such as `index-to-convert.html` (or a named section block); the primary output
is valid **addon JSON**, with reviewed export SQL only when explicitly requested.

The old browser UI (`addon-builder/`) has been removed and must not return as the
main development path. All work flows through the local skill:

```text
skills/esprit-addon-builder/
```

## Structure

- `skills/esprit-addon-builder/SKILL.md` — the HTML→addon workflow, output
  discipline, and "When To Ask Instead Of Guessing".
- `skills/esprit-addon-builder/references/` — the distilled rules, output
  contract, worked examples, and domain knowledge (read only what a task needs):
  - `addon-rules.md` — naming, field types, links, images, **query rules**, and
    the cross-cutting patterns: Passing Parameters Between Queries, Composing A
    Section From Multiple Queries, Tabbed Widgets (incl. heterogeneous/extensible
    tabs), Header/Footer, Footer Link Lists, Sliders/`ordlist`.
  - `html-analysis.md` — manual structural analysis (repeating patterns,
    parent/child, field guessing).
  - `news-contents.md` — `contents`-based widgets: core decision, settings
    fields, bilingual date rendering, editable section header, content types,
    and the canonical news query template.
  - `output-contract.md` — the exact addon JSON shape + validation checklist.
  - `esprit-portal.md` — Portal shortcodes and translations.
  - `sql-security.md` — SQL/export safety.
  - `examples.md` — 10 end-to-end worked examples (Input → Analysis → Output).
  - `source-review.md` — what was preserved from the removed UI.
  - `original-js/` — audit-only snapshots of three old UI files
    (`addon-knowledge.js`, `addon-skill.js`, `structure-analyzer.js`).
- `skills/esprit-addon-endpoints/SKILL.md` — companion skill: a code-free
  reference for the admin AJAX endpoints (`espritajax.ashx` actions
  `saveaddon`/`save_addon_table`/`save_addon_fields`/`save_addon_query`, list and
  relation endpoints, file handlers), the CSRF triple-placement pattern, and the
  `B64:` body-encoding convention. Used to generate browser-console scripts that
  submit a built addon structure (addon → table → fields, addon → query) from the
  logged-in admin panel. The addon-builder skill designs the structure; this
  skill provides the endpoints and encoding to send it.
- `آموزش-افزونه-سازی/` — step-by-step Persian tutorial; do not delete until its
  content has been migrated into the skill.

There is no build, lint, or runtime. The old heuristic `scripts/analyze_html.py`
has been removed — perform structural analysis directly while reading the HTML,
per `references/html-analysis.md`.

## Preserved old-UI files

Before `addon-builder/` was removed, three files were reviewed and kept under
`references/original-js/`. Use them only for audit, recovering historical rules,
or checking behavioral differences. For everyday work, read the distilled
references first.

## Standard workflow

1. Read the input HTML (often `index-to-convert.html` or a named section).
2. Do a first structural pass by reading the HTML directly (no helper script):
   identify repeating patterns, static vs. repeated fields, and candidate tables.
3. Read only the references the task needs from `references/`.
4. Produce addon JSON first.
5. Generate SQL only when the user asks for export/setup.
6. Verify internal consistency: tables, fields, query aliases, and HTML
   placeholders must all line up.

When a decision is genuinely ambiguous (especially: is a block editorial
`contents` or its own custom table; which category/page a selector maps to;
whether a value is editable vs a fixed constant; the type of each tab), **ask
the user a short, specific question** instead of guessing.

## Output rules

- The primary AI output for addon creation must be **valid JSON**.
- No markdown fences, comments, or extra prose around the JSON.
- `tablename`, `fieldname`, `queryname` are English `lowercase_underscore`.
- `friendlyname` and `userfriendlyname` are Persian.
- Use Esprit placeholder syntax only:
  - `[query-result:fieldname]`
  - `[query-result-fileurl:fieldname]` — works in `repeathtml` only; for an image
    rendered in `starthtml`/`endhtml`, resolve `files.filename` in SQL and bind a
    plain `[query-result:…]`.
- Never use `{fieldname}` or `{{fieldname}}`.
- Every query carries a `withoutresult`: the original static HTML for that block,
  shown when the query returns no rows (verbatim in real output).

## Field & addon rules

- Links, email, and phone use `fieldtype = textinput`; links use `length = 1024`.
- Editable links get a companion `target` selectbox (`friendlyname = "نحوه باز شدن لینک"`,
  default `_self`) unless the target is a fixed, intentional constant in the HTML.
- Start link hrefs with a leading `/` (absolute from site root); external full
  URLs (`https://…`) are bound as-is.
- Images use `fieldtype = file` (never `image`); capture `filewidth`/`fileheight`
  when the source `img` has them; don't add an `alt` field when a `title`/`name`
  exists — bind `alt="[query-result:title]"`.
- A constant image base path (and resize transforms like `/thumbnail/150-150/`)
  stays in the HTML; store/select only the variable filename/path.
- Sortable/repeating list tables get an `active` checkbox (string `'1'`/`'0'`) and
  an `ordlist` selectbox whose `staticitems` are numeric (`text`/`value` both the
  number); when the item count isn't clear from the source, ask the user.
- Universal micro-labels (contact labels like address/phone, header words like
  "today") use `[esprit:translate:keyword]` (English slug) rather than fields —
  report the keys to the user to add under Settings → Language Management. Section
  /box headings stay editable settings fields.
- Every addon table implicitly has `id`, `siteid`, `deleted` — select/filter them;
  never define them as fields.

## Content & news rules

When the HTML resembles news, articles, blogs, announcements, archives, photo or
video reports:

- Prefer the `contents`-based architecture over a custom table; repeated editorial
  items are usually not custom-table records. The addon typically stores widget
  settings only and reads items from `contents`, `contentgroups`, `files`,
  `pages`, or `setting`.
- News widgets use a fixed `SELECT TOP N` (the layout fixes the count); do **not**
  add an `item_count` field.
- A news section's archive page (`on_page`) is effectively required: item links
  are built as `/[archivePage]/[link]`.
- Render dates bilingually via `display_day`/`display_month`/`display_year`
  driven by `[system:site-lang]` (Shamsi on FA, Gregorian otherwise); expose only
  the date parts the markup shows.
- Map `contenttype` for multimedia: `1` news, `2` image, `3` video, `4` audio.

## Query & SQL rules

- Prefer `SELECT` queries; filter with `deleted = 0` and `siteid = [system:site-id]`.
- Guard custom-table columns with `ISNULL(...)` defaults (text `''`, link `'/'`,
  target `'_self'`); guard `SELECT TOP 1` settings fields, e.g.
  `AND ISNULL(slogan_text, N'') != N''`.
- Use `ORDER BY CAST(ordlist AS INT) ASC` where `ordlist` exists.
- Match an id inside comma-separated `groups`/`positions` with
  `',' + col + ',' LIKE '%,' + @id + ',%'`, never plain `=`.
- A query is addressable as `[esprit:query:ID]`; pass parameters with
  `[esprit:query:ID:value]`, received as `[parameters:i:default]` (string) or
  `[intparameters:i:default]` (int). Prefer passing one row `id` and resolving the
  rest in the child query. The `ID` is assigned after import, so generated calls
  carry a placeholder (`NN`) to be wired up.
- Export SQL: wrap in a transaction with rollback, `@creatorid = 1`, and
  `addons_queries.connectionid = 0`. Treat generated SQL as a review artifact.

## Validating examples.md

Keep the fenced JSON blocks valid and code fences balanced:

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

## Documentation cleanup

Do not delete historical docs without an explicit decision; first confirm the
content has been migrated into the skill package. Candidates for later review:
status/progress/update/bugfix docs, old test files, duplicate samples, docs for
removed UI/tools, and assets tied to the old UI.

## Writing style

- Write tutorials/explanations in fluent Persian.
- Keep code identifiers, JSON, SQL, and file paths in English.
- Keep changes small, traceable, and tied to the skill package.

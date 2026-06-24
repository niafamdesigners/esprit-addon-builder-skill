---
name: esprit-addon-builder
description: Convert raw HTML files or UI blocks into Esprit Portal / Esprit CMS addon definitions (addon JSON, and optional reviewed export SQL). Use this skill whenever the user points you at an HTML/markup file or section and wants it turned into an Esprit addon — analyzing structure, inferring addon tables/fields/queries, generating valid addon JSON, designing contents-based news/article/gallery widgets, or producing reviewed SQL export scripts — even if they don't say the word "addon" explicitly.
---

# Esprit Addon Builder

## Workflow

Use this skill to convert an HTML file or UI block into an Esprit CMS addon package without relying on the old browser UI.

1. Read the input HTML, usually `index-to-convert.html` or a named section file.
2. Do a first structural pass by reading the HTML directly and applying the Manual Structural Analysis in `references/html-analysis.md`. There is no helper script.
3. Read only the references needed for the task:
   - `references/addon-rules.md` for field, naming, mapping, and query rules.
   - `references/html-analysis.md` for repeating-pattern and parent/child decisions.
   - `references/news-contents.md` for news, article, announcement, photo/video report, and contents-table widgets.
   - `references/output-contract.md` for the target JSON shape and validation checklist.
   - `references/esprit-portal.md` for Portal shortcodes, statics, templates, and page behavior.
   - `references/sql-security.md` for SQL/export safety rules distilled from the legacy package.
   - `references/examples.md` for worked input-to-output examples; read a matching one before generating to anchor the JSON shape and field/query decisions.
4. Produce addon JSON first. Generate SQL only when the user asks for export/setup or when the workflow explicitly requires it.
5. Validate that tables, fields, query aliases, and HTML placeholders are internally consistent.

## When To Ask Instead Of Guessing

Some decisions change the whole addon and cannot be reliably inferred from HTML
alone. When the evidence is genuinely ambiguous, ask the user a short, specific
question rather than guessing — a wrong call here produces a wrong addon. Ask
when:

- A repeating block could be either editorial `contents` or its own custom table
  (e.g. "products", "services", "projects"). Cues that point to a custom table:
  no per-item detail/archive page, fields with no `contents` equivalent
  (price, code, spec), an editor-managed catalog. Cues that point to `contents`:
  a detail link like `/category/slug`, image + lead + date, an archive page.
  If still unsure, ask.
- A selector maps to an unknown source (which `contentgroups` category, which
  `pages` archive, or a custom lookup).
- It is unclear whether a visible value is editable per record or a fixed design
  constant (e.g. a link target, a section title, a badge).
- The same data appears in two DOM blocks and you must decide one shared table
  vs. separate tables.

Keep questions concrete and offer the most likely option first; proceed with
sensible defaults only for low-stakes details.

## Required Output Discipline

- Output valid JSON for addon generation unless the user explicitly asks for SQL or explanation. The output is usually consumed by an importer that parses it directly, so anything other than raw JSON breaks the import.
- Skip markdown fences around JSON for the same reason — a leading ```` ```json ```` makes the payload fail to parse.
- Keep `tablename`, `fieldname`, and `queryname` in English `lowercase_underscore`; these become physical DB/identifier names, while `friendlyname` and `userfriendlyname` are the Persian labels shown to editors.
- Use Esprit placeholders only: `[query-result:fieldname]` and `[query-result-fileurl:fieldname]`. The render engine substitutes only this syntax; `{fieldname}` or `{{fieldname}}` is printed literally to the page instead of being replaced.
- When the output uses `[esprit:translate:…]` keys (e.g. universal labels like contact fields — see `esprit-portal.md`), list those keywords back to the user at the end so they can add them under Settings → Language Management; unadded keys render blank.

## Local Knowledge Sources

The original browser UI files were reviewed and preserved under `references/original-js/` before removing `addon-builder/`:

- `addon-knowledge.js`: field types, categories, mapping helpers, default field rules.
- `addon-skill.js`: accumulated prompt rules for analysis, addon generation, news widgets, DB-bound fields, and query rules.
- `structure-analyzer.js`: browser-based structural signature algorithm.

Prefer the distilled references first. Read original JS files only when debugging a migrated rule or checking historical behavior.

## Practical Defaults

- Treat image fields as `file`, not `image`.
- Treat links, email, and phone values as `textinput`.
- Add a `target` selectbox for editable link fields unless target is intentionally fixed in HTML.
- Add `ordlist` only for tables whose records are repeating/list-based and user-sortable.
- For news-like widgets, prefer a settings table plus query from `contents`/`contentgroups` instead of custom news item records.
- For header/footer sections, split independent DOM blocks into independent queries even if they read from shared settings.

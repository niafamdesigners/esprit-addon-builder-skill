---
name: esprit-addon-builder
description: Convert raw HTML files or UI blocks into Esprit Portal / Esprit CMS addon definitions. Use when Codex needs to analyze files like index-to-convert.html, infer addon tables/fields/queries, generate valid addon JSON, design contents-based news widgets, or produce reviewed SQL export scripts from addon JSON using local Esprit addon knowledge.
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
4. Produce addon JSON first. Generate SQL only when the user asks for export/setup or when the workflow explicitly requires it.
5. Validate that tables, fields, query aliases, and HTML placeholders are internally consistent.

## Required Output Discipline

- Output valid JSON for addon generation unless the user explicitly asks for SQL or explanation.
- Do not output markdown fences around JSON.
- Keep `tablename`, `fieldname`, and `queryname` in English `lowercase_underscore`.
- Keep `friendlyname` and `userfriendlyname` in Persian.
- Use Esprit placeholders only: `[query-result:fieldname]` and `[query-result-fileurl:fieldname]`.
- Do not use `{fieldname}` or `{{fieldname}}`.

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

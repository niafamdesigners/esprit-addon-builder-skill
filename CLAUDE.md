# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is **not** a runnable application — it is a knowledge/skill repository. It
ships two complementary Claude/Codex skills under `skills/`:

- `esprit-addon-builder/` — turns raw HTML (e.g. `index-to-convert.html`) into
  **Esprit Portal / Esprit CMS addon definitions** (addon JSON, and optional
  reviewed export SQL).
- `esprit-addon-endpoints/` — a code-free reference for the admin AJAX endpoints
  (`espritajax.ashx` actions, CSRF triple-placement, the `B64:` body encoding),
  used to **generate browser-console scripts** that submit that addon structure
  (addons → tables → fields → queries) without visiting the DB server.

They chain: the builder produces the structure, the endpoints skill submits it.
There is no build, lint, or test toolchain; "working in this repo" means editing
the skills' Markdown rules and worked examples.

`AGENTS.md` is the original mission/rules doc (in Persian). It is mostly current
but predates two changes: the heuristic `scripts/analyze_html.py` has been
**removed** (structural analysis is now done by the model directly per
`references/html-analysis.md`), and news widgets no longer use an `item_count`
field. Treat the skill's own `references/` as the source of truth when they
disagree.

## Skill layout & how it's meant to be read

`skills/esprit-addon-builder/` uses progressive disclosure — read top-down, only
what a task needs:

- `SKILL.md` — entry point: the HTML→addon workflow, output discipline, and
  "When To Ask Instead Of Guessing".
- `references/` — the distilled rule set, one concern per file:
  - `addon-rules.md` — naming, field types, links, images, **query rules**, and
    the cross-cutting query patterns: *Passing Parameters Between Queries*,
    *Composing A Section From Multiple Queries*, *Tabbed Widgets* (incl.
    heterogeneous/extensible tabs), Header/Footer, Footer Link Lists.
  - `html-analysis.md` — manual structural analysis (the old script's algorithm
    as review steps) + repeating-pattern / parent-child decisions.
  - `news-contents.md` — the `contents`-based news/widget knowledge: core
    decision, settings fields, bilingual date rendering, editable section header,
    content types, and the canonical news query template.
  - `output-contract.md` — the exact addon JSON shape + validation checklist
    (including `withoutresult`).
  - `esprit-portal.md` — Portal shortcodes (`[esprit:query:…]`, `[esprit:translate:…]`, statics, menus).
  - `sql-security.md` — SQL/export safety.
  - `examples.md` — 10 end-to-end worked examples (Input → Analysis → Output JSON).
  - `source-review.md` — what was kept from the removed browser UI.
  - `original-js/` — audit-only snapshots of the old browser UI (`addon-knowledge.js`,
    `addon-skill.js`, `structure-analyzer.js`); do not treat as runtime.
- `agents/openai.yaml` — interface metadata.

`آموزش-افزونه-سازی/` is a step-by-step Persian tutorial; keep it until its
content has been migrated into the skill.

## Non-obvious conventions that span files

These recur across the rules and examples; getting them wrong breaks generated addons:

- **Output is raw JSON** matching `output-contract.md` — no markdown fences, no
  comments. `tablename`/`fieldname`/`queryname` are English `lowercase_underscore`;
  `friendlyname`/`userfriendlyname` are Persian.
- **Placeholders are Esprit syntax only**: `[query-result:field]` and
  `[query-result-fileurl:field]` (the latter works in `repeathtml` only, never in
  `starthtml`/`endhtml` — resolve a `files.filename` in SQL there). Never `{field}`.
- **Every query carries a `withoutresult`** — the original static HTML shown when
  the query returns no rows (verbatim in real output; abbreviated in examples).
- **contents vs custom table** is the central modelling call: editorial/repeating
  items usually read from `contents`/`contentgroups`/`files`/`pages`; catalog-style
  data (products, achievements, tenders) may need a custom table. When ambiguous,
  **ask the user** (esp. for tabs — always ask each tab's type first).
- **Cross-query composition**: a section can be assembled from multiple queries
  embedded via `[esprit:query:NN]` (and `[esprit:query:NN:[query-result:id]]` to
  pass a row id). `NN` is a placeholder for the query's DB id, wired after import.
  Prefer passing one row `id` and resolving the rest in the child query.
- Every addon table implicitly has `id`, `siteid`, `deleted` — select/filter them,
  never define them as fields.
- **`zes_` prefix**: `tablename` is defined bare, but the physical addon table is
  `zes_<tablename>`. SELECT queries reference custom addon tables as
  `zes_<tablename>` (e.g. `FROM zes_petro_news_settings`); system tables
  (`contents`, `contentgroups`, `pages`, `files`, `setting`) stay bare.

## Validating changes to examples.md

The closest thing to a test: the fenced JSON blocks in `examples.md` must stay
valid and the code fences balanced. After editing, run:

```bash
cd skills/esprit-addon-builder/references && python - <<'PY'
import re, json
txt = open('examples.md', encoding='utf-8').read()
assert txt.count('```') % 2 == 0, "unbalanced code fences"
blocks = re.findall(r'```json\n(.*?)\n```', txt, re.S)
for i, b in enumerate(blocks, 1):
    json.loads(b)  # raises on invalid JSON
print(f"{len(blocks)} JSON blocks OK")
PY
```

When adding a worked example, also verify internally: query aliases match every
`[query-result:…]` placeholder, link/image field rules hold, and a `withoutresult`
is present.

## Git

Remote `origin` is `github.com:niafamdesigners/esprit-addon-builder-skill`. On
Windows, `git add` warns about LF→CRLF — harmless. Persian paths/text appear
escaped in `git` output; `git config core.quotepath false` shows them readably.

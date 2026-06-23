# Source Review Of Removed UI Files

These files were reviewed before deleting `addon-builder/` and preserved in `references/original-js/`.

## `addon-knowledge.js`

Keep the following knowledge:

- valid field types and categories
- field name keyword mapping
- link target field definition
- `ordlist` field definition
- Esprit mapping placeholders
- content/news source hints
- basic query template rules

The distilled version lives in `addon-rules.md` and `news-contents.md`.

## `addon-skill.js`

Keep the following knowledge:

- core addon-building principles
- Phase 1 HTML analysis rules
- Phase 2 addon generation rules
- naming rules
- news/content architecture rules
- contents query rules
- settings-driven widget rules
- DB-bound selector field rules
- optional section and layout variation rules
- field and query rules
- output discipline

The distilled version lives across all reference files and `SKILL.md`.

## `structure-analyzer.js`

Keep the algorithmic idea, not the browser dependency:

- generate structural signatures from tag/class and child shape
- group same signatures as repeating patterns
- extract fields from tags, class/id, `data-field`, text, `href`, and `src`
- separate static fields from repeated item fields
- recommend parent/child only when repetition is clear

The old source depended on `DOMParser`. There is no runtime analyzer; the model performs the Manual Structural Analysis in `html-analysis.md` directly while reading the HTML.

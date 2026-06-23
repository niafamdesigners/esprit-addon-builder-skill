# SQL And Security Notes

This reference preserves useful points extracted from the old addon knowledge package.

## Output Order

- Generate addon JSON first.
- Generate SQL only for export/setup flows.
- Do not make raw SQL the first AI output for normal addon creation.

## Query Rules

- Prefer `SELECT` queries.
- Use `deleted = 0` and `siteid = [system:site-id]` where applicable.
- Use `ORDER BY CAST(ordlist AS INT) ASC` when `ordlist` exists.
- Use `ISNULL(target,'_self') AS target` for editable link targets.
- Use aliases that match HTML placeholders exactly.
- Keep query output fields minimal and tied to the rendered HTML.

## Export SQL Rules

- Wrap inserts in a transaction.
- Roll back on error.
- Keep `@creatorid = 1`.
- Insert `addons_queries.connectionid = 0`.
- Store `textarea` max metadata length as `0`.
- Review export SQL before execution.

## Security Rules

- Do not trust AI output.
- Validate JSON server-side.
- Sanitize values before database insertion.
- Use parameterized queries in the server layer.
- Keep API keys and credentials out of client-side files.
- Treat generated SQL as a review artifact, not automatically executable truth.

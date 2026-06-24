# DevExtreme Patterns in CloverDX Data Manager

Use this reference when a Data Manager customization touches DevExtreme behavior,
especially the editor DataGrid.

## Start With The Supported Surface

For editor-page grid work:

- Use `gridReady(ctx)` when the customization needs the grid instance.
- Access the grid as `ctx.grid`.
- Use `pageRendered(ctx)` only for page-level DOM work around the grid.

Do not use Vue vnode walking, private instance lookup, DOM polling, or similar
hacks to find the grid.

## General Rules

Prefer:

- Supported hooks and existing prepared code.
- Grid APIs for selection, row data, row counts, refresh, options, and events.
- Stable mount points or narrowly inspected DOM only for rendered-markup work.
- `ctx.grid.refresh()` after backend updates instead of patching rendered cells.

Avoid:

- Treating rendered DOM as authoritative grid data.
- Assuming private widget instances are safe to discover or manipulate.
- Assuming DataGrid row keys are backend row ids.
- Building a second state model when the grid or page context already owns the
  state.

## Row Data Shape

Rows returned from `ctx.grid.getSelectedRowsData()` use Data Manager cell
envelopes. Read actual values from `.value`.

```js
const cellValue = (cell) =>
  cell && typeof cell === "object" && "value" in cell ? cell.value : cell;
```

Important consequences:

- The backend row id is `row._id.value`, not `row._id`.
- Row status metadata, when present, is on the `_id` envelope, such as
  `row._id.status`.
- Other columns are also envelopes, so read `cellValue(row[columnName])`.

## Row Keys

Do not assume `ctx.grid.getSelectedRowKeys()` returns backend row ids.

Use row keys for grid-level selection logic. Use selected row data for backend
row operations:

```js
const [row] = ctx.grid.getSelectedRowsData();
const rowId = cellValue(row?._id);
```

## Virtualization

Data Manager grids can virtualize columns and rows.

Column rules:

- `ctx.grid.getVisibleColumns()` returns rendered/visible columns, not
  necessarily every editable column.
- When a customization needs all columns, prefer indexed column access through
  `columnCount()` and `columnOption(index, name)`.

Row rules:

- `ctx.grid.getVisibleRows()` returns rows currently rendered in the viewport,
  not the full dataset.
- Do not use visible-row count as total row count.
- Use `ctx.grid.totalCount()` when the full filtered count is needed.
- Visible-row `rowIndex` can still be useful for position-aware UI.

## Backend Writes

When grid customization writes to Data Manager:

- Verify the private API request shape through `datamanager-internal-api.md` and the live
  OpenAPI.
- Treat grid/store APIs as UI integration helpers, not proof of the server
  contract.
- After a successful backend write, prefer `ctx.grid.refresh()`.
- Do not mutate visible cells directly unless the task is purely visual and does
  not change Data Manager data.

## DOM-Level Grid Work

Use DOM inspection only when the task is about rendered markup that grid APIs do
not cover.

Rendered grid DOM can be misleading:

- Header text can include icon text.
- Boolean cells can render as checkbox widgets.
- Fixed columns can duplicate rows and headers in separate table structures.
- Virtualization means off-screen rows or columns may not exist in the DOM.

## Other DevExtreme Components

For non-grid DevExtreme widgets:

- Prefer the Data Manager customization API and existing code first.
- Prefer stable mount points over brittle DOM reach-in.
- Use live inspection when exact behavior is unclear.
- Do not assume undocumented component instances are safe to manipulate.

# Data Manager Internal Structures

Use this reference when the supported customization contract is not enough and
the implementation needs Data Manager layout facts: page mount contents, sidebar
behavior, editor toolbars, icons, or route paths.

These facts are internal and version-specific. Prefer
`datamanager-customization-api.md` first and verify against the running instance when
precision matters.

## Page Layout Under Mounts

The supported mount points wrap different content on different pages:

```text
transactional.list / reference.list
  header    page title bar + page-level actions
  content   dataset catalog table, not a DevExtreme DataGrid
  sidePanel shared left sidebar

transactional.batches
  header    page title bar
  content   batch list / batch detail panels
  sidePanel shared left sidebar

transactional.editor / reference.editor
  header    page title bar + dataset selector
  content   editor toolbar + DevExtreme editing DataGrid
  sidePanel shared left sidebar

transactional.configuration / reference.configuration
  header    page title bar
  content   configuration form panels
  sidePanel shared left sidebar
```

The important distinction is catalog pages versus editor pages:

- `transactional.list` and `reference.list` show dataset catalogs. They are not
  DevExtreme grids, and `gridReady(ctx)` does not fire there.
- `transactional.editor` and `reference.editor` show dataset rows in a
  DevExtreme DataGrid, and `gridReady(ctx)` receives `ctx.grid`.

## Sidebar

`elements.sidePanel` is the shared left sidebar.

Sidebar labels are tooltip-bound and are not reliable text nodes at rest. A
text-node rewrite is not a robust way to rename sidebar items. Prefer changing
the page header or adding your own clearly labeled sidebar/header action.

There is no public sidebar API. Adding a sidebar item means DOM injection into
`elements.sidePanel`; use an id guard and cleanup to avoid duplicates.

## Editor Toolbars

"Add a toolbar button" can mean different areas:

- `elements.header` — supported page-level mount, good for general custom
  actions.
- `.editor-toolbar` — Vue-rendered editor-level strip, not where row actions
  live.
- `.dx-datagrid-header-panel > .dx-toolbar` — DevExtreme row-action toolbar
  inside the grid.

For row-action semantics, target the DevExtreme header-panel toolbar only after
live inspection confirms the structure. Inject idempotently and prefer cloning
an existing text-mode row-action button for visual parity.

Do not configure the Data Manager grid toolbar with `grid.option("toolbar.items", [...])`.
Data Manager composes row actions through its own DevExtreme setup, and writing
the toolbar option can create a duplicate toolbar.

DevExtreme can rebuild the header-panel toolbar. If injected toolbar UI must
survive those rebuilds, use a narrowly scoped `MutationObserver` on the relevant
toolbar/header-panel container and clean it up with `ctx.registerCleanup`.

## Column Chooser

Data Manager has its own column customizer. Do not assume
`ctx.grid.showColumnChooser()` opens the same UI.

If a customization needs to open the native Data Manager column customizer, inspect the
running toolbar and trigger the existing "Customize columns" button when
available. Use `showColumnChooser()` only as a fallback after accepting the UI
difference.

## Icons

Data Manager uses a bundled `clover-icon icon-<name>` font. The available icon
names are version-specific and live in the bundled stylesheet.

Discover available icons from the running instance:

```bash
grep -oE '\.icon-[a-zA-Z0-9-]+:before' \
  .work/data-manager-style.css | sort -u
```

If the icon name is uncertain, prefer cloning an existing Data Manager button
that already has the correct icon class.

## Route Paths

Routing mode varies by deployment. Some instances use history mode, others use
hash mode:

```text
/<contextPath>/data-manager/dataSets/<code>/editor
/<contextPath>/data-manager#/dataSets/<code>/editor
```

The important path segments are:

```text
dataSets/<code>/editor
dataSets/<code>/batches
referenceDataSets/<code>/editor
```

Do not hardcode hash or history mode. Use `ctx.page.dataSetCode` and
`ctx.page.batchKey` when they provide what you need; otherwise detect the
current mode in the customization before building Data Manager links.

## Browser Tab Title

Data Manager owns `document.title` during navigation. A customization-set title
can be overwritten on the next route change, so do not rely on it as persistent
customization state.

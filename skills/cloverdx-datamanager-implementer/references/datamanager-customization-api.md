# Data Manager Customization API

Use this as the shipped reference for the public CloverDX Data Manager
customization API exposed to `customization/data-manager/app.js`.

The contract below is also expressed as TypeScript definitions in
[`../assets/datamanager-customization.d.ts`](../assets/datamanager-customization.d.ts).

## Customization Object

Register customizations by assigning `window.dmCustomization` before the Data
Manager app initializes:

```js
window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: {},
    reference: {},
  },
};
```

Data Manager reads `window.dmCustomization` during the current page view
lifecycle setup. Later changes to the global object are not tracked by that
existing lifecycle. When testing by pasting `window.dmCustomization` in the
browser console, reload the page or navigate far enough that the target page
view is recreated before expecting the new object to run.

Customization is ignored unless all of these are true:

- Data Manager has loaded the branding customization for the current server
- `window.dmCustomization` exists
- `window.dmCustomization.apiVersion === 1`
- hooks exist for the current module and view

Unsupported or missing API versions are ignored and do not throw.

The Data Manager shell exposes runtime config on
`#clover-data-manager[data-config]`. Inspect that JSON when a customization
needs `contextPath`, permissions, or similar runtime facts.

## Page Map

Register hooks under `pages.<module>.<view>`.

Supported modules and views:

```text
pages
├── transactional
│   ├── list
│   ├── batches
│   ├── editor
│   └── configuration
└── reference
    ├── list
    ├── editor
    └── configuration
```

`reference.batches` is not supported. Register only the pages that need
customization.

## Lifecycle Hooks

Data Manager supports these public hook names:

- `pageRendered(ctx)`
- `gridReady(ctx)`
- `destroy(ctx)`

### `pageRendered(ctx)`

Runs after the Data Manager page has rendered and the required customization
mount points are available.

Behavior:

- Available on all supported pages.
- Requires `root` and `content` mount elements before it fires.
- Runs once per logical ready key.
- On editor pages, route-only changes can trigger `pageRendered` again with new
  `dataSetCode` or `batchKey` values while the same Vue component remains
  mounted.
- Before a repeated `pageRendered` run, cleanup registered by the previous
  `pageRendered` run is executed.

`pageRendered` is not automatically rerun for ordinary internal component
rerenders such as filtering, sorting, search result changes, category expansion,
or configuration subview changes. Customizations that need to survive those
rerenders should use CSS that remains applicable, or register a narrowly scoped
observer and clean it up with `ctx.registerCleanup`.

### `gridReady(ctx)`

Runs when an editor page DevExtreme DataGrid instance is available.

Behavior:

- Available only on `transactional.editor` and `reference.editor`.
- Receives the DataGrid instance as `ctx.grid`.
- Replacing the grid instance does not rerun `gridReady` for the same logical
  page identity.
- If editor route identity changes while the same grid instance remains mounted,
  `gridReady` can run again for the new logical page identity.
- Before a repeated `gridReady` run, cleanup registered by the previous
  `gridReady` run is executed.

Use `gridReady(ctx)` when customization code depends on the DataGrid instance.
Do not assume `ctx.grid` is available in other hooks.

### `destroy(ctx)`

Runs before the current Data Manager page customization is cleaned up.

Behavior:

- Runs at most once for a page customization runtime instance.
- Receives a fresh context when possible, otherwise the last successfully
  created base context.
- After the `destroy` hook runs, all remaining registered cleanup handlers are
  executed.

Use `destroy` for final end-of-page logic that is not already covered by
`ctx.registerCleanup`.

## Hook Context

Every hook receives `ctx`. For exact types, use
[`../assets/datamanager-customization.d.ts`](../assets/datamanager-customization.d.ts).

Important fields:

- `ctx.page` — current module/view plus optional `dataSetCode` and `batchKey`
- `ctx.elements` — nullable stable mount elements: `root`, `sidePanel`,
  `header`, `content`
- `ctx.notifications` — Data Manager notification helpers
- `ctx.registerCleanup(fn)` — registers cleanup for the current hook phase

`gridReady(ctx)` also receives `ctx.grid`.

### `page`

`page` identifies the current logical Data Manager page.

Fields:

- `module`: active module (`transactional` or `reference`)
- `view`: active view (`list`, `batches`, `configuration`, or `editor`)
- `dataSetCode`: active data set code for data set-specific pages, when present
- `batchKey`: active batch key for transactional batch editor pages, when present

`dataSetCode` and `batchKey` are resolved from reactive route values when the
hook context is created. Empty strings are normalized to `undefined`.

### `elements`

`elements` contains live DOM mount points for customization code:

- `root`: root content layout element for the current page
- `sidePanel`: Data Manager sidebar
- `header`: header area of the current page
- `content`: main content area of the current page

Each field can be `null` if the element is not available in the current layout.
Base context creation requires `root`; readiness-dependent hooks also require
`content` before firing.

Mount points are identified with:

```html
data-dm-customization-mount="<key>"
```

Treat other markup as internal and unstable unless live inspection proves a
specific selector is necessary and acceptable.

## Cleanup

`registerCleanup(cleanup)` registers teardown logic owned by the currently
running hook phase.

Use it for:

- DOM nodes inserted by customization code
- event listeners
- timers
- observers
- external subscriptions
- temporary mutations
- any other resources created by a hook

Cleanup lifetime depends on the phase that registered it:

| Registering phase | Cleanup timing |
| --- | --- |
| `pageRendered` | Before the next `pageRendered` run and during final page destroy |
| `gridReady` | Before the next `gridReady` run and during final page destroy |
| `destroy` | During final page destroy after the `destroy` hook returns |

Cleanup handlers are run behind an error boundary. If one cleanup handler fails,
the remaining handlers still run and the cleanup bucket is cleared.

## Error Handling

Hook and cleanup errors are caught by the Data Manager customization runtime and
reported as Data Manager error notifications. A failing customization hook must
not break Data Manager rendering.

Hooks are synchronous from the framework's perspective. Returned promises are
not awaited by the hook runner, so catch asynchronous failures inside the
customization when needed.

## Supported Surface Boundaries

Some things look plausible but are not supported:

- **You cannot register a new SPA route.** There is no "register a page" hook.
  Prefer a modal or overlay launched from an injected header/sidebar action.
- **You cannot add a sidebar item via API.** Add one only by DOM injection into
  `elements.sidePanel`; this is DOM injection, not a public sidebar API.
- **You cannot customize other CloverDX modules** through this Data Manager
  branding contract. The supported implementation surface is Data Manager
  `app.js` and `app.css` only.
- **`messages.json` is not part of Data Manager customization.** The current
  Data Manager customization contract uses `data-manager/app.js` and
  `data-manager/app.css`.

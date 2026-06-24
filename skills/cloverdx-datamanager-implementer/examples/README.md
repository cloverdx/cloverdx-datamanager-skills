# Examples

Runnable excerpts for common Data Manager customizations. Each file is a tight,
self-contained snippet with a one-line "what this does" header and a "why this
shape" footer.

Copy `.js` snippets into `customization/data-manager/app.js`. When an example
has a paired `.css` file, copy that CSS into
`customization/data-manager/app.css`.

They share conventions:

- `dmc-`-namespaced classes and ids.
- Idempotent injection into mount points, because hooks can repeat for a new
  logical page identity.
- `ctx.registerCleanup()` for anything injected.

| File | What |
|---|---|
| `01-rename-page-label.js` | Rename a page-header label |
| `02-header-button.js` | Inject a button into `elements.header` |
| `03-sidebar-item.js` | Inject a sidebar item into `elements.sidePanel` |
| `04-open-modal.js` + `04-open-modal.css` | Open a custom modal |
| `05-grid-header-panel-button.js` | Add a button to the grid header panel by cloning |
| `06-grid-context-menu-item.js` | Add a grid context-menu item |
| `07-private-api-grid-update.js` | Private API row update template |
| `08-row-deeplink.js` | Open an external URL for a grid row |
| `09-permission-gated-content.js` + `09-permission-gated-content.css` | Data set permission-gated action |

These are reference snippets, not a library to import.

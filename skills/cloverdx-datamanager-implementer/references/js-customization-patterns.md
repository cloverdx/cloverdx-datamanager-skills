# JavaScript Customization Patterns

Use this reference when shaping or editing `app.js` for Data Manager customizations.

## Primary Rule

Prefer the supported customization API over global scripts, polling, or reverse-engineered internals.

Start with:

- `datamanager-customization-api.md` for hooks, context, and mount points
- Existing `customization/data-manager/app.js`
- `devextreme-patterns.md` when the change touches DevExtreme behavior

## File Role

`app.js` should contain:

- Hook registration through `window.dmCustomization`
- Dynamic DOM injection
- Event wiring
- Grid behavior
- Cleanup registration

Do not use `app.js` for large static style blocks unless a style must be computed dynamically.

## Syntax And File Shape

Use modern JavaScript by default.

Prefer:

- `const` by default and `let` only when reassignment is required
- Top-level named helpers when small helpers improve readability
- A direct final assignment to `window.dmCustomization`
- Plain object literals for the customization tree

Avoid:

- `var`
- IIFEs
- Wrapping the whole file in namespace bootstrapping ceremony
- Function wrappers used only to hide file-scoped helpers

Preferred shape:

```js
const applySomething = (ctx) => {
  const { header } = ctx.elements;
  if (!header) {
    return;
  }

  header.classList.add("dmc-example");
  ctx.registerCleanup(() => {
    header.classList.remove("dmc-example");
  });
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: {
      editor: {
        pageRendered: applySomething,
      },
    },
  },
};
```

## Hook Selection

Use the narrowest correct hook.

- `pageRendered(ctx)` for page-level DOM work
- `gridReady(ctx)` for editor-grid behavior
- `destroy(ctx)` for final end-of-page logic not already covered by cleanup

For hook availability and exact semantics, follow `datamanager-customization-api.md`.

Prefer:

- Hook-driven logic over global polling
- CSS classes over repeated inline style mutation
- `gridReady()` for DataGrid option changes
- `pageRendered()` for page-specific DOM injection
- `ctx.page.dataSetCode` and `ctx.page.batchKey` when behavior depends on the
  active data set or transactional batch

## Keep Structure Minimal

Prefer direct, readable handlers over abstract scaffolding.

Good defaults:

- Small helper functions only when they remove real duplication
- Constants near the logic that uses them
- One cleanup registration per injected behavior when practical

Avoid:

- Generic wrapper factories without a real need
- Empty lifecycle hooks
- Large utility layers for small customizations
- IIFEs
- Reproducing legacy syntax from older prepared files when the touched code can be modernized safely

## DOM Work

Prefer documented mount points and container elements you create yourself.

Good patterns:

- Create one root node for an injected feature
- Mark injected elements with `data-dm-custom`
- Add namespaced classes such as `dmc-banner` or `dmc-toolbar-note`
- Attach listeners to your own elements when possible

Avoid:

- Binding behavior to unstable internal markup without a clear need
- Querying broad selectors repeatedly when one feature root can be reused
- Using DOM state as the source of truth when context or grid APIs already provide the answer
- Touching unsupported internal Vue or framework state
- Assuming private class names are stable unless live inspection is required

## Idempotent Injection Patterns

`pageRendered(ctx)` can run more than once for a page lifecycle when the logical
page identity changes, for example when an editor route switches to another data
set or batch while the same Vue component remains mounted. Before a repeated
`pageRendered` run, cleanup registered by the previous `pageRendered` run is
executed.

Injection should still be idempotent: it prevents duplicate UI when cleanup is
not needed, when an existing customization already added the same feature, or
when host markup persists across a route-only change.

Practical guards:

- Give injected singleton elements a stable id or `data-dm-custom` marker.
- Check for an existing injected element before appending another one.
- Register cleanup for route-specific UI that depends on `ctx.page.dataSetCode`
  or `ctx.page.batchKey`.
- For text changes, write only when the current value differs from the desired
  value.

For ordinary internal rerenders such as grid sorting or filtering, Data Manager
does not automatically rerun `pageRendered`. Use CSS that remains applicable.
When host markup is rebuilt and CSS is not enough, use a narrowly scoped
MutationObserver, keep the injection idempotent, and clean it up with
`ctx.registerCleanup`.

## Cleanup Pattern

Prefer `ctx.registerCleanup()` over manual teardown tracking.

Register cleanup in the same hook that creates the resource.

Use cleanup for:

- Injected nodes
- Event listeners
- Observers
- Timers
- Temporary mutations
- Dataset-specific bindings

For cleanup semantics and `destroy()` behavior, follow `datamanager-customization-api.md`.

## Event Handling

Keep event wiring explicit and scoped.

Prefer:

- Named handlers when cleanup needs the same function reference
- Delegation only when many dynamic child elements are involved
- Guard clauses over nested control flow

Avoid:

- Global `document` listeners unless page scope truly requires them
- Duplicate listeners on repeated renders
- Silent catch-all behavior that hides broken assumptions

## Permission-Gated Content

Use the right permission source for the scope of the custom UI:

- For global Data Manager shell features, read the shell `data-config`
  `permissions` array. Current global names include `data_sets_all`,
  `data_sets_server_manage`, `data_sets_server_view`, `data_sets_admin`,
  `data_sets_create`, and `data_manager`; parent permissions imply child
  permissions according to the server permission model.
- For actions on a specific data set, use the data set's `callerPermission`
  instead of the shell permission array. Use the values confirmed for the target
  server, such as `reader`, `editor`, `approver`, `admin`, and `none`.

Gate conservatively: require the most specific permission you can confirm and
hide the custom UI when the permission cannot be verified. Keep the helper local
to the customization or use the focused permission-gating example as the
starting point.

## Error Behavior

Errors thrown inside hooks or registered cleanup callbacks are expected to be caught by the application and surfaced as error toasts.

Do not rely on thrown errors to stop the page or short-circuit other hooks. Write defensive customizations that fail in a narrow, contained way.

## Safe Interaction With Existing Code

When existing `app.js` is present:

- Preserve unrelated behavior
- Extend the current structure instead of rewriting by default
- Reuse established helpers if they are already clear and scoped to the file
- Remove old code only when it is clearly replaced or obsolete

## Anti-Patterns

- Polling for elements that a hook already guarantees
- Reaching into framework internals
- Using broad or long-lived MutationObservers when CSS, lifecycle hooks, or a
  narrowly scoped observer would solve the problem
- Writing code against private class names when stable mount points are available
- Building a second state model when the page context or grid already owns the state
- Non-idempotent injection into `header` or `content`, such as appending a
  singleton node with no presence guard.

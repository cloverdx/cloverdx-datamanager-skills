# UI Patterns

Use this reference when a customization adds its own interactive UI: buttons,
forms, modals, overlays, or permission-gated content.

This file is about UI created by the customization. Host layout facts, toolbar
regions, icon discovery, route shapes, and native Data Manager panels belong in
`datamanager-internal-structures.md`. Styling, class naming, and selector scope belong in
`css-customization-patterns.md`.

## Modals And Overlays

Use a body-level modal or overlay when a customization needs custom destination
content such as help, details, a dashboard, or a workflow panel.

Do:

- append the modal/overlay to `document.body`
- keep the host page content intact
- support Esc and backdrop dismissal when practical
- register the returned close/cleanup function with `ctx.registerCleanup`
- keep modal code local to the customization or example that needs it

Do not:

- create a fake SPA page by replacing `elements.content`
- leave body-level overlays alive after route changes or page destroy

For concrete modal code, use `examples/04-open-modal.js` and
`examples/04-open-modal.css`.

## Forms

For custom forms:

- stack labels above controls
- use one shared control class, such as `dmc-form__control`
- keep spacing predictable with flex or grid gaps
- put Cancel/Apply actions in the modal or panel action area
- put the primary action on the right

Use native form controls unless the request requires a richer widget.

## Buttons

Choose the simplest button strategy that fits the surrounding UI:

1. Clone an existing Data Manager button when visual parity with host actions is
   important. Replace label/icon content and attach your own listener; cloned
   event listeners are not copied.
2. Hand-write compatible DevExtreme button classes when cloning is impractical.
   Do not assume a DevExpress global exists on `window`.
3. Use a plain `<button>` inside a fully custom modal or panel you control.

For host toolbar regions and row-action placement, use
`datamanager-internal-structures.md`. For examples, see `examples/02-header-button.js`
for a page header action and `examples/05-grid-header-panel-button.js` for a
grid header-panel action.

## Permission-Gated Content

When injected content depends on permissions, choose the permission level before
building the UI:

- Use shell `data-config.permissions` for global Data Manager feature access.
- Use data set `callerPermission` for UI that acts on the current TDS/RDS data
  set.
- Hide the custom UI when the required permission cannot be verified.
- Keep the permission check near the injected UI so the example remains
  auditable.

Use `examples/09-permission-gated-content.js` as the starting point.

## Native Panel Interactions

Custom overlays can cover native Data Manager panels because the host panel may
render in a lower stacking context.

If a custom UI must trigger a native Data Manager panel:

- close the custom overlay first when the custom UI is only a launcher
- if the overlay must remain open, temporarily lower its z-index while the native
  panel is active
- restore any temporary style changes through `ctx.registerCleanup`
- verify the behavior in the running instance, because host panel stacking can
  differ by Data Manager version

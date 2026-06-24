# Live Inspection Contract

Use live inspection only when the prepared customization files and bundled
references do not provide enough information to implement safely.

Live inspection is a scratch-data activity, not part of the customization
deliverable. Write any fetched files, copied DOM, screenshots, or notes under
`.work/`. Never place inspection artifacts under `customization/`, and never
ship them in the branding ZIP.

## When To Inspect

Inspect a running Data Manager instance only for details that cannot be inferred
safely from the supported customization contract:

- actual page markup or element placement
- current colors, spacing, typography, sizing, icon names, or branding details
- page-specific layout behavior that references do not cover
- rendered DOM structure for an injection target
- private API shape that the bundled references do not cover

Skip live inspection when the existing `app.js`, `app.css`, customization API,
and references are enough.

## Access Contract

Ask for runtime access only when inspection is needed.

Required inputs:

- server, Clover, or Data Manager URL
- username, when authenticated inspection or private API access is needed
- password, when authenticated inspection or private API access is needed

Normalize the provided URL to the Clover root before building inspection URLs.
For example, both of these should resolve to the same root:

- `<clover-root>`
- `<clover-root>/data-manager`

Do not store credentials in repo files. Avoid putting passwords in reusable
scripts or committed commands. If using shell history is a concern, ask the user
for a safer local method before proceeding.

## What To Load

Load the narrowest artifact that answers the current question. Do not dump broad
server state by default.

Common inspection targets:

1. `<clover-root>/data-manager`
   SPA shell HTML. Use a session cookie when the page requires login. This
   confirms branding tags and exposes the runtime `data-config` blob, including
   `contextPath` and permissions.
2. `<clover-root>/api/data-manager/v1/data-manager-openapi.yaml`
   Private Data Manager API. Use only when implementation depends on private API
   details. See [`datamanager-internal-api.md`](./datamanager-internal-api.md).
3. `<clover-root>/resources/webapps/data-manager/js/app.js`
   SPA bundle. Use only when you must grep route paths, class names, i18n keys,
   icon names, or implementation details not covered by references.
4. `<clover-root>/resources/webapps/data-manager/styles/style.css`
   Data Manager styles. Use only when exact default classes, icon-font glyphs,
   colors, or spacing must be matched.
5. Browser-rendered DOM snippets
   Ask the user to paste `document.querySelector("<selector>").outerHTML`, or
   use browser automation when available. The SPA is JavaScript-rendered, so a
   plain HTML fetch cannot reveal most mounted content.

For authentication details, including Basic access versus session-cookie access,
see [`datamanager-internal-api.md`](./datamanager-internal-api.md).

## Scratch Output

Use `.work/` paths that describe the specific artifact, for example:

- `.work/data-manager-shell.html`
- `.work/data-manager-openapi.yaml`
- `.work/data-manager-bundle.app.js`
- `.work/data-manager-style.css`
- `.work/dom-editor-toolbar.html`

Delete or ignore these files freely between sessions. They are evidence for the
current implementation session, not customization source.

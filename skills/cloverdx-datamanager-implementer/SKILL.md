---
name: cloverdx-datamanager-implementer
description: Use when implementing CloverDX Data Manager customization behavior or styling in prepared app.js/app.css files under customization/data-manager, including hooks, DOM additions, CSS, or DevExtreme-related changes.
---

# CloverDX Data Manager Implementer

## Overview

Use this skill to apply a prepared Data Manager customization request inside the customization workspace.

This skill updates `customization/data-manager/app.js` and `customization/data-manager/app.css` based on the requested behavior and styling changes.

## Workflow

1. Read the customization request and treat it as the source of desired functionality, styling, and behavior.
2. Load the prepared `customization/data-manager/app.js` and `customization/data-manager/app.css` files from the current workspace.
3. Read the required references, then load optional references only when the request needs them.
4. Decide whether live inspection is required only after the prepared files and references are insufficient.
5. If runtime inspection or private API access is needed, ask for the server, Clover, or Data Manager URL, plus credentials for authenticated access.
6. Merge the requested customization into the existing files when they exist, or create them from scratch when they do not.
7. Keep `customization/data-manager/app.js` and `customization/data-manager/app.css` as the only implementation source of truth.
8. Return the updated files and a short summary.

## Independence

This skill is intentionally independent.

- Do not invoke other skills.
- Do not assume how the workspace was prepared.
- Do not decide what happens before or after implementation.

Treat the prepared `customization` workspace as the input contract for this skill.

## Decide What To Load

Always read these references first:

- [`references/datamanager-customization-api.md`](./references/datamanager-customization-api.md) for the supported customization contract, lifecycle hooks, and stable mount points
- [`references/deliverable-contract.md`](./references/deliverable-contract.md) for the required output contract

Load the remaining references only when needed for the current request.

- Read [`references/datamanager-internal-api.md`](./references/datamanager-internal-api.md) only when the request depends on private Data Manager server API details.
- Read [`references/devextreme-patterns.md`](./references/devextreme-patterns.md) only when the request touches DevExtreme component behavior.
- Read [`references/js-customization-patterns.md`](./references/js-customization-patterns.md) only when shaping or editing `app.js`.
- Read [`references/css-customization-patterns.md`](./references/css-customization-patterns.md) only when shaping or editing `app.css`.
- Read [`references/datamanager-internal-structures.md`](./references/datamanager-internal-structures.md) only when the request needs Data Manager internal layout details — page mount contents, the sidebar, the editor toolbars, the icon font, or route paths.
- Read [`references/ui-patterns.md`](./references/ui-patterns.md) only when building custom UI such as modals, forms, buttons, overlays, or permission-gated content.
- Read [`references/live-inspection.md`](./references/live-inspection.md) only when runtime inspection is needed to verify live markup, styling, private API shape, or bundle details.
- See the `examples/` directory for runnable `app.js` snippets, and `assets/` for TypeScript defs (`datamanager-customization.d.ts`).

## Ask For Runtime Access

Ask for:

- Server, Clover, or Data Manager URL
- Username, when authenticated inspection or API access is needed
- Password, when authenticated inspection or API access is needed

Only ask for these when runtime inspection or private-API access is actually needed.

If the request can be handled from:

- existing `customization/data-manager/app.js`
- existing `customization/data-manager/app.css`
- the bundled customization contract

then do not ask for runtime access up front.

Normalize the provided server, Clover, or Data Manager URL to the Clover root before runtime inspection.

Use:

- `<clover-root>/data-manager` for UI inspection
- `<clover-root>/api/data-manager/v1/data-manager-openapi.yaml` for private API inspection

## Use Live Inspection Selectively

By default, make UI customizations look and feel like Data Manager already does.

Check the running Data Manager UI when needed to verify:

- actual page markup or element placement
- existing colors, spacing, typography, sizing, or branding
- page-specific layout differences that are not covered by the customization contract
- rendered DOM structure that is not clear from the prepared files
- visual details that should stay consistent with the default Data Manager styling

Skip live inspection when those details are already clear from the prepared files, the supported customization API, and the bundled references.

If the user explicitly asks for a different visual style, follow that request instead of preserving the default Data Manager styling.

If browser automation or live inspection is not available, say so plainly and ask for any missing details needed to implement the request safely. If those details are still unavailable, proceed using the bundled references plus explicit assumptions.

When live inspection is needed, read
[`references/live-inspection.md`](./references/live-inspection.md), fetch only
the narrow artifact needed for the current question, and write scratch outputs
under `.work/`, never under `customization/`.

## Write Safe Outputs

Edit only:

- `customization/data-manager/app.js`
- `customization/data-manager/app.css`

Preserve unrelated files in `customization` when they exist.

Follow `references/datamanager-customization-api.md` and stay within the supported customization surface. If the requested behavior cannot be implemented safely through that contract, explain that clearly and make the smallest safe approximation rather than inventing fragile selectors or unsupported integration points.

Do not create `messages.json` for Data Manager customization; the current
contract uses `data-manager/app.js` and `data-manager/app.css`.

## Keep The Output Minimal

Match code complexity to the request.

- A small styling tweak should produce a small customization file.
- Reuse one handler directly when several pages need the same behavior instead of generating abstract factories.
- Do not wrap everything in defensive abstractions just because a template could.
- Only add comments when they clarify non-obvious behavior.

## Merge Existing Customizations

When existing `customization/data-manager/app.js` or `customization/data-manager/app.css` files are available:

- treat them as the baseline customization state
- preserve unrelated existing behavior and styling
- add only the functionality and styles needed for the current request
- remove code or styles only when they are clearly obsolete, duplicated, or directly replaced by the new request
- prefer targeted edits over full rewrites
- rewrite the whole file only when the existing structure is too broken or inconsistent to update safely

Do not discard existing customizations just because a cleaner rewrite is possible.

## Deliverable

Produce updates to:

- `customization/data-manager/app.js`
- `customization/data-manager/app.css`

Close with a short summary of:

- implemented behavior and styling
- pages or hooks affected
- assumptions made because of missing inspection or unavailable documentation

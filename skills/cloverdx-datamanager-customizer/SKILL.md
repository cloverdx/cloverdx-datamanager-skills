---
name: cloverdx-datamanager-customizer
description: Use when the user wants to customize CloverDX Data Manager, create or modify a Data Manager customization workspace, prepare app.js/app.css under data-manager, iterate on customization changes, package output/customization.zip, or optionally hand off deployment.
---

# CloverDX Data Manager Customizer

## Overview

Use this skill as the user-facing entrypoint for CloverDX Data Manager
customization.

This skill orchestrates the customization run. It owns the conversation state,
the workspace decision, packaging confirmation, and final reporting. Specialized
work stays in the focused skills:

- `zip-manager` for importing or packaging ZIPs
- `cloverdx-datamanager-implementer` for editing Data Manager `app.js` and `app.css`
- `cloverdx-datamanager-deployer` for optional server deployment after packaging

If a focused skill cannot be invoked directly, follow that skill's instructions
manually while preserving the same ownership boundaries.

## Paths

Canonical working files:

- `customization/data-manager/app.js`
- `customization/data-manager/app.css`

Final archive:

- `output/customization.zip`

Required ZIP root layout:

```text
data-manager/...
```

Keep `customization/` after packaging. It is the editable source of truth for
future iterations. Do not offer to delete it. Scratch inspection files belong in
`.work/`, not in `customization/`.

## Workflow

### Prepare Workspace

Choose one starting mode:

- **Start from scratch**: create empty
  `customization/data-manager/app.js` and
  `customization/data-manager/app.css`.
- **Continue existing workspace**: reuse the existing `customization/` files.
- **Import existing ZIP**: use `zip-manager` to unpack the ZIP into
  `customization/`.

If `customization/` already exists, do not overwrite it silently. Ask whether to
continue it, replace it, or import a different ZIP.

### Implement Changes

Use `cloverdx-datamanager-implementer` for behavior and styling changes in the canonical working
files.

Pass only the current customization request and the workspace paths. Keep
implementation work scoped to Data Manager `app.js` and `app.css`.

### Iterate

After each implementation pass, ask whether the user wants more customization
before packaging.

If yes, continue from the same `customization/` workspace and apply the next
request. Do not re-import or reset unless the user explicitly asks.

### Package

Package only after the user explicitly confirms they are done customizing.

Use `zip-manager` to create:

```text
output/customization.zip
```

Require the ZIP root to contain `data-manager/` directly.

### Optional Deploy

Deployment is separate from packaging.

If the user wants the packaged ZIP live on a running server, use `cloverdx-datamanager-deployer`
after `output/customization.zip` exists. Do not deploy without explicit
confirmation.

## Inputs To Gather

Ask only for inputs needed by the current phase:

- customization request
- starting mode: scratch, existing workspace, or existing ZIP
- source ZIP path, only for import mode
- whether an existing `customization/` workspace should be reused when present
- live Data Manager URL and credentials, only when implementation needs runtime
  inspection
- deployment context, only when the user asks to deploy

Do not ask deployment questions during ordinary implementation unless the user
has already requested deployment.

## Scope Boundary

This workflow targets Data Manager customization only.

Valid work:

- files under `customization/data-manager/`
- behavior or styling loaded by Data Manager branding
- Data Manager-side links or actions that navigate to another module

Out of scope:

- customizing Wrangler, Home, Login, or Data Apps directly
- editing deployment files before the user asks to deploy
- changing ZIP packaging rules beyond the Data Manager `data-manager/...`
  contract

If the user asks for non-Data-Manager customization, say it is outside this Data
Manager branding contract and do not route it to `cloverdx-datamanager-implementer`.

## Ownership

This skill owns:

- user-facing orchestration
- workspace start/reuse/import decisions
- path and ZIP contract for the run
- iteration control
- explicit packaging confirmation
- optional deployment handoff
- final result reporting

This skill does not own:

- ZIP implementation details
- `app.js` / `app.css` implementation details
- server deployment mechanics

Keep those details in `zip-manager`, `cloverdx-datamanager-implementer`, and `cloverdx-datamanager-deployer`.

## Deliverable

Close with a short summary of:

- starting mode used
- main customization behavior changed
- final ZIP path, when packaged
- deployment result, when deployment was requested

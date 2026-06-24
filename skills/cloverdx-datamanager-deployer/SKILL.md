---
name: cloverdx-datamanager-deployer
description: Use when deploying a CloverDX Data Manager customization ZIP to a running server, preparing clover.properties branding lines, generating deploy scripts, or atomically installing output/customization.zip.
---

# CloverDX Data Manager Deployer

## Overview

Use this skill to deploy a packaged Data Manager customization ZIP to a
CloverDX Server.

Input contract:

- `output/customization.zip`

This skill does not create or edit `app.js` or `app.css`. It starts after the
customization ZIP already exists.

## What This Skill Does

- Validates that the ZIP contains `data-manager/app.js` and
  `data-manager/app.css` at the archive root.
- Determines or asks for the target ZIP path on the server.
- Emits the `clover.properties` branding lines for that target.
- Optionally generates a deploy script that atomically installs the ZIP.
- Optionally performs the deploy when the target is writable and the user has
  approved the write.

## Decide What To Load

Always read:

- [`references/deployment.md`](./references/deployment.md) for the Data Manager
  branding deployment facts, property names, ZIP layout, and cache behavior

Read only when script generation is needed:

- [`references/deploy-scripts.md`](./references/deploy-scripts.md) for
  PowerShell and macOS/Linux deploy script templates

## Deploy Modes

Choose the narrowest mode that satisfies the user request.

### Instructions Only

Use when the user wants deploy guidance or the server target is not writable
from this environment.

Produce:

- ZIP validation result
- target path, if known
- `clover.properties` line(s)
- restart and browser-cache expectations

Do not write files.

### Generate Script

Use when the user wants a repeatable deploy command or when direct deployment is
not appropriate.

Produce one script:

- `deploy/deploy.ps1` for Windows
- `deploy/deploy.sh` for macOS/Linux

The script must validate ZIP layout and deploy atomically by copying to a
`.new` sibling before renaming over the target ZIP.

### Direct Deploy

Use only when the user explicitly asks to deploy or approves the target write.

Do:

- validate `output/customization.zip`
- resolve the target ZIP path
- reject unsafe targets
- copy the ZIP to a `.new` sibling
- rename `.new` over the target ZIP

Do not edit `clover.properties` unless the user explicitly approves that edit
and the active config file is clear.

## Required Context

Gather only what is needed for the selected mode:

- Clover server install path, when needed to find `clover.properties` or choose
  a server-local target
- target ZIP path, or approval to use a stable default such as
  `<server>/branding/customization.zip`
- deployment profile: `dev` or `prod`
- operating system, when generating a script
- whether `clover.properties` should be edited or only printed

If the active `clover.properties` path is unknown, search under the server
install path and prefer the file loaded by `-Dclover_config_file` from
`bin/setenv.bat` or `bin/setenv.sh`.

## Profiles

### Dev

Emit:

```properties
webapps.branding.resourceFilePath=<target-zip>
webapps.branding.useCache=false
```

Content changes should not require a server restart while the server cache is
disabled. Adding or changing `resourceFilePath` still requires a restart.
Browser caching can still hide changes; use DevTools "Disable cache" or a hard
refresh.

### Prod

Emit:

```properties
webapps.branding.resourceFilePath=<target-zip>
```

Do not set `webapps.branding.useCache=false` for prod. With the default server
cache, redeploying the ZIP requires a server restart to take effect.

## Path Safety

Before writing or replacing files:

- resolve target paths to absolute paths
- reject empty paths, a drive root, the user home directory, or the repository
  root as a deploy target
- treat replacing the deployed ZIP as expected
- do not overwrite unrelated files
- never overwrite `clover.properties` wholesale
- add or update only the branding lines, and only with explicit user approval

On Windows, write the ZIP path in `clover.properties` with forward slashes or
escaped backslashes. A single backslash is a `.properties` escape character.

## Confirmation

Tell the user how to confirm the deploy without assuming the customization has
a version stamp:

- check the browser Network response for
  `/data-manager/resource/branding/data-manager/app.js`
- check `/data-manager/resource/branding/data-manager/app.css`
- use any console marker or visible UI change present in that customization

## Independence

This skill is intentionally independent.

- Do not invoke other skills.
- Do not assume how the ZIP was produced.
- Do not edit `app.js` or `app.css`.
- Do not decide packaging or implementation details.

## Deliverable

Close with a short summary of:

- selected deploy mode
- target ZIP path
- generated script path, if any
- `clover.properties` line(s)
- profile: `dev` or `prod`
- restart and browser-cache expectations

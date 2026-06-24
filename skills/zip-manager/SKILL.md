---
name: zip-manager
description: Use when unpacking, replacing, or packaging ZIP workspaces, especially when a caller specifies a source ZIP, workspace path, output ZIP path, or required archive root layout.
---

# ZIP Manager

## Overview

Use this skill to manage ZIP workspace preparation and packaging.

This skill creates or unpacks a working directory and packages a requested output ZIP.

## Runtime

This skill uses OS-native commands.

Before running commands, determine whether the environment is macOS/Linux or
Windows, then use the matching command family for that platform.

On macOS/Linux, use standard shell tools such as `mktemp`, `mkdir`, `mv`, `zip`,
and `unzip`.

On Windows, use PowerShell `Expand-Archive` for unzip and
`System.IO.Compression.ZipFile` for packaging.

Do **not** use `Compress-Archive` for packaging. It writes backslash entry
names that Java consumers cannot read. See the `Why Not Compress-Archive`
section below.

Do not rely on any custom script.

## Path Safety

Before any command that removes, replaces, or overwrites files:

- Resolve the workspace and output paths to absolute paths.
- Reject empty paths, `.`, `/`, a drive root, the user home directory, the repository root, and the current working directory.
- Reject paths outside the caller-provided workspace/output scope.
- Treat overwriting an existing workspace or output ZIP as destructive and require that the caller explicitly requested that operation.
- Do not run destructive commands against paths inferred from defaults or partial information.
- Create parent directories only for the explicitly requested workspace or output path.

If a path fails these checks, stop and explain the issue instead of trying a different path.

## Modes

This skill supports two modes:

- `unzip`
- `zip`

The requested mode must be stated explicitly.

## Independence

This skill is intentionally independent.

- Do not invoke other skills.
- Do not assume a specific surrounding workflow.
- Operate only on the requested workspace, ZIP inputs, and ZIP outputs.

## Workspace Contract

For `unzip` mode, the caller must provide:

- the workspace path
- the source ZIP path
- the required root entries or archive root layout, when a specific layout matters

For `zip` mode, the caller must provide:

- the workspace path
- the output ZIP path
- the required root entries or archive root layout, when a specific layout matters

Do not assume any task-specific paths unless they are explicitly provided by the caller.

When packaging, preserve the requested ZIP root layout exactly as specified by the caller.

Do not invent extra wrapper directories.

## `unzip` Mode

Use this mode to unpack an existing ZIP into the requested workspace.

Responsibilities:

- read the requested mode and inputs
- require the source ZIP path
- unpack the source ZIP into the requested workspace path

Rules:

- replace or clear the requested workspace only after path safety checks pass and replacement was explicitly requested
- use the workspace path provided by the caller
- do not invent extra files or directories unless explicitly requested elsewhere
- inspect ZIP entries before replacing the workspace
- reject unsafe archive entries before extraction:
  - absolute paths
  - entries containing `..` path traversal
  - entries that would resolve outside the temporary extraction directory
- prefer unpacking into a temporary directory first, then replacing the workspace only after extraction succeeds
- if the caller requires a specific root layout, inspect the temporary extraction before replacing the workspace

macOS/Linux example:

```text
tmpdir="$(mktemp -d)"
# Inspect the archive first. Reject absolute paths, `..` entries, and entries
# that would resolve outside $tmpdir. Then extract into the temporary directory.
unzip /path/to/source.zip -d "$tmpdir"

# Do not copy the destructive commands below until all path-safety checks above
# have passed and the caller explicitly approved replacing /path/to/workspace.
rm -rf /path/to/workspace
mkdir -p /path/to
mv "$tmpdir" /path/to/workspace
```

Windows example:

```powershell
powershell -NoProfile -Command "& {
  $ErrorActionPreference = 'Stop';

  $source = 'C:\path\to\source.zip';
  $target = 'C:\path\to\workspace';
  $tmp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString());

  New-Item -ItemType Directory -Path $tmp | Out-Null;

  # Inspect the archive first. Reject absolute paths, '..' entries, and entries
  # that would resolve outside $tmp. Then extract into the temporary directory.
  Expand-Archive -LiteralPath $source -DestinationPath $tmp -Force;

  # Do not copy the destructive commands below until all path-safety checks above
  # have passed and the caller explicitly approved replacing $target.
  if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force;
  }

  New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null;
  Move-Item -LiteralPath $tmp -Destination $target;
}"
```

## `zip` Mode

Use this mode when the requested workspace should be packaged.

Responsibilities:

- read the requested workspace path
- create the parent directory of the requested output ZIP when needed
- package the workspace into the requested output ZIP

Rules:

- preserve the requested ZIP root layout
- do not include the workspace path itself as a parent folder in the archive unless explicitly requested
- set the archive source to the directory whose **contents** should become the ZIP root
- do not modify implementation content except what is necessary to package it
- package only when explicitly requested
- remove an existing output ZIP only after path safety checks pass and replacement was explicitly requested
- write **forward-slash** entry names; do not use `Compress-Archive` on Windows (see the `Why Not Compress-Archive` section)
- after packaging, list or inspect the archive and verify the requested root entries before reporting success

macOS/Linux example:

```text
mkdir -p /path/to/output-parent

# Do not copy the destructive command below until path-safety checks have passed
# and the caller explicitly approved replacing /path/to/output.zip.
rm -f /path/to/output.zip

# Run from the directory whose contents should become the ZIP root.
cd /path/to/workspace && zip -r /path/to/output.zip required-root

# Inspect the result before reporting success, e.g.:
unzip -l /path/to/output.zip
```

Windows example (use `System.IO.Compression`, **not** `Compress-Archive`):

```powershell
powershell -NoProfile -Command "& {
  $ErrorActionPreference = 'Stop';

  # $src is the directory whose contents should become the ZIP root.
  $src = 'C:\path\to\workspace';
  $outputZip = 'C:\path\to\output.zip';
  $outputParent = Split-Path -Parent $outputZip;

  New-Item -ItemType Directory -Path $outputParent -Force | Out-Null;

  # Do not copy the destructive command below until path-safety checks have
  # passed and the caller explicitly approved replacing $outputZip.
  if (Test-Path -LiteralPath $outputZip) {
    Remove-Item -LiteralPath $outputZip -Force;
  }

  Add-Type -AssemblyName System.IO.Compression.FileSystem;
  $zip = [System.IO.Compression.ZipFile]::Open($outputZip, 'Create');
  try {
    Get-ChildItem -LiteralPath $src -Recurse -File | ForEach-Object {
      # Build a forward-slash relative entry name so Java consumers can find it.
      $rel = $_.FullName.Substring($src.Length + 1).Replace('\', '/');
      $entry = $zip.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal);
      $stream = $entry.Open();
      try {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName);
        $stream.Write($bytes, 0, $bytes.Length);
      } finally { $stream.Dispose() }
    }
  } finally { $zip.Dispose() }

  # Inspect the result before reporting success. Verify the exact root entries
  # required by the caller.
  $check = [System.IO.Compression.ZipFile]::OpenRead($outputZip);
  try {
    $entries = $check.Entries | ForEach-Object { $_.FullName };
    $entries;
  } finally { $check.Dispose() }
}"
```

## Why Not `Compress-Archive`

`Compress-Archive` writes entry names with backslashes (e.g.
`required-root\file.ext`). Java's `java.util.zip.ZipFile.getEntry(...)` does an
**exact string match** and callers commonly expect forward slashes
(`required-root/file.ext`). A ZIP produced by `Compress-Archive` can therefore
look valid in Windows tools while consumers fail to find entries by name — a
silent, hard-to-trace failure.

Use `System.IO.Compression.ZipFile` + `ZipArchive.CreateEntry(name, level)` and
build forward-slash entry names (as in the example above). Do not "helpfully"
simplify this back to `Compress-Archive`.

## Error Handling

Stop and explain the specific failure when any of these occur:

- missing or unreadable source ZIP
- invalid ZIP structure
- inability to create the requested workspace
- inability to create the requested output path
- packaging failure

## Deliverable

In `unzip` mode, produce:

- the unpacked workspace at the requested path

In `zip` mode, produce:

- the requested output ZIP

Close with a short summary of:

- which mode ran
- which paths were created or packaged

## Caller-Specific Examples

The examples below are product-specific caller contracts layered on top of the
generic ZIP rules above.

## Data Manager Caller Example

This skill is generic. It should verify the archive entries requested by the
caller, not assume a product-specific layout.

For the CloverDX Data Manager customization workflow, the caller should provide:

- workspace path: `customization`
- output ZIP path: `output/customization.zip`
- required archive root layout: `data-manager/...`
- required root entries:
  - `data-manager/app.js`
  - `data-manager/app.css`

In that case, package the **contents** of `customization/` so `data-manager/`
appears directly at the ZIP root, and verify the exact forward-slash entries
`data-manager/app.js` and `data-manager/app.css` before reporting success.

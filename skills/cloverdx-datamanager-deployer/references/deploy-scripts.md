# Deploy Scripts

Use this reference when generating a repeatable deploy script for
`output/customization.zip`.

Generated scripts must:

- verify the source ZIP exists
- verify the ZIP root contains `data-manager/app.js`
- verify the ZIP root contains `data-manager/app.css`
- resolve the target ZIP path before writing
- reject unsafe targets: empty path, filesystem root, user home directory,
  current working directory/repository root, non-`.zip` target, or a target
  whose parent cannot be resolved
- create the target directory when needed
- copy the source archive to a `.new` sibling of the target
- rename `.new` over the target ZIP

The `.new` file must be on the same filesystem as the target ZIP so the final
rename is atomic.

## Windows: `deploy/deploy.ps1`

```powershell
param(
  [string]$Source = "output/customization.zip",
  [Parameter(Mandatory = $true)][string]$Target
)
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Source)) {
  throw "Source ZIP not found: $Source"
}

if ([string]::IsNullOrWhiteSpace($Target)) {
  throw "Target ZIP path must not be empty."
}

$targetFull = [System.IO.Path]::GetFullPath($Target)
$targetDir = [System.IO.Path]::GetDirectoryName($targetFull)
$unsafeTargets = @(
  [System.IO.Path]::GetPathRoot($targetFull).TrimEnd('\', '/'),
  [Environment]::GetFolderPath("UserProfile").TrimEnd('\', '/'),
  (Get-Location).Path.TrimEnd('\', '/')
)

if ([System.IO.Path]::GetExtension($targetFull) -ine ".zip") {
  throw "Target must be a .zip file: $targetFull"
}
if ([string]::IsNullOrWhiteSpace($targetDir)) {
  throw "Unable to resolve target parent directory: $targetFull"
}
if ($unsafeTargets -contains $targetFull.TrimEnd('\', '/') -or
    $unsafeTargets -contains $targetDir.TrimEnd('\', '/')) {
  throw "Unsafe deploy target: $targetFull"
}
if (Test-Path -LiteralPath $targetFull -PathType Container) {
  throw "Target is a directory, expected a ZIP file: $targetFull"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $Source))
try {
  $hasJs = $zip.Entries | Where-Object { $_.FullName -eq "data-manager/app.js" }
  $hasCss = $zip.Entries | Where-Object { $_.FullName -eq "data-manager/app.css" }
  if (-not ($hasJs -and $hasCss)) {
    throw "ZIP root must contain data-manager/app.js and data-manager/app.css."
  }
} finally {
  $zip.Dispose()
}

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

$new = "$targetFull.new"
Copy-Item -LiteralPath $Source -Destination $new -Force
Move-Item -LiteralPath $new -Destination $targetFull -Force

Write-Output "Deployed $Source -> $targetFull"
```

## macOS/Linux: `deploy/deploy.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-output/customization.zip}"
TARGET="${2:?usage: deploy.sh [source.zip] <target.zip>}"

[ -f "$SOURCE" ] || {
  echo "Source ZIP not found: $SOURCE" >&2
  exit 1
}

if [ -z "${TARGET//[[:space:]]/}" ]; then
  echo "Target ZIP path must not be empty." >&2
  exit 1
fi

if [ "${TARGET##*.}" != "zip" ]; then
  echo "Target must be a .zip file: $TARGET" >&2
  exit 1
fi

if [ -d "$TARGET" ]; then
  echo "Target is a directory, expected a ZIP file: $TARGET" >&2
  exit 1
fi

TARGET_DIR="$(dirname "$TARGET")"
TARGET_NAME="$(basename "$TARGET")"

case "$TARGET_DIR" in
  /|"$HOME"|.) 
    echo "Unsafe deploy target directory: $TARGET_DIR" >&2
    exit 1
    ;;
esac

mkdir -p "$TARGET_DIR"
TARGET_DIR_REAL="$(cd "$TARGET_DIR" && pwd -P)"
TARGET_REAL="$TARGET_DIR_REAL/$TARGET_NAME"
HOME_REAL="$(cd "$HOME" && pwd -P)"
CWD_REAL="$(pwd -P)"

case "$TARGET_REAL:$TARGET_DIR_REAL" in
  "/:"*|"$HOME_REAL:"*|"$CWD_REAL:"*|*":/"|*":$HOME_REAL"|*":$CWD_REAL")
    echo "Unsafe deploy target: $TARGET_REAL" >&2
    exit 1
    ;;
esac

unzip -Z1 "$SOURCE" | grep -Fxq "data-manager/app.js" || {
  echo "missing data-manager/app.js" >&2
  exit 1
}

unzip -Z1 "$SOURCE" | grep -Fxq "data-manager/app.css" || {
  echo "missing data-manager/app.css" >&2
  exit 1
}

cp "$SOURCE" "$TARGET_REAL.new"
mv "$TARGET_REAL.new" "$TARGET_REAL"

echo "Deployed $SOURCE -> $TARGET_REAL"
```

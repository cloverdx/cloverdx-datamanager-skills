# Data Manager Branding Deployment

Use this reference when the customization ZIP needs to reach a running CloverDX
Server. The customization workflow produces `output/customization.zip`; this
file explains everything between that ZIP and a browser loading the new
`app.js`/`app.css`.

For end-to-end deployment, the `cloverdx-datamanager-deployer` skill wraps this reference.
Generate scripts from [`deploy-scripts.md`](./deploy-scripts.md) only when the
selected deploy mode needs a repeatable script.

## When To Use

Use this reference for server-side deployment facts:

- where the branding ZIP path is configured
- what ZIP layout Data Manager expects
- how branded resources are served
- what cache behavior affects redeploys
- why atomic ZIP replacement matters

Do not use this reference for:

- implementing `app.js` or `app.css`
- preparing the customization workspace
- packaging ZIPs beyond confirming the server-expected layout
- general CloverDX Server deployment unrelated to Data Manager branding

## The Branding Property

The server reads custom Data Manager resources from a single property:

```properties
webapps.branding.resourceFilePath=<path>
```

The value is a **path to a ZIP file**, not a directory. This is the single most
misunderstood fact about deployment. Confirmed in the server bytecode:
`BrandingResourceProvider.gs(String)` opens the value with `new ZipFile(path)`
and looks resources up as ZIP entries.

Rules:

- Point it at the `.zip` file itself, e.g.
  `C:/clover/branding/customization.zip`, **not** at a folder.
- On Windows, use forward slashes (`C:/clover/...`) or escaped backslashes
  (`C:\\clover\\...`). A single backslash in a `.properties` file is an escape
  character and will corrupt the path.
- If the path is missing or unreadable, the server throws
  `CloverServerException` while initializing the Spring bean and the
  `WebappsDispatcher` servlet fails to start. A broken branding path can take
  down server startup — verify the path before restarting.

## Where The Property Goes

Put the line in the active Clover user-config file loaded by
`-Dclover_config_file` from `bin/setenv.bat` or `bin/setenv.sh`.

The exact file path varies by server packaging. Observed locations include:

```text
<server>/cloverconf/clover.properties
<server>/conf/clover.properties
```

Search for the active `clover.properties` instead of hardcoding the path. The
right file is typically the one that also defines `sandboxes.home` and the JDBC
settings. Prefer editing that user-config file over an OS environment variable
or editing the launcher script; those alternatives are harder for the next
person to find and may not survive upgrades.

## ZIP Layout The Server Expects

For Data Manager, the ZIP root must contain a `data-manager/` directory
directly, with the resources inside it:

```text
customization.zip
└── data-manager/
    ├── app.css
    ├── app.js
    └── <any other shipped resources, e.g. help.html, images/...>
```

This differs from the older `data-app/` / `login/` layout described by the
official branding docs (see
[below](#data-manager-layout-differs-from-legacy-branding-docs)); that page
documents an earlier `data-apps` branding era and does **not** describe the
`data-manager/` module layout.

Any extra files you ship in the ZIP under `data-manager/` are served too — see
[How Resources Are Served](#how-resources-are-served).

> On Windows, build the ZIP with forward-slash entry names. `Compress-Archive`
> writes backslash entry names that the server's `ZipFile.getEntry(...)` cannot
> match, producing 404s on every branding file. See `zip-manager` for the
> correct packaging command.

## How Resources Are Served

The SPA shell JSP renders relative `<link>`/`<script>` URLs of the form:

```text
data-manager/resource/branding/data-manager/app.css
data-manager/resource/branding/data-manager/app.js
```

Any file you ship inside the ZIP's `data-manager/` directory is served at:

```text
/<contextPath>/data-manager/resource/branding/data-manager/<path-inside-zip>
```

So a shipped `data-manager/help.html` is served at
`/<contextPath>/data-manager/resource/branding/data-manager/help.html`.

## The Trailing-Slash Gotcha

The rendered resource URLs are **relative**, so they resolve against the
browser's current URL:

- Visiting `/<contextPath>/data-manager` (no trailing slash) → browser base is
  `/<contextPath>/` → resources resolve correctly to
  `/<contextPath>/data-manager/resource/branding/...`.
- Visiting `/<contextPath>/data-manager/` (trailing slash) → browser base is
  `/<contextPath>/data-manager/` → the relative URL is appended again and lands
  in `/<contextPath>/data-manager/data-manager/resource/...` → 404.

This matters when a customization fetches extra files shipped inside the
branding ZIP, such as `help.html` or images. Do not build those URLs as relative
browser paths. Build them absolutely from the runtime `contextPath`:

```js
const config = JSON.parse(
  document.getElementById("clover-data-manager").dataset.config
);
const base = `${config.contextPath}/data-manager/resource/branding/data-manager`;
const helpUrl = `${base}/help.html`;
```

## The Two Caches

A redeployed ZIP can fail to show up because of two independent caches.

### Server-side branding cache

```properties
webapps.branding.useCache=true   # default
```

`BrandingResourceProvider` holds parsed ZIP entries in memory keyed by entry
name. Once a file has been served, deploying a new ZIP does **not** change what
the server returns until the bean is re-initialized — i.e. a server restart.

### Browser cache

Branding responses are served with:

```text
Cache-Control: max-age=604800
```

That is 7 days. The browser does not even ask the server again until the cache
expires. During iteration you must hard-refresh or use DevTools "Disable cache".

## Recommended Dev Profile

For an iteration loop that doesn't require a restart per change:

- Set `webapps.branding.useCache=false` in `clover.properties` (**dev only**).
- Open DevTools → Network → check "Disable cache" while iterating (only
  effective while DevTools is open).

Turn the server cache back on for production (`useCache=true` or remove the
line).

## Atomic Deploy

The server may hold an open `ZipFile` handle on the deployed file. Writing the
ZIP in place can let an in-flight read see a half-written archive.

Deploy atomically: write to a `.new` sibling, then rename over the in-place
file. Rename is atomic on the same volume, so a concurrent reader sees either
the old complete file or the new complete file, never a partial one.

```text
customization.zip.new   # write the new archive here
customization.zip       # then rename .new over this
```

The `cloverdx-datamanager-deployer` skill can generate a deploy script that does this when the
selected deploy mode calls for one.

## Validation Checklist

Before restart or handoff, confirm:

- `webapps.branding.resourceFilePath` points to the `.zip` file, not a
  directory
- the target ZIP path exists and is readable by the server process
- Windows property paths use forward slashes or escaped backslashes
- the ZIP contains exact root entries `data-manager/app.js` and
  `data-manager/app.css`
- the ZIP was not written in place; replacement used a `.new` sibling and rename
- the chosen profile is clear: `dev` with `webapps.branding.useCache=false`, or
  `prod` with server cache enabled
- browser cache expectations are communicated

## Data Manager Layout Differs From Legacy Branding Docs

The official Clover branding page (`admin/data-apps-branding.html`) describes
the older `data-apps` / `data-app` / `login` layout, not the `data-manager/`
module layout used here. Do not follow it for Data Manager branding. The facts
in this reference were confirmed against a running 7.5.0 server (rendered JSP +
`BrandingResourceProvider` bytecode), which is authoritative for the
`data-manager/` case.

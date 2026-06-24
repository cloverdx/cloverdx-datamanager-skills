# Data Manager Internal API

Use this reference when a customization needs private Data Manager server API details.

This is not the supported customization contract. The private API may differ across versions.

## Verify Against Live OpenAPI

When private API details are needed, fetch the live OpenAPI from the running
Data Manager.

The user may provide a server URL, a Clover URL, or a Data Manager URL.
Normalize it to the Clover root and then fetch:

```text
<clover-root>/api/data-manager/v1/data-manager-openapi.yaml
```

Examples:

```text
http://example.com:8080/clover
  -> http://example.com:8080/clover/api/data-manager/v1/data-manager-openapi.yaml

http://example.com:8080/clover/data-manager
  -> http://example.com:8080/clover/api/data-manager/v1/data-manager-openapi.yaml
```

Treat that live OpenAPI as authoritative for endpoint paths, parameters,
request bodies, and response shapes.

## Authentication For Live-Inspection

Data Manager uses two different auth mechanisms depending on what you fetch.

- The Data Manager **private API** (`/api/data-manager/v1/...`) accepts **HTTP Basic
  auth** directly.
- The Data Manager **SPA shell** (`/data-manager`) requires a **session cookie**. Obtain a
  `JSESSIONID` by POSTing a form-encoded body `u=<user>&p=<pass>` to
  `/api/common/login`; the `Set-Cookie` in the response is then usable for any
  SPA-side route.

## When To Use

Use the live OpenAPI when the task depends on:

- Exact private endpoint paths
- Request or response shapes
- Query parameters or headers
- Lookup or configuration endpoint details
- Transactional vs reference row operation differences
- Version-specific behavior of the private server API

## When Not To Use

Do not use this reference instead of:

- Supported customization hooks and context: `datamanager-customization-api.md`
- DevExtreme-specific behavior: `devextreme-patterns.md`
- JS authoring guidance: `js-customization-patterns.md`
- CSS authoring guidance: `css-customization-patterns.md`

Do not replace the supported customization contract with private API usage unless the task truly needs server-request knowledge.

## Grid Row Data Vs Raw API Data

DataGrid row objects are not the same thing as raw API row responses.

For example, row status is available in the grid row `_id` cell envelope as
`rowData._id.status`. Do not assume the same field exists in a raw private API
response. When a customization depends on raw API data, confirm the response
shape in the live OpenAPI.

A plain `cellValue(rowData._id)` helper returns only the row id value; it strips
cell metadata such as status.

## Rule

Fetch the live OpenAPI before depending on private API details.

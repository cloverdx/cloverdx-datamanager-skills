# CloverDX Data Manager Skills

Reusable agent skills for customizing CloverDX Data Manager through a ZIP-based
workflow.

These skills are designed to be installed together as one bundle. They call
into each other and split responsibilities across the workflow, so installing
only one skill is not the intended setup.

## Version

This is version 1 of the skills. It supports **CloverDX 7.6 and older**. The
install commands below pin it with the `v1` tag.

## Install

### Any agent (via `npx skills`)

If your agent supports the open Agent Skills ecosystem, install this repository
from GitHub with:

```bash
npx skills add cloverdx/cloverdx-datamanager-skills@v1 --all
```

This installs all skills from this repository for all supported agents. For a
user-level install instead of a project-level install, add `-g`.

### Claude Code

Install this repository through the Claude Code plugin manager:

```text
/plugin marketplace add cloverdx/cloverdx-datamanager-skills#v1
/plugin install cloverdx-datamanager-skills@cloverdx-skills
```

You can also copy the skill folders into your local Claude skills directory if
you prefer a plain skills install.

### Codex

Install this repository through the Codex plugin manager:

```bash
codex plugin marketplace add cloverdx/cloverdx-datamanager-skills@v1
```

Then open `/plugins` in Codex and install `cloverdx-datamanager-skills`.

## Getting Started

Start with `cloverdx-datamanager-customizer`.

`cloverdx-datamanager-customizer` is the user-facing entrypoint. It chooses the workspace mode,
keeps the customization run on the right paths, coordinates iteration, packages
the final ZIP, and optionally hands deployment to `cloverdx-datamanager-deployer`.

## Skills

These skills work as a coordinated set:

- `cloverdx-datamanager-customizer` is the user-facing entrypoint.
- `cloverdx-datamanager-implementer` handles implementation work.
- `zip-manager` handles ZIP import and packaging.
- `cloverdx-datamanager-deployer` handles optional deployment.

### `cloverdx-datamanager-customizer`

Orchestrates the end-to-end Data Manager customization workflow.

### `cloverdx-datamanager-implementer`

Implements behavior and styling in:

```text
customization/data-manager/app.js
customization/data-manager/app.css
```

It also ships references, examples, and a TypeScript definitions file for
authoring help.

### `zip-manager`

Unpacks and repackages customization ZIP workspaces while preserving the
required archive layout.

### `cloverdx-datamanager-deployer`

Prepares or performs deployment of the packaged customization ZIP to a running
CloverDX Server.

## Expected Output

The normal authoring result is:

```text
output/customization.zip
```

The ZIP root must contain:

```text
data-manager/
  app.js
  app.css
```

## Usage and licensing

Feel free to reuse or fork these skills and accompanying materials in your own
CloverDX solutions.

The content in this repository is provided on an "as is" basis, without
warranties or conditions of any kind, either express or implied, including,
without limitation, any warranties or conditions of title, non-infringement,
merchantability, or fitness for a particular purpose. Unless otherwise
specified, the content in this repository is licensed under the Apache 2.0
license.

## Contributing

We welcome your feedback and contributions. You can:

- submit comments or pull requests here on GitHub,
- reach out to us through cloverdx.com.

# CSS Customization Patterns

Use this reference when shaping or editing `app.css` for Data Manager customizations.

## Primary Rule

Prefer static styling in `app.css` and keep JavaScript styling only for values that must be computed at runtime.

Start with:

- Existing `customization/data-manager/app.css`
- The page structure exposed by `datamanager-customization-api.md`
- Stable mounts marked with `data-dm-customization-mount`
- Your own injected classes and `data-dm-custom` attributes

## File Role

`app.css` should contain:

- Styling for injected UI
- Page-level visual adjustments
- Layout tweaks that can be expressed safely through CSS
- Small overrides that make custom UI feel native to Data Manager

Avoid moving behavior into CSS when the change really depends on hook logic or runtime state.

## Naming And Scope

Namespace custom classes you create with `dmc-`.

Good patterns:

- `.dmc-banner`
- `.dmc-sidepanel-section`
- `[data-dm-custom="status-chip"]`

Use `data-dm-custom` only for elements created by the customization. Do not add
or assume it on host markup unless the customization code explicitly injects it.

Do not rename, imitate, or invent host Data Manager classes. Host class names are
implementation details unless they have been verified for the target version.

Prefer selectors rooted under a custom `dmc-` container or a `data-dm-custom`
node so styles do not leak into unrelated page areas.

Avoid:

- Broad global selectors
- Overly deep selectors tied to private internal markup
- Styling by text content or positional selectors when a custom class can be added instead
- App-wide `html`, `body`, or root application overrides unless the user
  explicitly asks for a global visual change

## Units And Tokens

Prefer `rem` for:

- Font sizes
- Spacing

For widths and heights, prefer flexible layout values first, such as `%`, `auto`, `minmax()`, `fr`, and `clamp()`. Use `rem` when the size is intentionally fixed relative to the page type scale.

When the user does not request a visual departure, match the existing Data Manager styling. Preserve surrounding spacing, radii, typography, and visual rhythm rather than inventing a second design language.

## Styling Strategy

Prefer:

- One clear root class per injected feature
- Small composable modifier classes when needed
- CSS variables only when they simplify repeated values in the customization

Avoid:

- Inline style strings in JavaScript for static presentation
- Deep specificity wars
- `!important` unless overriding host styles is truly unavoidable

## Working With Host Markup

Selector priority:

1. Your own injected root, class, or `data-dm-custom` attribute.
2. A stable mount from the customization contract, such as
   `[data-dm-customization-mount="header"]`.
3. A narrow host selector verified by live inspection or an existing local
   customization.

Prefer styling your own injected elements first. Reach into host markup only
when the requested change cannot be implemented from custom elements or stable
mounts.

If host markup must be targeted:

- Use the smallest stable selector you can justify
- Keep the override narrow in scope
- Document the assumption in code only when the selector is genuinely fragile

Do not treat undocumented internal class names as stable by default.

## Responsive And Layout Safety

Custom UI should work in both narrower and wider Data Manager layouts.

Prefer:

- Flexible widths
- Wrapping layouts
- Gaps over margin chains
- Alignment that tolerates translated or longer text

Avoid fixed pixel layouts unless the component truly requires them.

## Safe Visual Customization

By default, make UI customizations look and feel like Data Manager already does.

When the user does not explicitly ask for a strong redesign:

- Inherit Data Manager font and color when possible
- Preserve the existing font family
- Preserve existing size rhythm
- Fit custom colors into the surrounding palette
- Make additions feel native to the page

When the user does explicitly ask for a visual departure, keep selectors scoped so the customization does not accidentally repaint unrelated parts of the application.

## Anti-Patterns

- Styling the whole page through `body` when only one mount area is involved
- Resetting global fonts, colors, or box model for all Data Manager content
- Coupling selectors to fragile nested markup
- Using CSS to fake state that JavaScript should control
- Copying large host style blocks instead of adding narrow overrides

# MoonlightQ conventions for building with these components

**Setup.** Load in this order: `_vendor/react.js` (sets `window.React` and `window.ReactDOM`), then `_ds_bundle.js` (sets `window.MOONLIGHTQ`), then `styles.css`. Components are at `window.MOONLIGHTQ.<Name>`, e.g. `MOONLIGHTQ.Button`, and icons at `MOONLIGHTQ.Icons.<Name>Icon`. No provider or wrapper is needed: every component renders standalone. Modal, ConfirmDialog and Tooltip use portals.

**Styling: utility classes, not props.** Components take `className` and expect Tailwind-style utilities from `_ds_bundle.css`. Use only classes that exist there.
- Surfaces: `bg-canvas` (page ground), `bg-surface`, `bg-surface-secondary`, `bg-surface-tertiary`, `bg-surface-elevated`.
- Borders: `border-border`, `border-border-light`, `border-border-strong`.
- Text: `text-text`, `text-text-secondary`, `text-text-muted`.
- Tones: `primary`, `danger`, `success`, `warning`, `info`, `accent`. Solid fill is `bg-primary`; text is `text-primary`; soft chips use the opacity form `bg-primary/10`.
- Size and shape: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`; `h-8`, `h-9`, `h-10`; `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`; `shadow-xs` through `shadow-xl`; `gap-*`, `p-*` on the 4px scale; `font-mono` for code, branches and ids.
- Raw CSS: colors are hex tokens, so write `var(--primary)` directly, e.g. `background: var(--surface)`.

**Where the truth lives.** Read `_ds_bundle.css` before styling for the real class list, and `components/<group>/<Name>/<Name>.prompt.md` for each component's props and usage. `tokens/tokens.json` lists the token names.

**Build snippet.** A control from the library inside the agent's own layout:
```jsx
<div className="flex flex-col gap-4 p-6 bg-canvas">
  <MOONLIGHTQ.PageHeader title="Board" />
  <MOONLIGHTQ.Button variant="primary" size="md" icon={MOONLIGHTQ.Icons.AddIcon}>New task</MOONLIGHTQ.Button>
</div>
```

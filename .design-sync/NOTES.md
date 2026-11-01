# design-sync notes (moonlight-task-queue)

- Off-script layout. The DS is a prebuilt bundle, `design-system/components/bundle.js` + `bundle.css`, produced by `bun run design-system:build` (`design-system/scripts/build.ts`). There is no library `dist/` or `.d.ts`, so the converter entry is not used. `.design-sync/build-layout.mjs` assembles `ds-bundle/` from that bundle, the per-component `preview.html` cards, and `index.d.ts` split per component. Re-sync = run `bun run design-system:build`, then `node .design-sync/build-layout.mjs`, then `node .ds-sync/package-validate.mjs ./ds-bundle`.
- No `_ds_sync.json` anchor is written, so every future sync re-verifies and re-uploads everything.
- `TaskCard` preview fixture drift: `design-system/components/TaskCard/preview.html` builds tasks without `producers`, `codeRound`, `planRound` and `roundBaseline`, so the card crashes ("reading 'code'"). `build-layout.mjs` patches the fixture in `ds-bundle/` only. Fix the source preview to match the `Task` type.
- `design-system/README.md` names type classes (`page-title`, `body`, `label`, `caption`, `eyebrow`, `stat`, `dialog-title`) and `font-sans`, `z-modal`, which do not exist in `bundle.css`. The conventions header lists only verified classes.
- Token format: `tokens.css` colors are hex, and the bundle reads them through `color-mix(in srgb, var(--x) ...)`. Both agree. Do not switch to RGB channel triples.
- Known render notes: `EmptyState` renders two cards side by side, and the second is clipped by its grid cell. `Tooltip` shows only its trigger, since the tooltip is hover-only. `Icons` and `Cover` are not bundle components and get no cards.
- Render check: Playwright and Chromium 1248 are installed under `.ds-sync/`. 24/24 render clean. Contact sheets reviewed on the first run.

## Re-sync risks
- `styles.css` imports Google Fonts (Inter, JetBrains Mono) rather than shipping font files, so the fonts depend on the network at runtime.
- The `TaskCard` patch and the `.render-check` fixture depend on the `Task` shape in `packages/shared`. If that type changes, update the fixture.

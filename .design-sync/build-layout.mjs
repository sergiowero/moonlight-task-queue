// Off-script layout for design-system/ (prebuilt bundle, no library dist). Writes ds-bundle/.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const comp = join(root, 'design-system/components');
const out = join(root, 'ds-bundle');
const NAMES = ['Button','IconButton','CopyButton','Input','Textarea','Select','Field','Checkbox','Toggle','SegmentedControl','Tabs','Badge','StatusBadge','CountPill','Alert','Spinner','Skeleton','EmptyState','Tooltip','Modal','ConfirmDialog','PageHeader','TaskCard','ConversationEntryCard'];

// Split index.d.ts into top-level blocks.
const dts = readFileSync(join(comp, 'index.d.ts'), 'utf8').split('\n');
const headerEnd = dts.findIndex(l => l.startsWith('export'));
const header = dts.slice(0, headerEnd).join('\n');
const blocks = [];
for (let i = headerEnd; i < dts.length; i++) {
  if (dts[i].startsWith('export')) blocks.push([dts[i]]);
  else if (blocks.length) blocks[blocks.length - 1].push(dts[i]);
}
const groupOf = {};
const blockText = b => b.join('\n').trimEnd();

for (const n of NAMES) {
  const first = readFileSync(join(comp, n, 'preview.html'), 'utf8').split('\n')[0];
  groupOf[n] = first.match(/group="([^"]+)"/)[1];
}

let count = 0;
for (const n of NAMES) {
  const dir = join(out, 'components', groupOf[n].toLowerCase(), n);
  mkdirSync(dir, { recursive: true });
  const rel = '../../../';

  // .d.ts: shared Tone + blocks naming this component.
  const re = new RegExp(`\\b(${n}|${n}Props)\\b`);
  const picked = blocks.filter(b => re.test(b[0]) || /\bTone\b/.test(b[0]) && b[0].includes('export type Tone'));
  writeFileSync(join(dir, `${n}.d.ts`), [header, ...picked.map(blockText)].join('\n\n') + '\n');

  // .jsx: runtime re-export from the bundle global.
  writeFileSync(join(dir, `${n}.jsx`), `// Runtime re-export of window.MOONLIGHTQ.${n} (see _ds_bundle.js).\nexport const ${n} = window.MOONLIGHTQ.${n};\nexport default ${n};\n`);

  // .prompt.md: summary as first line, then the component README.
  const readme = readFileSync(join(comp, n, 'README.md'), 'utf8').split('\n');
  const summary = readme.find((l, i) => i > 0 && l.trim() && !l.startsWith('#')).trim();
  const body = readme.slice(1).join('\n').trim();
  writeFileSync(join(dir, `${n}.prompt.md`), `${n}: ${summary}\n\n${body}\n`);

  // .html: existing hand-written preview card, with host scripts and styles injected.
  let html = readFileSync(join(comp, n, 'preview.html'), 'utf8');
  const inject = `<head><link rel="stylesheet" href="${rel}styles.css"><script src="${rel}_vendor/react.js"></script><script src="${rel}_ds_bundle.js"></script>`;
  if (!html.includes('<head>')) throw new Error(`no <head> in ${n}`);
  html = html.replace('<head>', inject);
  // Fixture drift: reviewRoundChip reads task.producers.code; the hand-written TaskCard preview omits producers.
  if (n === 'TaskCard') html = html.replace("projectId: null, worktreePath: null", "producers: {}, codeRound: 0, planRound: 0, roundBaseline: {}, projectId: null, worktreePath: null");
  writeFileSync(join(dir, `${n}.html`), html);
  count++;
}

import { readFileSync as rfs2 } from 'node:fs';
writeFileSync(join(out, 'README.md'), rfs2(join(root, '.design-sync/conventions.md'), 'utf8') + '\n\n' + rfs2(join(root, 'design-system/README.md'), 'utf8'));
writeFileSync(join(out, 'styles.css'),
`@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap");
@import "./tokens/tokens.css";
@import "./_ds_bundle.css";
`);
// Re-stamp the @ds-bundle header with the converter's helper (sourceHashes, inlinedExternals).
const { readFileSync: rf, writeFileSync: wf } = await import('node:fs');
const bundlePath = join(out, '_ds_bundle.js');
const raw = rf(bundlePath, 'utf8').replace(/^\/\* @ds-bundle: .*? \*\/\n/, '');
wf(bundlePath, raw);
const { stampHeader } = await import(new URL('../.ds-sync/lib/bundle.mjs', import.meta.url).href);
stampHeader(bundlePath, { namespace: 'MOONLIGHTQ', components: NAMES.map(n => ({ name: n, group: groupOf[n].toLowerCase() })), inlinedExternals: [] });
writeFileSync(join(out, '.ds-build-meta.json'), JSON.stringify({ componentCount: count, shape: 'package', offScript: true }, null, 2));
console.log(`wrote ${count} components`);

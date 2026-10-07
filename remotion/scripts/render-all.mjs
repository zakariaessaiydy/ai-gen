// Bulk renderer: reuses the cached bundle, renders every shot in the manifest.
//   node scripts/render-all.mjs                 -> render all
//   node scripts/render-all.mjs Short14Seed     -> render only these ids
//   node scripts/render-all.mjs Short14Seed --scale=1     -> 1080x1920 delivery master
//   node scripts/render-all.mjs Short14Seed --draft       -> scale .5 / crf 30: motion check, ~4x faster
//   node scripts/render-all.mjs --still         -> render a poster PNG per shot instead of video
//   node scripts/render-all.mjs X --range=300-600         -> only that frame range (a re-check)
// Opaque shots -> out/<id>.mp4 (h264). transparent:true shots -> out/<id>.mov (ProRes 4444 + alpha).
// Default scale 2 (author 1080p -> 4K) to composite crisply over a 4K master; shorts pass --scale=1.
import { selectComposition, renderMedia, renderStill } from '@remotion/renderer';
import { readFileSync, mkdirSync } from 'fs';
import path from 'path';
import { getServeUrl, REMOTION_ROOT as root } from './lib/bundle-cache.mjs';
import { generate } from './gen-registry.mjs';

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : dflt;
};
const has = (name) => args.includes(`--${name}`);

const stillMode = has('still');
const draft = has('draft');
const SCALE = Number(flag('scale', draft ? 0.5 : 2));
const CRF = Number(flag('crf', draft ? 30 : 18));
const CONCURRENCY = flag('concurrency', null);
const range = flag('range', null);
const onlyIds = args.filter((a) => !a.startsWith('--'));

let frameRange;
if (range) {
  frameRange = range.split('-').map(Number);
  const ok = frameRange.length === 2 && frameRange.every(Number.isInteger) && frameRange[0] <= frameRange[1];
  if (!ok) { console.error(`bad --range="${range}" — expected <from>-<to>, e.g. --range=300-600`); process.exit(1); }
}

generate({ quiet: true }); // a freshly added shot must not need a manual `npm run gen`
const manifest = JSON.parse(readFileSync(path.join(root, 'src', 'shots.manifest.json'), 'utf8'));
const unknown = onlyIds.filter((id) => !manifest.some((s) => s.id === id));
if (unknown.length) {
  console.error(`unknown composition id(s): ${unknown.join(', ')} — no compositionConfig in src/shots declares them`);
  process.exit(1);
}
const outDir = path.join(root, 'out');
mkdirSync(outDir, { recursive: true });

const serveUrl = await getServeUrl();

let n = 0;
const failed = [];
const t0 = Date.now();
for (const shot of manifest) {
  if (onlyIds.length && !onlyIds.includes(shot.id)) continue;
  try { // one broken shot must not abort a whole batch
    const composition = await selectComposition({ serveUrl, id: shot.id });

    if (stillMode) {
      const out = path.join(outDir, `${shot.id}.png`);
      await renderStill({
        serveUrl, composition, output: out, scale: SCALE, overwrite: true,
        frame: Math.floor(composition.durationInFrames * 0.6),
        imageFormat: shot.transparent ? 'png' : 'jpeg',
      });
      console.log('  still ->', path.relative(root, out));
    } else {
      const transparent = !!shot.transparent;
      const suffix = draft ? '-draft' : '';
      const out = path.join(outDir, `${shot.id}${suffix}.${transparent ? 'mov' : 'mp4'}`);
      let last = -1;
      await renderMedia({
        serveUrl, composition, outputLocation: out, scale: SCALE, overwrite: true,
        codec: transparent ? 'prores' : 'h264',
        proResProfile: transparent ? '4444' : undefined,
        pixelFormat: transparent ? 'yuva444p10le' : 'yuv420p',
        imageFormat: transparent ? 'png' : 'jpeg',
        crf: transparent ? undefined : CRF,
        frameRange,
        concurrency: CONCURRENCY ? Number(CONCURRENCY) : undefined,
        // one line per 5% instead of one per frame — the old progress spam was thousands of
        // lines in a log a human or an agent then has to scroll through
        onProgress: ({ progress }) => {
          const pct = Math.floor(progress * 20) * 5;
          if (pct > last) { last = pct; process.stdout.write(`\r  ${shot.id}: ${pct}%   `); }
        },
      });
      process.stdout.write('\n');
      console.log('  ->', path.relative(root, out));
    }
    n++;
  } catch (e) {
    process.stdout.write('\n');
    console.error(`  FAILED ${shot.id}: ${e?.message ?? e}`);
    failed.push(shot.id);
  }
}
console.log(`done: ${n} shot(s) in ${((Date.now() - t0) / 1000).toFixed(1)}s -> out/`);
if (failed.length) console.error(`failed: ${failed.length} — ${failed.join(', ')}`);

await new Promise((r) => process.stdout.write('', r));
process.exit(failed.length ? 1 : 0);

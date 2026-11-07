// Bulk renderer: reuses the cached bundle, renders every shot in the manifest.
//   node scripts/render-all.mjs                 -> render all
//   node scripts/render-all.mjs Short14Seed     -> render only these ids
//   node scripts/render-all.mjs Short14Seed --scale=1     -> 1080x1920 delivery master
//   node scripts/render-all.mjs Short14Seed --draft       -> scale .5 / crf 30: motion check, ~4x faster
//   node scripts/render-all.mjs --still         -> render a poster PNG per shot instead of video
//   node scripts/render-all.mjs X --range=300-600         -> only that frame range (a re-check)
//   node scripts/render-all.mjs X --chunk=1800            -> render in 1800-frame pieces (default for videos
//        over 2 min; --chunk=0 = one piece). Each piece gets a fresh Chrome, a finished piece is kept in
//        out/.chunks/ and reused on a rerun, a failed piece is retried twice, then the pieces are joined with
//        no re-encode. This is what stops long kids episodes dying at 70% on a PC low on RAM (Windows: FFmpeg
//        code 3221225794, node exit 4294967295, Chrome "Target closed").
// Opaque shots -> out/<id>.mp4 (h264). transparent:true shots -> out/<id>.mov (ProRes 4444 + alpha).
// Default scale 2 (author 1080p -> 4K) to composite crisply over a 4K master; shorts pass --scale=1.
import { selectComposition, renderMedia, renderStill } from '@remotion/renderer';
import { readFileSync, mkdirSync, existsSync, writeFileSync, renameSync, rmSync, readdirSync } from 'fs';
import { spawnSync } from 'child_process';
import { findFfmpeg } from './lib/ffmpeg.mjs';
import path from 'path';
import { getServeUrl, REMOTION_ROOT as root } from './lib/bundle-cache.mjs';
import { generate } from './gen-registry.mjs';
// REMOTION_BROWSER: use an installed Chrome/Chromium instead of letting Remotion download its own
const browserExecutable = process.env.REMOTION_BROWSER || null;

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
const CHUNK_FLAG = flag('chunk', null);
const RETRIES = 2;
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

// ── chunked render: pieces keyed on the bundle (= src + media) and the encode settings, so an edit
// re-renders everything but a crash/rerun only redoes the missing pieces
async function renderChunked(id, opts, total, chunk, out, transparent) {
  const ext = transparent ? 'mov' : 'mp4';
  const key = `${path.basename(serveUrl)}-s${SCALE}-crf${CRF}-c${chunk}`;
  const dir = path.join(outDir, '.chunks', id, key);
  mkdirSync(dir, { recursive: true });
  // drop pieces of older keys (stale src) for this shot
  for (const d of readdirSync(path.join(outDir, '.chunks', id))) if (d !== key) rmSync(path.join(outDir, '.chunks', id, d), { recursive: true, force: true });
  const parts = [];
  for (let a = 0; a < total; a += chunk) parts.push([a, Math.min(total, a + chunk) - 1]);
  const t1 = Date.now();
  let done = 0;
  for (const [a, b] of parts) {
    const file = path.join(dir, `part-${String(a).padStart(6, '0')}.${ext}`);
    if (existsSync(file)) { done += b - a + 1; continue; } // finished on an earlier run
    for (let tryN = 0; ; tryN++) {
      const tmp = file.replace(`.${ext}`, `.tmp.${ext}`);
      try {
        let last = -1;
        await renderMedia({ browserExecutable,
          ...opts, outputLocation: tmp, frameRange: [a, b],
          onProgress: ({ progress }) => {
            const pct = Math.floor(((done + progress * (b - a + 1)) / total) * 20) * 5;
            if (pct > last) { last = pct; process.stdout.write(`\r  ${id}: ${pct}%  (piece ${parts.findIndex((p) => p[0] === a) + 1}/${parts.length})   `); }
          },
        });
        renameSync(tmp, file); // only a COMPLETE piece gets its final name
        break;
      } catch (e) {
        rmSync(tmp, { force: true });
        if (tryN >= RETRIES) throw e;
        process.stdout.write(`\n  ${id}: piece at frame ${a} failed (${String(e?.message ?? e).slice(0, 120)}) — retry ${tryN + 1}/${RETRIES}\n`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    done += b - a + 1;
  }
  const list = path.join(dir, 'list.txt');
  writeFileSync(list, parts.map(([a]) => `file 'part-${String(a).padStart(6, '0')}.${ext}'`).join('\n') + '\n');
  const ff = findFfmpeg('ffmpeg') || 'ffmpeg';
  const r = spawnSync(ff, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`joining the ${parts.length} pieces failed (ffmpeg exit ${r.status})`);
  process.stdout.write(`\n  ${id}: ${parts.length} pieces joined in ${((Date.now() - t1) / 1000).toFixed(0)}s`);
}

let n = 0;
const failed = [];
const t0 = Date.now();
for (const shot of manifest) {
  if (onlyIds.length && !onlyIds.includes(shot.id)) continue;
  try { // one broken shot must not abort a whole batch
    const composition = await selectComposition({ serveUrl, id: shot.id, browserExecutable });

    if (stillMode) {
      const out = path.join(outDir, `${shot.id}.png`);
      await renderStill({ browserExecutable,
        serveUrl, composition, output: out, scale: SCALE, overwrite: true,
        frame: Math.floor(composition.durationInFrames * 0.6),
        imageFormat: shot.transparent ? 'png' : 'jpeg',
      });
      console.log('  still ->', path.relative(root, out));
    } else {
      const transparent = !!shot.transparent;
      const suffix = draft ? '-draft' : '';
      const out = path.join(outDir, `${shot.id}${suffix}.${transparent ? 'mov' : 'mp4'}`);
      const opts = {
        serveUrl, composition, scale: SCALE, overwrite: true,
        codec: transparent ? 'prores' : 'h264',
        proResProfile: transparent ? '4444' : undefined,
        pixelFormat: transparent ? 'yuva444p10le' : 'yuv420p',
        imageFormat: transparent ? 'png' : 'jpeg',
        crf: transparent ? undefined : CRF,
        concurrency: CONCURRENCY ? Number(CONCURRENCY) : undefined,
      };
      const total = composition.durationInFrames;
      const chunk = CHUNK_FLAG !== null ? Number(CHUNK_FLAG) : total > 3600 ? 1800 : 0;
      if (frameRange || stillMode || !chunk || chunk >= total) {
        let last = -1;
        await renderMedia({ browserExecutable,
          ...opts, outputLocation: out, frameRange,
          // one line per 5% instead of one per frame — the old progress spam was thousands of
          // lines in a log a human or an agent then has to scroll through
          onProgress: ({ progress }) => {
            const pct = Math.floor(progress * 20) * 5;
            if (pct > last) { last = pct; process.stdout.write(`\r  ${shot.id}: ${pct}%   `); }
          },
        });
      } else {
        await renderChunked(shot.id, opts, total, chunk, out, transparent);
      }
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

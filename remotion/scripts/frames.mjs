// QA frame dumper — the phone-scale legibility check, fast.
//
//   node scripts/frames.mjs Short1Chess 0,140,290,540,700       explicit frames
//   node scripts/frames.mjs Short14Seed --beats=shorts/short-14-seed/beats.json
//                                                               frames DERIVED from the beat sheet
//   node scripts/frames.mjs Short14Seed --auto                   beat frames, beats.json auto-found
//   node scripts/frames.mjs Short14Seed 0,300 --no-sheet --scale=0.5
//
// Writes out/qa/<id>-f<frame>.png (always) plus out/qa/<id>-sheet<N>.png contact sheets
// (2x3 grids, labelled with frame + timecode) unless --no-sheet.
//
// Three things make this ~4x faster than one renderStill per process:
//   1. the bundle is cached and only rebuilt when src/ or media/ changed (lib/bundle-cache.mjs)
//   2. ONE headless browser is opened and shared by every still (was: one launch per frame)
//   3. stills render concurrently (--concurrency, default 4)
import { selectComposition, renderStill, openBrowser } from '@remotion/renderer';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { getServeUrl, REMOTION_ROOT as root } from './lib/bundle-cache.mjs';
import { findFfmpeg } from './lib/ffmpeg.mjs';

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : dflt;
};
const has = (name) => args.includes(`--${name}`);

const id = args.find((a) => !a.startsWith('--'));
const framesArg = args.filter((a) => !a.startsWith('--'))[1];
const SCALE = Number(flag('scale', 0.5));
const CONCURRENCY = Math.max(1, Number(flag('concurrency', 4)));
const SHEET = !has('no-sheet');

if (!id) {
  console.error('usage: node scripts/frames.mjs <CompId> [f1,f2,...|--auto|--beats=path] [--scale=0.5]');
  console.error('       [--no-sheet] [--concurrency=4] [--force-bundle]');
  process.exit(1);
}

// ── which frames? ────────────────────────────────────────────────────────────
/** Find a short's beats.json by composition id, e.g. Short14Seed -> shorts/short-14-seed/beats.json */
function findBeats(compId) {
  const repo = path.join(root, '..');
  for (const dir of ['shorts', 'ai-shorts', 'vox-shorts']) {
    const base = path.join(repo, dir);
    if (!existsSync(base)) continue;
    for (const proj of readdirSync(base)) {
      const p = path.join(base, proj, 'beats.json');
      if (!existsSync(p)) continue;
      try {
        if (JSON.parse(readFileSync(p, 'utf8')).composition === compId) return p;
      } catch { /* not ours */ }
    }
  }
  return null;
}

/**
 * QA frames from the beat sheet: frame 0 and 1 (the frame-0-composed rule), each beat's
 * entry+12 frames (after the entry animation lands) and its midpoint, each VO line start,
 * and the last two frames (the loop check). Deduped, capped, sorted.
 */
function framesFromBeats(beatsPath, fps, durationInFrames) {
  const b = JSON.parse(readFileSync(beatsPath, 'utf8'));
  const s2f = (s) => Math.round(Number(s) * fps);
  const out = new Set([0, 1, durationInFrames - 2, durationInFrames - 1]);
  for (const beat of b.beats ?? []) {
    out.add(s2f(beat.start) + 12);
    out.add(s2f((Number(beat.start) + Number(beat.end)) / 2));
  }
  if (!(b.beats ?? []).length) for (const line of b.vo ?? []) out.add(s2f(line.start) + 6);
  return [...out]
    .map((f) => Math.max(0, Math.min(durationInFrames - 1, f)))
    .filter((f, i, a) => a.indexOf(f) === i)
    .sort((x, y) => x - y);
}

// ── render ───────────────────────────────────────────────────────────────────
const outDir = path.join(root, 'out', 'qa');
mkdirSync(outDir, { recursive: true });

const t0 = Date.now();
const serveUrl = await getServeUrl({ force: has('force-bundle') });
const composition = await selectComposition({ serveUrl, id });
const fps = composition.fps;

let frames;
const beatsFlag = flag('beats', null);
if (beatsFlag || has('auto') || !framesArg) {
  const beatsPath = beatsFlag
    ? path.resolve(process.cwd(), beatsFlag)
    : findBeats(id);
  if (!beatsPath || !existsSync(beatsPath)) {
    if (!framesArg) {
      console.error(`no beats.json found for ${id} — pass frames explicitly or --beats=<path>`);
      process.exit(1);
    }
    frames = framesArg.split(',').map((n) => Number(n.trim()));
  } else {
    frames = framesFromBeats(beatsPath, fps, composition.durationInFrames);
    console.log(`frames from ${path.relative(path.join(root, '..'), beatsPath)}: ${frames.join(',')}`);
  }
} else {
  frames = framesArg.split(',').map((n) => Number(n.trim()));
}
frames = frames.map((f) => Math.max(0, Math.min(composition.durationInFrames - 1, f)));

const browser = await openBrowser('chrome', { shouldDumpIo: false });

const results = new Array(frames.length);
let next = 0;
async function worker() {
  while (next < frames.length) {
    const i = next++;
    const f = frames[i];
    const out = path.join(outDir, `${id}-f${String(f).padStart(4, '0')}.png`);
    await renderStill({
      serveUrl, composition, output: out, frame: f, scale: SCALE,
      overwrite: true, imageFormat: 'png', puppeteerInstance: browser,
    });
    results[i] = { frame: f, out };
    process.stdout.write(`  f${f} `);
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, frames.length) }, worker));
process.stdout.write('\n');
await browser.close({ silent: true });

for (const r of results) console.log('  ->', path.relative(root, r.out));

// ── contact sheets ───────────────────────────────────────────────────────────
// One image to read instead of a dozen: 2x3 grids, each tile labelled "f0300 · 10.00s".
// The individual PNGs stay on disk — open one of those whenever a tile looks suspicious.
function makeSheets() {
  const ff = findFfmpeg('ffmpeg');
  if (!ff) { console.log('(no ffmpeg found — skipping contact sheets)'); return; }
  let canLabel = false;
  try {
    canLabel = execFileSync(ff, ['-hide_banner', '-filters'], { encoding: 'utf8' }).includes(' drawtext ');
  } catch { /* keep false */ }
  const font = ['C:/Windows/Fonts/consola.ttf', 'C:/Windows/Fonts/arial.ttf',
    '/System/Library/Fonts/Menlo.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
    .find((p) => existsSync(p));

  const PER = 6, COLS = 2;
  for (let s = 0; s * PER < results.length; s++) {
    const group = results.slice(s * PER, s * PER + PER);
    const inputs = group.flatMap((g) => ['-i', g.out]);
    const parts = group.map((g, i) => {
      const label = `f${String(g.frame).padStart(4, '0')} · ${(g.frame / fps).toFixed(2)}s`;
      const draw = canLabel && font
        ? `,drawtext=fontfile='${font.replace(/:/g, '\\:')}':text='${label}':x=14:y=14:` +
          `fontsize=34:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=10`
        : '';
      return `[${i}:v]scale=540:-1${draw}[v${i}]`;
    });
    const chain = group.map((_, i) => `[v${i}]`).join('');
    const rows = Math.ceil(group.length / COLS);
    const fc = `${parts.join(';')};${chain}concat=n=${group.length}:v=1:a=0[cat];` +
      `[cat]tile=${COLS}x${rows}:padding=8:margin=8:color=0x0B0F14[out]`;
    const sheet = path.join(outDir, `${id}-sheet${s + 1}.png`);
    try {
      execFileSync(ff, ['-y', '-v', 'error', ...inputs, '-filter_complex', fc,
        '-map', '[out]', '-frames:v', '1', sheet], { stdio: 'pipe' });
      console.log('  SHEET ->', path.relative(root, sheet), `(${group.map((g) => 'f' + g.frame).join(', ')})`);
    } catch (e) {
      console.log('  (contact sheet failed:', String(e.stderr ?? e).slice(0, 200), ')');
      return;
    }
  }
}
if (SHEET && results.length > 1) makeSheets();

console.log(`done — ${frames.length} frame(s) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// Remotion leaves compositor/browser handles that keep the loop alive for ~8s after the work
// is done. Flush stdout, then exit — the QA loop is run dozens of times per short.
await new Promise((r) => process.stdout.write('', r));
process.exit(0);

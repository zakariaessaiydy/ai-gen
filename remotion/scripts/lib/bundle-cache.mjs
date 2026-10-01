// Cached Remotion bundler — the QA loop's single biggest tax.
//
// bundle() re-webpacks src/ AND re-copies the 94MB media/ public dir on EVERY invocation
// (~6s warm, ~12s cold). Nothing in a frames/render call changes between runs unless a source
// or asset file changed, so: fingerprint src/ + media/ + package.json, keep the built bundle
// under out/.bundles/<hash>, and reuse it when the fingerprint matches.
//
//   const serveUrl = await getServeUrl();          // cached
//   const serveUrl = await getServeUrl({ force: true });   // rebuild
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE_DIR = path.join(ROOT, 'out', '.bundles');
// Each bundle is ~115MB (it embeds a copy of media/), and rebuilding one costs ~4s — so keep
// only the current fingerprint's bundle and drop the rest.
const KEEP = 1;

function hashTree(h, dir, base) {
  let entries;
  try { entries = readdirSync(dir).sort(); } catch { return; }
  for (const name of entries) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) hashTree(h, p, base);
    else h.update(`${path.relative(base, p).replace(/\\/g, '/')}|${st.size}|${Math.round(st.mtimeMs)}\n`);
  }
}

/** Fingerprint of everything that can change what the bundle contains. */
export function bundleFingerprint() {
  const h = createHash('sha1');
  hashTree(h, path.join(ROOT, 'src'), ROOT);
  hashTree(h, path.join(ROOT, '..', 'media'), path.join(ROOT, '..'));
  h.update(readFileSync(path.join(ROOT, 'package.json')));
  return h.digest('hex').slice(0, 12);
}

function prune(keepHash) {
  let dirs;
  try { dirs = readdirSync(CACHE_DIR); } catch { return; }
  const stamped = dirs
    .filter((d) => d !== keepHash)
    .map((d) => ({ d, t: statSync(path.join(CACHE_DIR, d)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  for (const { d } of stamped.slice(KEEP - 1)) {
    try { rmSync(path.join(CACHE_DIR, d), { recursive: true, force: true }); } catch { /* best effort */ }
  }
}

/**
 * Returns a serveUrl (a bundle directory) for the project, bundling only when the
 * fingerprint changed. Set force:true to always rebuild.
 */
export async function getServeUrl({ force = false, quiet = false } = {}) {
  const hash = bundleFingerprint();
  const dir = path.join(CACHE_DIR, hash);
  const stamp = path.join(dir, '.remotion-bundle-ok');

  if (!force && existsSync(stamp)) {
    if (!quiet) console.log(`bundle: cached (${hash})`);
    return dir;
  }

  if (!quiet) console.log(`bundling (${hash})...`);
  const t0 = Date.now();
  // imported lazily: @remotion/bundler pulls in all of webpack (~4s of module load) and a
  // cache hit never needs it.
  const { bundle } = await import('@remotion/bundler');
  mkdirSync(CACHE_DIR, { recursive: true });
  rmSync(dir, { recursive: true, force: true });
  // publicDir must be passed explicitly: remotion.config.ts only applies to the CLI,
  // not the programmatic bundle() API. ../media is the public root.
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, 'src', 'index.ts'),
    publicDir: path.join(ROOT, '..', 'media'),
    outDir: dir,
  });
  writeFileSync(stamp, hash);
  prune(hash);
  if (!quiet) console.log(`  bundled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return serveUrl;
}

export { ROOT as REMOTION_ROOT };
